import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import GalleryGrid from "@/components/site/GalleryGrid";
import { getSettings, getFirstGalleryItems } from "@/lib/data";
import { GALLERY_CATEGORIES } from "@/lib/validation/galleryItem";

export const revalidate = 300;

export const metadata = {
  title: "Gallery — Karakoram Disability Forum",
  description: "Moments from around Skardu — craft circles, the Resource Center, and the shop shelf.",
};

export default async function GalleryPage() {
  const [settings, gallery] = await Promise.all([getSettings(), getFirstGalleryItems(6)]);

  return (
    <>
      <Nav active="Gallery" />
      <section className="page-hero">
        <div className="wrap">
          <span className="breadcrumb mono">Home / Gallery</span>
          <h1>Moments from around Skardu.</h1>
          <p>
            Craft circles, the Resource Center, and the shop shelf. Click any tile to view it
            fullscreen.
          </p>
        </div>
      </section>
      <main className="wrap">
        <GalleryGrid
          initialItems={gallery.items}
          initialCursor={gallery.nextCursor}
          categories={GALLERY_CATEGORIES}
          variant="full"
        />
      </main>
      <Footer settings={settings} />
    </>
  );
}
