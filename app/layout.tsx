import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Identidad 360° — Perfiles de Riesgo Crediticio",
  description:
    "Inteligencia de identidad para equipos de riesgo. Combina verificación documental (Truora), señales web (Tavily) y síntesis por IA para un perfil 360° de crédito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
