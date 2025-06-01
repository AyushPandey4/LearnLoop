# LearnLoop - Your Learning Journey Companion 🎓

LearnLoop is a modern web application designed to help you track, organize, and enhance your learning journey through YouTube educational content. With powerful features for playlist management, progress tracking, and note-taking, LearnLoop makes your learning experience more structured and effective.

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
- Next.js 14
- React
- Tailwind CSS
- Context API for state management
- Axios for API calls
- React Hot Toast for notifications
- Headless UI components
- DND Kit for drag-and-drop

### Backend
- Node.js
- Express.js
- MongoDB
- Redis (for caching)
- JWT Authentication
- Google OAuth2
- OpenAI integration
- YouTube API integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis
- Google OAuth2 credentials
- YouTube API key
- OpenAI API key (optional)

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd LearnLoop-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:
```bash
npm run dev
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
REDIS_URL=your_redis_url
OPENAI_API_KEY=your_openai_api_key
PORT=5000
YOUTUBE_API_KEY=your_youtube_api_key
```

4. Start the server:
```bash
npm start
```

## 📝 Usage Guide

1. **Sign In**: Use your Google account to sign in securely.
2. **Set Daily Goals**: Define your learning objectives for the day.
3. **Create Categories**: Organize your content with custom categories.
4. **Add Playlists**: Create playlists and assign them to categories.
5. **Track Progress**: Mark videos as watched and track your progress.
6. **Take Notes**: Add notes to videos for better retention.
7. **Earn Badges**: Complete milestones to earn achievement badges.
8. **Monitor Progress**: View your learning statistics and progress.

## 🔒 Security Features

- Secure authentication with Google OAuth
- JWT token-based session management
- Protected API routes
- Secure data storage
- Input validation and sanitization
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and Express.js
- Styled with Tailwind CSS
- Icons from Heroicons
- UI components from Headless UI 
