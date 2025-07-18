# LearnLoop Frontend

LearnLoop is a modern web application for tracking and organizing YouTube videos. This is the frontend part of the application built with Next.js and Tailwind CSS.

## Features

- 🔐 Google OAuth Authentication
- 📱 Responsive Design
- 🎯 Daily Goals Tracking
- 📋 Playlist Management
- 🏷️ Category Organization
- 🎖️ Achievement Badges
- 📝 Video Notes
- ⏱️ Watch Time Tracking
- 🤖 AI-powered Video Summaries
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time Updates
- 📊 Progress Statistics

## Tech Stack

- Next.js 14
- React
- Tailwind CSS
- Context API for State Management
- Axios for API calls
- React Icons
- React Hot Toast for Notifications

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
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

## Key Components

### Authentication
- Google OAuth integration
- Protected routes
- Session management

### Dashboard
- Overview of user's progress
- Daily goals tracking
- Recent activity
- Achievement badges

### Playlist Management
- Create and organize playlists
- Category management
- Video progress tracking
- Notes and summaries

### Video Player
- YouTube video integration
- Progress tracking
- Notes and timestamps
- AI-generated summaries

## Styling

The application uses Tailwind CSS for styling with a custom color scheme and responsive design. Key features include:

- Dark/Light mode support
- Responsive layouts
- Custom animations
- Consistent typography
- Modern UI components

## State Management

The application uses React Context API for state management with the following contexts:

- AuthContext: User authentication state
- PlaylistContext: Playlist and video management
- UIContext: UI state and preferences

## API Integration

The frontend communicates with the backend API using Axios. Key API endpoints include:

- Authentication
- User management
- Playlist operations
- Video tracking
- Badge system

## Performance Optimization

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- API request optimization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test thoroughly before submitting PRs

## License

This project is licensed under the MIT License - see the LICENSE file for details.


