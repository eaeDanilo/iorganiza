import type { Metadata } from "next";
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const title = "iMaleta — Controle de maletas de consignação";
const description =
  "Monte maletas para vendedoras externas, bipe produtos pela câmera do celular e saiba exatamente o que foi vendido na conferência. Teste grátis.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/imaleta" },
  keywords: [
    "maleta de consignação",
    "controle de maletas",
    "venda consignada",
    "semijoias consignado",
    "controle de vendedoras externas",
    "leitor de código de barras",
  ],
  openGraph: {
    title,
    description,
    url: "/imaleta",
    type: "website",
    locale: "pt_BR",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function IMaletaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={figtree.variable} style={{ fontFamily: "var(--font-figtree)" }}>
      {children}
    </div>
  );
}
