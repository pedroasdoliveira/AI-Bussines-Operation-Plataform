import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "AI Business Operations",
  description: "Operação do e-commerce com assistente controlado por tools.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
