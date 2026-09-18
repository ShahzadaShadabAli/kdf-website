import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import ShopGrid from "@/components/site/ShopGrid";
import { getSettings, getFirstProducts } from "@/lib/data";
import { CRAFTS } from "@/lib/validation/product";

export const revalidate = 300;

export const metadata = {
  title: "Shop — Karakoram Disability Forum",
  description: "Made by hand, sold by name. Browse the full KDF craft catalogue.",
};

export default async function ShopPage() {
  const [settings, products] = await Promise.all([getSettings(), getFirstProducts(8)]);

  return (
    <>
      <Nav active="Shop" />
      <section className="page-hero">
        <div className="wrap">
          <span className="breadcrumb mono">Home / Shop</span>
          <h1>Made by hand, sold by name.</h1>
          <p>
            Every piece is one of a kind, tagged with the member who made it. Filter by craft,
            browse the full catalogue, and message us on WhatsApp to buy — we confirm details,
            price, and delivery with you directly.
          </p>
        </div>
      </section>
      <main className="wrap">
        <ShopGrid
          initialItems={products.items}
          initialCursor={products.nextCursor}
          crafts={CRAFTS.filter((c) => c !== "Other")}
          whatsappNumber={settings?.whatsappNumber || "923469225580"}
          variant="full"
        />
      </main>
      <Footer settings={settings} />
    </>
  );
}
