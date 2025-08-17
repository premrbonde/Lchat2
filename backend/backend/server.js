const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');
const translationRoutes = require('./routes/translation');

const Message = require('./db/models/Message');
const Conversation = require('./db/models/Conversation');
const User = require('./db/models/User');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://192.168.0.108:8081",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: "http://192.168.0.108:8081",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/translate', translationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Handle user authentication and join
  socket.on('authenticate', async (data) => {
    try {
      const { userId } = data;
      if (userId) {
        connectedUsers.set(socket.id, userId);
        socket.userId = userId;
        
        // Update user's online status
        await User.findByIdAndUpdate(userId, { 
          isOnline: true, 
          lastSeen: new Date() 
        });
        
        // Notify friends about online status
        socket.broadcast.emit('user_online', { userId, isOnline: true });
        
        console.log(`✅ User ${userId} authenticated`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`📱 User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, senderId, text, isTranslated, translatedText, targetLanguage } = data;
      
      // Create new message
      const message = new Message({
        conversationId,
        senderId,
        textOriginal: text,
        textPreprocessed: text, // Will be updated by preprocessing
        textTranslated: translatedText,
        targetLanguage: targetLanguage || 'en',
        isTranslated: isTranslated || false,
        timestamp: new Date()
      });

      await message.save();

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageText: text,
        lastMessageAt: new Date()
      });

      // Populate sender info
      await message.populate('senderId', 'username nickname profilePictureUrl');

      // Emit message to all users in the conversation
      io.to(conversationId).emit('message_received', {
        _id: message._id,
        conversationId: message.conversationId,
        sender: message.senderId,
        textOriginal: message.textOriginal,
        textTranslated: message.textTranslated,
        targetLanguage: message.targetLanguage,
        isTranslated: message.isTranslated,
        timestamp: message.timestamp,
        createdAt: message.createdAt
      });

      console.log(`💬 Message sent in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('user_typing', { userId, isTyping: true });
  });

  socket.on('typing_stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('user_typing', { userId, isTyping: false });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      try {
        // Update user's offline status
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });
        
        // Notify friends about offline status
        socket.broadcast.emit('user_online', { userId, isOnline: false });
        
        connectedUsers.delete(socket.id);
        console.log(`👋 User ${userId} disconnected`);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };