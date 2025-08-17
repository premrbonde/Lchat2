# LChat Application

This is a full-stack chat application with a React Native frontend and a Node.js backend.

## Prerequisites

- Node.js (v16 or higher)
- npm
- Expo Go app on your mobile device
- MongoDB Compass (or a running MongoDB instance)

## Setup and Running the Application

1.  **Navigate to the `backend` directory:**
    ```
    cd backend
    ```

2.  **Install Dependencies:**
    - Run the following command to install all the necessary dependencies for both the backend and frontend:
      ```
      npm install --legacy-peer-deps
      ```

3.  **Configure Environment Variables:**
    - **Backend:**
      - The backend `.env` file is located at `backend/backend/.env`. It has been pre-configured to run on port 5000 and connect to a local MongoDB instance. You can modify this file if needed.
    - **Frontend:**
      - The frontend API URL has been hardcoded in `backend/frontend/services/apiService.ts` to point to `http://192.168.0.108:5000/api`.
      - **Important:** Make sure your computer's local IP address is `192.168.0.108` and that your mobile device is on the same Wi-Fi network. If your IP address is different, you will need to update the `baseURL` in `backend/frontend/services/apiService.ts`.

4.  **Run the Application:**
    - In the `backend` directory, run the following command to start both the backend and frontend servers:
      ```
      npm run dev
      ```
    - This will start the backend server on port 5000 and the Expo development server for the frontend.

5.  **Run the App on Your Phone:**
    - Once the Expo development server is running, you will see a QR code in your terminal.
    - Open the Expo Go app on your phone and scan the QR code to open the LChat application.

## Testing Flow

1.  **Sign up:** Create a new user account.
2.  **Login:** Log in with the newly created account.
3.  **Search:** Search for other users.
4.  **Friend Request:** Send a friend request to another user.
5.  **Accept Request:** Log in as the other user and accept the friend request.
6.  **Chat:** Verify that the new friend appears in the chat list and that you can open a chat and send messages.

## Code Review Summary

- **Backend:**
  - Added `friends` array to the `User` model.
  - Added `/api` prefix to all routes in `server.js`.
  - Configured CORS to allow requests from the frontend.
- **Frontend:**
  - Centralized all API calls into `apiService.ts`.
  - Refactored all components to use the new `apiService`.
  - Fixed the Expo Router authentication redirect issue.
  - Hardcoded the API URL in `apiService.ts` as a workaround for an environment issue.
- **Project Setup:**
  - The `package.json` in the `backend` directory has a `dev` script to run both servers concurrently.
  - Created a `.gitignore` file to ignore `node_modules`.
