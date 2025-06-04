
import type {Metadata} from 'next';
// import localFont from 'next/font/local'; // Removed localFont import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

// Removed local font definitions for Inter and NotoSansMeeteiMayek

export const metadata: Metadata = {
  title: 'Eeyek Calculator',
  description: 'Eeyek Calculator - A simple calculator app built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed font variables from html className
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
