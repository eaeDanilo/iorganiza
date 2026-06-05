import type { Metadata } from "next";
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "iMaleta — Controle de maletas de vendas",
  description:
    "Gerencie maletas de vendedores externos com leitura de código de barras.",
};

export default function IMaletaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={figtree.variable} style={{ fontFamily: "var(--font-figtree)" }}>
      {children}
    </div>
  );
}
