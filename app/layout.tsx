import type { Metadata } from "next";
import Link from "next/link";
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
  icons: {
    icon: "/favicon.svg",
  },
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
        <footer className="mt-auto border-t border-[#30363d] bg-[#0d1117] text-[#8b949e]">
          <div className="mx-auto flex max-w-350 flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <Link href="/" className="w-fit text-sm font-bold text-[#e6edf3] hover:text-white">
              DevLens<span className="text-[#f6c453]">.</span>
            </Link>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
