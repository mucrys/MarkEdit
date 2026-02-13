import type {Metadata, Viewport} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarkEdit - Professional Markdown Editor',
  description: 'Cross-platform Markdown document viewer and editor for Android, HarmonyOS, iOS, and Desktop.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MarkEdit',
  },
  applicationName: 'MarkEdit',
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30 bg-background text-foreground">{children}</body>
    </html>
  );
}