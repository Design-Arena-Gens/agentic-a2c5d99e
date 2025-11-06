import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic Finance Blog Automator",
  description: "Processa texto/voz/link e publica no Blogger",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
