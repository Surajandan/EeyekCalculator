import type {Metadata} from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Define your local fonts
// Make sure to place your font files in the src/fonts directory

/* Temporarily commented out:
const inter = localFont({
  src: [
    {
      path: '../fonts/Inter-Regular.woff2', // Adjust path and filename as needed
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Inter-Bold.woff2', // Adjust path and filename as needed
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter', // CSS variable to be used in Tailwind
  display: 'swap',
});
*/

// Configuration for Noto Sans Meetei Mayek
// TODO: Add NotoSansMeeteiMayek-Regular.woff2 (or similar) to src/fonts/
/* Temporarily commented out due to missing font file:
const notoSansMeeteiMayek = localFont({
  src: [
    {
      path: '../fonts/NotoSansMeeteiMayek-Regular.woff2', // Adjust path and filename as needed
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
  title: 'Local Calc',
  description: 'A simple calculator app built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add notoSansMeeteiMayek.variable to className when re-enabled
    // Temporarily removed inter.variable and notoSansMeeteiMayek.variable from className
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
