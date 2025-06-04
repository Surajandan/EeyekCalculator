
import type {Metadata} from 'next';
import localFont from 'next/font/local'; // Keep for Noto Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Define your local fonts
// Make sure to place your font files in the src/fonts directory

// Configuration for Inter font (Temporarily commented out due to 'File not found' error)
/*
const inter = localFont({
  src: [
    {
      path: '../fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter', // CSS variable to be used in Tailwind
  display: 'swap',
});
*/

// Configuration for Noto Sans Meetei Mayek (Temporarily commented out due to 'File not found' error)
/*
const notoSansMeeteiMayek = localFont({
  src: [
    {
      path: '../fonts/NotoSansMeeteiMayek-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    // Add other weights/styles if available, e.g.:
    // {
    //   path: '../fonts/NotoSansMeeteiMayek-Bold.woff2',
    //   weight: '700',
    //   style: 'normal',
    // },
  ],
  variable: '--font-noto-sans-meetei-mayek', // CSS variable
  display: 'swap',
});
*/

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
    // Apply only Noto Sans Meetei Mayek for now. Uncomment inter.variable when Inter font issue is resolved.
    // Remove notoSansMeeteiMayek.variable as it's commented out
    <html lang="en" className={``}> 
      <head>
        {/* Google Fonts links removed as we are using local fonts now */}
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
