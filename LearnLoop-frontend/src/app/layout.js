import "./globals.css";
import Providers from "./Providers";
import Navbar from "@/components/Navbar";
import { cookies } from 'next/headers';

export const metadata = {
  title: 'LearnLoop - Your Learning Journey Companion',
  description: 'Track, organize, and enhance your learning journey with LearnLoop. Manage your notes, videos, and playlists in one place.',
  keywords: 'learning, education, notes, videos, playlists, organization, productivity',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.svg',
    },
  },
};

export default function RootLayout({ children }) {
  const isDashboard = false; 
  
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-900">
        <Providers>
          <div id="navbar-container">
            <Navbar />
          </div>
          <main className="pt-16 dashboard:pt-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
