import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Peer Tutoring",
  description: "Get instant help from top students at your school",
  applicationName: "Peer Tutoring",
  keywords: ["tutoring", "education", "peer learning", "students", "homework help"],
  authors: [{ name: "Peer Tutoring" }],
  creator: "Peer Tutoring",
  publisher: "Peer Tutoring",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peer Tutoring",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Peer Tutoring",
    title: "Peer Tutoring - Get Help From Top Students",
    description: "Get instant help from top students at your school",
  },
  twitter: {
    card: "summary_large_image",
    title: "Peer Tutoring",
    description: "Get instant help from top students at your school",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://login.microsoftonline.com" />
        <link rel="preconnect" href="https://graph.microsoft.com" />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
