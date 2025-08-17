# LChat - Cross-Platform Chat Application with Translation

A complete cross-platform mobile chat application built with React Native (Expo), Node.js, Express, Socket.IO, and MongoDB. Features real-time messaging, friend system, user search, and advanced translation with NLP preprocessing.

## Features

- 🔐 **Authentication**: Secure registration and login with JWT
- 👥 **User Search**: Find users by nickname or username (Instagram-like)
- 🤝 **Friend System**: Send, accept, and reject friend requests
- 💬 **Real-time Chat**: Socket.IO powered messaging between friends
- 🌐 **Translation**: Google Cloud Translation with NLP preprocessing
- 📱 **Cross-platform**: iOS, Android, and Web support
- 🎨 **Modern UI**: Dark/Light mode with Instagram-inspired design
- 🔍 **Smart Preprocessing**: Shortforms expansion, slang replacement, sarcasm detection

## Technology Stack

### Backend
- Node.js + Express
- Socket.IO for real-time communication
- MongoDB with Mongoose ODM
- JWT authentication
- bcrypt password hashing
- Google Cloud Translation API

### Frontend
- React Native with Expo
- TypeScript
- React Navigation
- Socket.IO client
- Async Storage

### Database
- MongoDB Community Server
- MongoDB Compass for management

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **MongoDB Community Server** - [Installation Guide](#mongodb-setup)
4. **MongoDB Compass** - [Download here](https://www.mongodb.com/products/compass)
5. **Expo CLI** - `npm install -g @expo/cli`

## MongoDB Setup

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the .msi installer
3. Start MongoDB service:
   - Via Services: Search "Services" → Find "MongoDB Server" → Start
   - Via Command Line: `net start MongoDB`
   - Or run directly: `mongod --dbpath="C:\data\db"`

### macOS (Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -sc)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## MongoDB Compass Connection

1. Open MongoDB Compass
2. Click "New Connection"
3. Enter connection string: `mongodb://localhost:27017`
4. Click "Connect"
5. You should see the connection established

## Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd lchat-app
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Setup environment variables**
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment  
cp frontend/.env.example frontend/.env
```

4. **Configure backend/.env**
```env
MONGO_URI=mongodb://localhost:27017/lchat
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
PORT=5000
NODE_ENV=development
```

5. **Configure frontend/.env**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## Database Seeding

### Option 1: Using Seed Script (Recommended)
```bash
npm run seed
```

### Option 2: Using MongoDB Compass Import
1. Open MongoDB Compass and connect to `mongodb://localhost:27017`
2. Create database `lchat` if it doesn't exist
3. For each collection, import the corresponding JSON file from `backend/db/seeds/`:
   - Create Collection → Import Data → Choose JSON file → Import

Available seed files:
- `users.json` - Sample users
- `shortforms.json` - Text shortforms dictionary
- `slangs.json` - Slang terms dictionary
- `conversations.json` - Sample conversations
- `messages.json` - Sample messages

## Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

### Start Frontend App
```bash
cd frontend
npm start
```
Choose your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web browser

## Google Cloud Translation API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Cloud Translation API
4. Create credentials (API Key)
5. Add the API key to `backend/.env` as `GOOGLE_TRANSLATE_API_KEY`

**Note**: For development/testing without Google API key, the app includes a mock translation service that simulates translations.

## Usage Guide

### 1. User Registration
- Open the app and tap "Sign Up"
- Enter email, username, and password
- Upload a profile picture (optional)

### 2. Finding Friends
- Go to "Search Users" tab
- Search by username or nickname
- Send friend requests to users

### 3. Managing Friend Requests
- Check "Friend Requests" section
- Accept or reject incoming requests
- View sent requests status

### 4. Chatting
- Go to "Chats" tab to see friends list
- Tap on a friend to open chat
- Send messages in real-time

### 5. Translation Features
- In any chat, tap the translate button
- Choose target language (English, Marathi, Telugu, Tamil)
- Toggle translation on/off as needed
- View original and translated messages

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Users
- `GET /users/search?query=username` - Search users
- `GET /users/profile/:id` - Get user profile
- `PUT /users/profile/:id` - Update user profile

### Friends
- `POST /friends/request` - Send friend request
- `POST /friends/accept` - Accept friend request
- `POST /friends/reject` - Reject friend request
- `GET /friends/requests` - Get friend requests
- `GET /friends/list` - Get friends list

### Messages
- `GET /messages/:conversationId` - Get conversation messages
- `POST /translate` - Translate text with preprocessing

### Socket.IO Events
- `join_conversation` - Join a conversation room
- `send_message` - Send a message
- `message_received` - Receive a message
- `user_online` - User online status
- `typing` - Typing indicators

## Project Structure

```
lchat-app/
├── backend/
│   ├── db/
│   │   ├── models/          # Mongoose schemas
│   │   └── seeds/           # JSON seed data
│   ├── middleware/          # Auth & validation middleware
│   ├── routes/             # API routes
│   ├── utils/              # Utilities & preprocessing
│   ├── seed/               # Database seeding scripts
│   ├── uploads/            # File uploads
│   └── server.js           # Main server file
├── frontend/
│   ├── app/                # Expo Router screens
│   ├── components/         # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API & Socket services
│   ├── context/           # React context providers
│   └── constants/         # App constants
├── docs/
│   └── mongodb_compass.md  # Detailed MongoDB setup
└── README.md
```

## Development Features

### NLP Preprocessing Pipeline
1. **Shortforms Expansion**: "idk" → "I don't know"
2. **Slang Replacement**: "lit" → "amazing"  
3. **Sarcasm Detection**: Appends [sarcasm] tag when detected
4. **Translation**: Processes text through Google Translate API

### UI Features
- Dark/Light mode toggle
- Instagram-inspired chat interface
- Real-time message delivery
- Typing indicators
- Online status
- Profile picture uploads
- Smooth animations

## Testing

### Test User Accounts (from seed data)
- **User 1**: `john@example.com` / `password123`
- **User 2**: `jane@example.com` / `password123`  
- **User 3**: `bob@example.com` / `password123`

### Testing Flow
1. Register/login with different accounts
2. Search for users and send friend requests
3. Accept friend requests from other account
4. Start chatting between friends
5. Test translation with different languages
6. Try shortforms, slang, and sarcastic messages

## Troubleshooting

### MongoDB Issues
- Ensure MongoDB service is running
- Check if port 27017 is available
- Verify MongoDB Compass can connect

### Translation Issues
- Verify Google Translate API key is valid
- Check API quotas and billing
- Ensure Cloud Translation API is enabled

### Frontend Issues
- Clear Expo cache: `npx expo start --clear`
- Ensure backend is running on port 5000
- Check network connectivity between devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.