import { ReactNode } from 'react';
import { Roboto, Jersey_10 } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/navbar';

// Configure fonts
const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const jersey = Jersey_10({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-jersey',
  display: 'swap',
});

export const metadata = {
  title: 'CS 1.6 Server Tracker',
  description: 'Track Counter-Strike 1.6 servers, monitor player activity, and find the best CS 1.6 servers',
  keywords: 'Counter-Strike 1.6, CS 1.6, servers, gaming, tracker, player stats, server monitoring',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${jersey.variable}`}>
      <body className="min-h-screen bg-[url('/assets/14.png')] bg-fixed bg-center bg-cover">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none z-0" />
        
        {/* Navbar */}
        <Navbar />
        
        {/* Main content */}
        <main className="mt-4 mb-12 z-10 relative">
          {children}
        </main>
      </body>
    </html>
  );
}