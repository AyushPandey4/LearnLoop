# LearnLoop - Your Learning Journey Companion 🎓

LearnLoop is a modern web application designed to help you track, organize, and enhance your learning journey through YouTube educational content. With powerful features for playlist management, progress tracking, and note-taking, LearnLoop makes your learning experience more structured and effective.

## 🚀 Demo

### 🖥️ Dashboard Page

<p align="center">
  <img src="https://raw.githubusercontent.com/AyushPandey4/LearnLoop/main/assets/Dashboard.png" alt="Dashboard Page" width="800">
</p>

---

### 🎯 Badges

<p align="center">
  <img src="https://raw.githubusercontent.com/AyushPandey4/LearnLoop/main/assets/Badges.png" alt="Badges Feature" width="800">
</p>

---

### 🎥 Video Section

<p align="center">
  <img src="https://raw.githubusercontent.com/AyushPandey4/LearnLoop/main/assets/Video.png" alt="Video Feature" width="800">
</p>

---

### 📚 Playlist Page

<p align="center">
  <img src="https://raw.githubusercontent.com/AyushPandey4/LearnLoop/main/assets/Playlist.png" alt="Playlist Page" width="800">
</p>

---

### 🔍 Search by Tags

<p align="center">
  <img src="https://raw.githubusercontent.com/AyushPandey4/LearnLoop/main/assets/SearchTags.png" alt="Search by Tags" width="800">
</p>

---


## ✨ Key Features

### 🔐 Authentication & Security

- Secure Google OAuth Authentication
- JWT-based session management
- Protected routes and API endpoints

### 📱 User Interface

- Modern, responsive design
- Dark mode optimized interface
- Intuitive dashboard layout
- Smooth transitions and animations
- Beautiful UI with Tailwind CSS

### 🎯 Learning Management

- **Daily Goals Tracking**
  - Set and monitor daily learning objectives
  - Track progress towards goals
  - Visual progress indicators
- **Playlist Organization**
  - Create and manage custom playlists
  - Categorize learning content
  - Easy playlist navigation
  - Drag-and-drop playlist management
- **Video Management**
  - Track watched videos
  - Take notes for each video
  - Pin important videos
  - Rewatch suggestions
  - Progress tracking per video
  - AI-powered video summaries and note generation

### 🏷️ Content Organization

- Custom category creation
- Category-based playlist filtering
- Flexible content organization
- Bulk category management

### 🎖️ Gamification

- Achievement badges system
- Progress milestones
- Learning streaks
- Performance tracking

### 📊 Analytics & Progress

- Watch time tracking
- Learning progress visualization
- Category-wise progress stats
- Achievement statistics

### 🔄 Real-time Features

- Real-time progress updates
- Instant note synchronization
- Live playlist management

## 🛠️ Technical Stack

### Frontend

- **Next.js 14**: React framework for server-side rendering and static site generation.
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Context API**: For managing global state like authentication and playlists.
- **Axios**: For making HTTP requests to the backend API.
- **React Hot Toast**: For displaying notifications.
- **Headless UI**: Unstyled, fully accessible UI components.
- **DND Kit**: A modern, lightweight, and performant drag-and-drop toolkit.

### Backend

- **Node.js**: A JavaScript runtime environment.
- **Express.js**: A web application framework for Node.js.
- **MongoDB**: A NoSQL database for storing application data.
- **Redis**: An in-memory data store used for caching.
- **Mongoose**: An ODM library for MongoDB.
- **JWT (JSON Web Tokens)**: For secure API authentication.
- **Google OAuth2**: For user authentication.
- **OpenAI API**: For AI-powered video content analysis.
- **YouTube Data API v3**: For fetching video details.

## 📁 Project Structure

### High-Level Overview
```text
.
├── LearnLoop-frontend/   # Contains the Next.js frontend application
├── backend/              # Contains the Node.js/Express backend API
└── README.md             # This file
```

<details>
<summary>Click to expand Frontend Structure</summary>

```text
LearnLoop-frontend/
├── public/
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── badges/
│   │   │   └── page.jsx
│   │   ├── dashboard/
│   │   │   └── page.jsx
│   │   ├── notes-search/
│   │   │   └── page.jsx
│   │   ├── playlist/
│   │   │   └── [id]/
│   │   │       └── page.jsx
│   │   ├── tags-search/
│   │   │   └── page.jsx
│   │   ├── video/
│   │   │   └── [id]/
│   │   │       └── page.jsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── Providers.jsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── WarningDialog.jsx
│   │   ├── dashboard/
│   │   │   ├── AddPlaylistModal.jsx
│   │   │   ├── DailyGoal.jsx
│   │   │   ├── PinnedVideosWidget.jsx
│   │   │   ├── PlaylistGrid.jsx
│   │   │   ├── RewatchWidget.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── playlist/
│   │   │   ├── DraggableVideoList.jsx
│   │   │   ├── PlaylistHeader.jsx
│   │   │   ├── ResourceManager.jsx
│   │   │   ├── RewatchSection.jsx
│   │   │   ├── TagManager.jsx
│   │   │   ├── VideoCard.jsx
│   │   │   └── VideoList.jsx
│   │   ├── LandingPage.jsx
│   │   └── Navbar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── PlaylistContext.jsx
│   └── utils/
│       └── theme.js
├── .env.local.example
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── README.md
```
</details>

<details>
<summary>Click to expand Backend Structure</summary>

```text
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
└── README.md             # Backend-specific README
```
</details>

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Google OAuth2 credentials
- YouTube API key
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file from the \`.env.example\` and add your credentials:
   \`\`\`env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   REDIS_URL=your_redis_url
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   YOUTUBE_API_KEY=your_youtube_api_key
   \`\`\`
4. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd LearnLoop-frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env.local\` file and add your configuration:
   \`\`\`env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 API Documentation

Here is a summary of the available API endpoints. All protected routes require a \`Bearer <token>\` in the \`Authorization\` header.

### Authentication Routes

- \`POST /api/auth/google\`: Authenticates a user with Google OAuth.
- \`GET /api/auth/user\`: Gets the authenticated user's data.

### User Routes

- \`POST /api/user/category\`: Creates a new category.
- \`GET /api/user/categories\`: Fetches all user categories.
- \`PUT /api/user/category\`: Renames a category.
- \`DELETE /api/user/category/:categoryName\`: Deletes a category.
- \`POST /api/user/daily-goal\`: Sets or updates the user's daily goal.
- \`GET /api/user/daily-goal\`: Fetches the user's daily goal.

### Playlist Routes

- \`POST /api/playlist\`: Creates a new playlist.
- \`GET /api/playlist\`: Fetches all playlists for the user.
- \`GET /api/playlist/:id\`: Fetches a specific playlist by ID.
- \`PUT /api/playlist/:id\`: Updates a playlist's details.
- \`DELETE /api/playlist/:id\`: Deletes a playlist.

### Video Routes

- \`POST /api/video\`: Adds a new video to a playlist.
- \`GET /api/video\`: Fetches videos for a playlist.
- \`PUT /api/video/:id\`: Updates video details.
- \`DELETE /api/video/:id\`: Removes a video from a playlist.

### Badge Routes

- \`GET /api/badge\`: Fetches all badges for the user.
- \`POST /api/badge\`: Awards a new badge to the user.

## 📝 Frontend Details

### Key Components

- **Authentication**: Handles Google OAuth integration, protected routes, and session management.
- **Dashboard**: Provides an overview of the user's progress, daily goals, recent activity, and achievement badges.
- **Playlist Management**: Components for creating, organizing, and managing playlists and their content.
- **Video Player**: Integrates the YouTube player with features for progress tracking, note-taking, and AI-generated summaries.

### Styling

The application uses **Tailwind CSS** for styling with a custom theme defined in \`tailwind.config.js\`. It supports dark/light modes, responsive layouts, and a consistent design system.

### State Management

Global state is managed using **React Context API**.

- \`AuthContext\`: Manages user authentication state, tokens, and profile information.
- \`PlaylistContext\`: Handles state for playlists, videos, categories, and related operations.

### API Integration

The frontend communicates with the backend API using **Axios**. API calls are centralized and organized to handle data fetching, updates, and error handling efficiently.

### Performance Optimization

- **Code Splitting**: Next.js automatically splits code by pages.
- **Lazy Loading**: Components and libraries are loaded as needed.
- **Caching**: Redis is used on the backend to cache frequently accessed data.
- **Image Optimization**: Next.js Image component is used for automatic image optimization.

## 🔒 Security Features

- Secure authentication with Google OAuth.
- JWT token-based session management for stateless authentication.
- Protected API routes and frontend pages.
- Secure data storage practices.
- Input validation and sanitization to prevent common vulnerabilities like XSS.
- Rate limiting on API endpoints to prevent abuse.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch (\`git checkout -b feature/your-feature-name\`).
3. Make your changes and commit them with descriptive messages.
4. Push your changes to the branch (\`git push origin feature/your-feature-name\`).
5. Create a pull request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with **Next.js** and **Express.js**.
- Styled with **Tailwind CSS**.
- Icons from **Heroicons**.
- UI components from **Headless UI**.
