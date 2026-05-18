import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Support Agent",
  description: "RAG-powered customer support with knowledge base + Groq",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              AI Support<span className="text-emerald-400">.</span>
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/chat" className="hover:text-emerald-400">Chat</Link>
              <Link href="/admin" className="hover:text-emerald-400">Admin</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
