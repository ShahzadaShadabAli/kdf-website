import { PT_Serif, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/shared/ScrollProgress";
import CursorRing from "@/components/shared/CursorRing";
import { getSettings } from "@/lib/data";

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

// Cloudinary builds the resized copy on request: the logo is padded into a
// transparent square PNG so a wide logo still makes a clean tab icon.
function squareIcon(url, size) {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/c_pad,w_${size},h_${size},b_transparent,f_png/`);
}

export async function generateMetadata() {
  const settings = await getSettings();
  const logoUrl = settings?.logo?.url;

  return {
    title: "Karakoram Disability Forum",
    description:
      "A persons-with-disabilities organisation in Skardu working on rights, independent living, and economic empowerment since 2011.",
    icons: logoUrl
      ? {
          icon: [
            { url: squareIcon(logoUrl, 32), sizes: "32x32", type: "image/png" },
            { url: squareIcon(logoUrl, 192), sizes: "192x192", type: "image/png" },
          ],
          apple: [{ url: squareIcon(logoUrl, 180), sizes: "180x180", type: "image/png" }],
        }
      : undefined,
  };
}

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
