import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutoring Service - Book Your Session",
  description: "Book tutoring sessions with expert student tutors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
