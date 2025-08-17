# LChat Application

This is a full-stack chat application with a React Native frontend and a Node.js backend.

## Important Note on Project Structure

This repository contains two main projects:

-   `main/backend`: The Node.js and Express backend server.
-   `main/frontend`: The React Native (Expo) frontend application.

The root directory contains a `package.json` file with scripts to run both projects concurrently.

## Prerequisites

-   Node.js (v16 or higher)
-   npm
-   Expo Go app on your mobile device
-   MongoDB Compass (or a running MongoDB instance)

## Setup and Running the Application

1.  **Open the Project in VS Code:**
    -   Unzip the project files to a folder on your computer.
    -   Open VS Code.
    -   Go to `File` > `Open Folder...` and select the root folder of the project.

2.  **Install All Dependencies:**
    -   Open a terminal in the root of the project.
    -   Run the following command to install the dependencies for the root, backend, and frontend:
        ```bash
        npm install
        ```
        This will install `concurrently` in the root. Then, install the dependencies for the backend and frontend:
        ```bash
        cd main/backend
        npm install
        cd ../frontend
        npm install --legacy-peer-deps
        cd ../..
        ```

3.  **Configure Environment Variables:**
    -   **Backend:**
        -   The backend `.env` file is located at `main/backend/.env`. It has been pre-configured to run on port `5000` and connect to a local MongoDB instance. You can modify this file if needed.
    -   **Frontend:**
        -   The frontend API URL is configured in `main/frontend/.env` to point to `http://192.168.0.108:5000/api`.
        -   **Important:** Make sure your computer's local IP address is `192.168.0.108` and that your mobile device is on the same Wi-Fi network. If your IP address is different, you will need to update the `EXPO_PUBLIC_API_URL` in `main/frontend/.env`.

4.  **Run the Application:**
    -   Open a terminal in the root of the project.
    -   Run the following command to start both the backend and frontend servers:
        ```bash
        npm run dev
        ```
    -   This will start the backend server on port 5000 and the Expo development server for the frontend.

5.  **Run the App on Your Phone:**
    -   Once the Expo development server is running, you will see a QR code in your terminal.
    -   Open the Expo Go app on your phone and scan the QR code to open the LChat application.

## Testing Flow

1.  **Sign up:** Create a new user account.
2.  **Login:** Log in with the newly created account.
3.  **Search:** Search for other users.
4.  **Friend Request:** Send a friend request to another user.
5.  **Accept Request:** Log in as the other user and accept the friend request.
6.  **Chat:** Verify that the new friend appears in the chat list and that you can open a chat and send messages.
