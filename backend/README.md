# LearnLoop Backend

LearnLoop is a powerful YouTube video tracking and organization platform. This is the backend service that powers the LearnLoop application, providing a robust API for managing users, playlists, videos, and more.

## Features

- User authentication with Google OAuth2 and JWT
- Playlist and video management
- Video content analysis using AI
- Caching with Redis for improved performance
- Badge and achievement system

## Tech Stack

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: A minimal and flexible Node.js web application framework.
- **MongoDB**: A NoSQL document database for storing application data.
- **Redis**: An in-memory data structure store, used for caching.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js.
- **JWT (JSON Web Tokens)**: For securing API endpoints.
- **Google OAuth2**: For user authentication.
- **OpenAI API**: For AI-powered video content analysis.

## Project Structure

```
backend/
├── config/
│   ├── db.js             # MongoDB connection setup
│   ├── redis.js          # Redis client setup
│   └── redisUtils.js     # Redis utility functions for caching
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── Badge.js          # Mongoose model for badges
│   ├── Playlist.js       # Mongoose model for playlists
│   ├── User.js           # Mongoose model for users
│   ├── Video.js          # Mongoose model for videos
│   └── index.js          # Exports all models
├── routes/
│   ├── auth.js           # Authentication routes (Google OAuth, user data)
│   ├── badge.js          # Routes for managing user badges
│   ├── playlist.js       # Routes for playlist management
│   ├── user.js           # Routes for user profile and settings
│   └── video.js          # Routes for video management
├── services/
│   └── aiService.js      # Service for interacting with the OpenAI API
├── utils/
│   └── videoUtils.js     # Utility functions for video processing
├── .env.example          # Example environment variables file
├── .gitignore            # Git ignore file
├── index.js              # Main application entry point
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
REDIS_URL=your_redis_url
OPENAI_API_KEY=your_openai_api_key_here
PORT=your_port
REDIS_PASSWORD=your_redis_password
YOUTUBE_API_KEY=your_youtube_api_key
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AyushPandey4/LearnLoop.git
    cd learnloop/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

The server will be running on the port specified in your `.env` file.

## API Routes

### Authentication Routes

#### `POST /api/auth/google`
- **Description**: Authenticates a user with Google OAuth.
- **Request Body**:
  ```json
  {
    "tokenId": "your_google_id_token"
  }
  ```
- **Response**: JWT token and user data.

#### `GET /api/auth/user`
- **Description**: Gets the authenticated user's data.
- **Headers**: `Authorization: Bearer <your_jwt_token>`
- **Response**: User profile data.

### User Routes

#### `POST /api/user/category`
- **Description**: Creates a new category for the user.
- **Request Body**:
  ```json
  {
    "category": "New Category"
  }
  ```

#### `GET /api/user/categories`
- **Description**: Fetches all of the user's categories.

#### `PUT /api/user/category`
- **Description**: Renames a category.
- **Request Body**:
  ```json
  {
    "oldCategory": "Old Name",
    "newCategory": "New Name"
  }
  ```

#### `DELETE /api/user/category/:categoryName`
- **Description**: Deletes a category.
- **URL Parameters**: `categoryName` (the name of the category to delete)
- **Query Parameters**: `deleteAssociatedPlaylists` (boolean)

#### `POST /api/user/daily-goal`
- **Description**: Sets or updates the user's daily learning goal.
- **Request Body**:
  ```json
  {
    "dailyGoal": "1 hour"
  }
  ```

#### `GET /api/user/daily-goal`
- **Description**: Fetches the user's current daily goal.

### Playlist Routes

#### `POST /api/playlist`
- **Description**: Creates a new playlist.
- **Request Body**:
  ```json
  {
    "title": "My New Playlist",
    "category": "Learning",
    "description": "A playlist for learning new things."
  }
  ```

#### `GET /api/playlist`
- **Description**: Fetches all playlists for the user.
- **Query Parameters**: `category` (optional, to filter by category)

#### `GET /api/playlist/:id`
- **Description**: Fetches a specific playlist by its ID.

#### `PUT /api/playlist/:id`
- **Description**: Updates a playlist's details.
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "category": "New Category",
    "description": "Updated description."
  }
  ```

#### `DELETE /api/playlist/:id`
- **Description**: Deletes a playlist and all its associated videos.

### Video Routes

#### `POST /api/video`
- **Description**: Adds a new video to a playlist.
- **Request Body**:
  ```json
  {
    "playlistId": "playlist_id",
    "videoId": "youtube_video_id",
    "title": "Video Title",
    "thumbnail": "thumbnail_url"
  }
  ```

#### `GET /api/video`
- **Description**: Fetches videos for a specific playlist.
- **Query Parameters**: `playlistId`

#### `PUT /api/video/:id`
- **Description**: Updates video details.
- **Request Body**:
  ```json
  {
    "title": "New Video Title",
    "notes": "Some notes about the video.",
    "watched": true
  }
  ```

#### `DELETE /api/video/:id`
- **Description**: Removes a video from a playlist.

### Badge Routes

#### `GET /api/badge`
- **Description**: Fetches all badges for the user.

#### `POST /api/badge`
- **Description**: Awards a new badge to the user.
- **Request Body**:
  ```json
  {
    "type": "playlist_milestone",
    "name": "First Playlist Created"
  }
  ```

## Caching

The backend uses Redis for caching frequently accessed data to reduce database load and improve response times. Cached data includes:
- User data
- Categories
- Playlists
- Daily goals

The default cache duration is 24 hours.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request:
- `400 Bad Request`: The request was malformed or invalid.
- `401 Unauthorized`: Authentication failed or is required.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.

## Security

- **Authentication**: JWT-based authentication protects API endpoints.
- **Authorization**: Google OAuth2 integration for secure user login.
- **Input Validation**: All incoming data is validated to prevent common vulnerabilities.
- **Rate Limiting**: (To be implemented) To protect against brute-force attacks.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to the branch.
5.  Create a pull request. 