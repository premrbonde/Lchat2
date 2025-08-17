const express = require('express');
const Message = require('../db/models/Message');
const Conversation = require('../db/models/Conversation');
const FriendRequest = require('../db/models/FriendRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// Get conversation messages
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Get messages with pagination
    const messages = await Message.getConversationMessages(
      conversationId, 
      parseInt(page), 
      parseInt(limit)
    );

    // Mark messages as read by current user
    const unreadMessages = messages.filter(msg => 
      msg.senderId._id.toString() !== req.user._id.toString() &&
      !msg.readBy.some(read => read.userId.toString() === req.user._id.toString())
    );

    await Promise.all(
      unreadMessages.map(msg => msg.markAsRead(req.user._id))
    );

    res.json({
      messages: messages.map(msg => ({
        id: msg._id,
        conversationId: msg.conversationId,
        sender: {
          id: msg.senderId._id,
          username: msg.senderId.username,
          nickname: msg.senderId.nickname,
          profilePictureUrl: msg.senderId.profilePictureUrl
        },
        textOriginal: msg.textOriginal,
        textTranslated: msg.textTranslated,
        targetLanguage: msg.targetLanguage,
        isTranslated: msg.isTranslated,
        messageType: msg.messageType,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        replyTo: msg.replyTo,
        reactions: msg.reactions,
        readBy: msg.readBy,
        timestamp: msg.timestamp,
        createdAt: msg.createdAt,
        editedAt: msg.editedAt,
        metadata: msg.metadata
      })).reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(await Message.countDocuments({ 
          conversationId, 
          isDeleted: false 
        }) / parseInt(limit)),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages', error: error.message });
  }
});

// Get or create conversation with friend
router.post('/conversation', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    // Check if users are friends
    const areFriends = await FriendRequest.areFriends(userId, friendId);
    if (!areFriends) {
      return res.status(403).json({ message: 'You can only start conversations with friends' });
    }

    // Get or create conversation
    const conversation = await Conversation.createOrGet(userId, friendId);

    res.json({
      conversation: {
        id: conversation._id,
        participants: conversation.participants.map(p => ({
          id: p._id,
          username: p.username,
          nickname: p.nickname,
          profilePictureUrl: p.profilePictureUrl,
          isOnline: p.isOnline,
          lastSeen: p.lastSeen
        })),
        lastMessageText: conversation.lastMessageText,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt
      }
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation', error: error.message });
  }
});

// Get user's conversations
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const conversations = await Conversation.getUserConversations(req.user._id);

    const conversationList = conversations.map(conv => {
      const otherParticipant = conv.getOtherParticipant(req.user._id);
      
      return {
        id: conv._id,
        participant: otherParticipant ? {
          id: otherParticipant._id,
          username: otherParticipant.username,
          nickname: otherParticipant.nickname,
          profilePictureUrl: otherParticipant.profilePictureUrl,
          isOnline: otherParticipant.isOnline,
          lastSeen: otherParticipant.lastSeen
        } : null,
        lastMessageText: conv.lastMessageText,
        lastMessageAt: conv.lastMessageAt,
        lastMessageBy: conv.lastMessageBy ? {
          id: conv.lastMessageBy._id,
          username: conv.lastMessageBy.username,
          nickname: conv.lastMessageBy.nickname
        } : null,
        type: conv.type,
        settings: conv.settings,
        updatedAt: conv.updatedAt
      };
    });

    res.json({ conversations: conversationList });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to get conversations', error: error.message });
  }
});

// Add reaction to message
router.post('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is participant in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await message.addReaction(userId, emoji);

    res.json({ message: 'Reaction added successfully' });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Failed to add reaction', error: error.message });
  }
});

// Remove reaction from message
router.delete('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(userId);

    res.json({ message: 'Reaction removed successfully' });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Failed to remove reaction', error: error.message });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await message.softDelete();

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
});

module.exports = router;