import { PT_Serif, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/shared/ScrollProgress";
import CursorRing from "@/components/shared/CursorRing";

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata = {
  title: "Karakoram Disability Forum",
  description:
    "A persons-with-disabilities organisation in Skardu working on rights, independent living, and economic empowerment since 2011.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ptSerif.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ScrollProgress />
        <CursorRing />
        {children}
      </body>
    </html>
  );
}
