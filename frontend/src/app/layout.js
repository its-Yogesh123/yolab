"use client";
import { SessionProvider } from "next-auth/react";
import './global.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider >
        {children}
        </SessionProvider>
      </body>
    </html>
  );
}
