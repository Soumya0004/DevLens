import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthGate } from "@/components/auth/auth-gate";
import Navbar from "@/components/navbar/Navbar";
import { PageMotion } from "@/components/ui/page-motion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevLens | GitHub project intelligence",
  description: "Understand the health, momentum, and risks of your GitHub projects.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <AuthGate>
          <PageMotion>{children}</PageMotion>
        </AuthGate>
      </body>
    </html>
  );
}
