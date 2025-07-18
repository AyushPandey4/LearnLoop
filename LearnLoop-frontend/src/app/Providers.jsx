"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext";
import { PlaylistProvider } from "../context/PlaylistContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error(
    "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables"
  );
}

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <PlaylistProvider>{children}</PlaylistProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
