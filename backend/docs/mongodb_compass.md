# MongoDB Compass Setup Guide for LChat

This guide provides step-by-step instructions for setting up MongoDB Community Server and MongoDB Compass to work with the LChat application.

## Prerequisites

- A computer running Windows, macOS, or Linux
- Administrator/root privileges for installation
- At least 1GB of free disk space

## Step 1: Install MongoDB Community Server

### Windows Installation

1. **Download MongoDB Community Server**
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select "Windows" as platform
   - Choose "MSI" package
   - Click "Download"

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Select "Install MongoDB as a Service"
   - Keep default service name "MongoDB"
   - Choose "Run service as Network Service user"
   - Uncheck "Install MongoDB Compass" (we'll install it separately)
   - Click "Install"

3. **Start MongoDB Service**
   - **Option A**: Via Services Manager
     - Press `Win + R`, type `services.msc`, press Enter
     - Find "MongoDB Server (MongoDB)"
     - Right-click → Start
   
   - **Option B**: Via Command Line (Run as Administrator)
     ```cmd
     net start MongoDB
     ```
   
   - **Option C**: Manual Start
     ```cmd
     "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
     ```
     Note: Create the `C:\data\db` directory first if it doesn't exist

4. **Verify Installation**
   ```cmd
   "C:\Program Files\MongoDB\Server\7.0\bin\mongo.exe" --version
   ```

### macOS Installation (Using Homebrew)

1. **Install Homebrew** (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Add MongoDB Homebrew Tap**
   ```bash
   brew tap mongodb/brew
   ```

3. **Install MongoDB Community Edition**
   ```bash
   brew install mongodb-community
   ```

4. **Start MongoDB as a Service**
   ```bash
   brew services start mongodb-community
   ```

5. **Verify Installation**
   ```bash
   mongod --version
   ```

### Linux Installation (Ubuntu/Debian)

1. **Import MongoDB Public GPG Key**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Create List File for MongoDB**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Update Package Database**
   ```bash
   sudo apt-get update
   ```

4. **Install MongoDB**
   ```bash
   sudo apt-get install -y mongodb-org
   ```

5. **Start and Enable MongoDB Service**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

6. **Verify Installation**
   ```bash
   mongod --version
   ```

## Step 2: Install MongoDB Compass

1. **Download MongoDB Compass**
   - Go to [MongoDB Compass Download](https://www.mongodb.com/products/compass)
   - Select your operating system
   - Download the installer

2. **Install MongoDB Compass**
   - **Windows**: Run the `.exe` installer
   - **macOS**: Drag the `.app` to Applications folder
   - **Linux**: Install the `.deb` or `.rpm` package

3. **Launch MongoDB Compass**
   - Open MongoDB Compass from your applications

## Step 3: Connect to MongoDB using Compass

1. **Open MongoDB Compass**

2. **Create New Connection**
   - Click "New Connection" or the "+" button
   - You should see a connection string field

3. **Enter Connection String**
   ```
   mongodb://localhost:27017
   ```

4. **Connect**
   - Click "Connect" button
   - You should see the connection established
   - MongoDB Compass will show available databases

5. **Verify Connection**
   - You should see default databases like `admin`, `config`, and `local`
   - The connection status should show as "Connected"

## Step 4: Prepare for LChat Database

### Option A: Let LChat Create the Database (Recommended)

The LChat application will automatically create the `lchat` database when you run the seed script or start the application. No manual database creation needed.

### Option B: Create Database Manually

1. **In MongoDB Compass**
   - Click "Create Database" button
   - Database Name: `lchat`
   - Collection Name: `users` (you can add more collections later)
   - Click "Create Database"

## Step 5: Import Seed Data

### Method 1: Using the Seed Script (Recommended)

1. **Navigate to the LChat backend directory**
   ```bash
   cd backend
   ```

2. **Run the seed script**
   ```bash
   node seed/seed.js
   ```

3. **Verify in Compass**
   - Refresh the databases list in MongoDB Compass
   - You should see the `lchat` database
   - Expand it to see collections: `users`, `shortforms`, `slangs`, `conversations`, `messages`, `friendrequests`

### Method 2: Manual Import via Compass

1. **In MongoDB Compass**
   - Connect to your MongoDB instance
   - Create the `lchat` database if it doesn't exist

2. **For each collection, import the corresponding JSON file:**

   **Import Users:**
   - Click on `lchat` database
   - Click "Create Collection" → Name: `users`
   - Click on the `users` collection
   - Click "Import Data"
   - Select `backend/db/seeds/users.json`
   - Click "Import"

   **Import Shortforms:**
   - Create collection `shortforms`
   - Import `backend/db/seeds/shortforms.json`

   **Import Slangs:**
   - Create collection `slangs`
   - Import `backend/db/seeds/slangs.json`

   **Import Conversations:**
   - Create collection `conversations`
   - Import `backend/db/seeds/conversations.json`

   **Import Messages:**
   - Create collection `messages`
   - Import `backend/db/seeds/messages.json`

## Step 6: Verify Setup

1. **Check Collections**
   In MongoDB Compass, you should see:
   - `users` collection with 3 documents
   - `shortforms` collection with 15 documents
   - `slangs` collection with 15 documents
   - `conversations` collection with 2 documents
   - `messages` collection with 5 documents

2. **Test Connection from LChat**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   
   The backend should start successfully and connect to MongoDB.

## Troubleshooting

### MongoDB Service Not Starting

**Windows:**
```cmd
# Check if MongoDB is running
tasklist | findstr mongod

# Start service manually
net start MongoDB

# Or start mongod directly
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS:**
```bash
# Check status
brew services list | grep mongodb

# Restart service
brew services restart mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Check status
sudo systemctl status mongod

# Start service
sudo systemctl start mongod

# Check logs
sudo journalctl -u mongod
```

### Connection Issues

1. **Check MongoDB is running on port 27017**
   ```bash
   netstat -an | grep 27017
   ```

2. **Verify MongoDB logs**
   - **Windows**: Check Windows Event Viewer or MongoDB log files
   - **macOS**: `tail -f /usr/local/var/log/mongodb/mongo.log`
   - **Linux**: `sudo tail -f /var/log/mongodb/mongod.log`

3. **Firewall Issues**
   - Ensure port 27017 is not blocked by firewall
   - For local development, this is usually not an issue

### Compass Connection Errors

1. **"Server not reachable"**
   - Verify MongoDB service is running
   - Check connection string: `mongodb://localhost:27017`
   - Try `mongodb://127.0.0.1:27017` instead

2. **Authentication Issues**
   - Default MongoDB installation has no authentication
   - If authentication is enabled, use: `mongodb://username:password@localhost:27017`

3. **Network Timeouts**
   - Increase connection timeout in Compass settings
   - Check if antivirus is blocking the connection

## Alternative: Using MongoDB Atlas (Cloud)

If you prefer a cloud solution:

1. **Sign up for MongoDB Atlas**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free account

2. **Create Cluster**
   - Choose free tier (M0)
   - Select closest region

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update LChat Configuration**
   - In `backend/.env`: `MONGO_URI=your_atlas_connection_string`

## MongoDB Compass Features for Development

### Useful Features for LChat Development:

1. **Query Documents**
   ```javascript
   // Find users by username
   { "username": "john_doe" }
   
   // Find online users
   { "isOnline": true }
   
   // Find recent messages
   { "timestamp": { "$gte": new Date("2024-01-01") } }
   ```

2. **Indexes**
   - View existing indexes in the "Indexes" tab
   - The seed script creates necessary indexes automatically

3. **Schema View**
   - Click "Schema" tab to see document structure
   - Useful for understanding data relationships

4. **Real-time Data**
   - Enable auto-refresh to see live data changes
   - Useful during development and testing

## Next Steps

Once MongoDB is set up:

1. **Start the LChat Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the LChat Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Test the Application**
   - Register new users or use seed account credentials
   - Test friend requests and messaging
   - Verify data appears in MongoDB Compass

## Support

If you encounter issues:

1. Check MongoDB official documentation
2. Verify system requirements
3. Check LChat application logs
4. Review this guide for missed steps

For LChat-specific issues, refer to the main README.md file.