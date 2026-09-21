import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import Story from "@/components/site/Story";
import VoicesStrip from "@/components/site/VoicesStrip";
import SuccessStoriesSection from "@/components/site/SuccessStoriesSection";
import GalleryGrid from "@/components/site/GalleryGrid";
import ShopGrid from "@/components/site/ShopGrid";
import LeaderCarousel from "@/components/site/LeaderCarousel";
import CabinetTree from "@/components/site/CabinetTree";
import DonateSection from "@/components/site/DonateSection";
import BecomeMemberSection from "@/components/site/BecomeMemberSection";
import PartnersSection from "@/components/site/PartnersSection";
import MapEmbed from "@/components/site/MapEmbed";
import Footer from "@/components/site/Footer";
import Seam from "@/components/shared/Seam";
import {
  getSettings,
  getFirstProducts,
  getFirstGalleryItems,
  getLeaders,
  getPartners,
  getCabinetMembers,
  getVoices,
  getSuccessStories,
} from "@/lib/data";
import { CRAFTS } from "@/lib/validation/product";
import { GALLERY_CATEGORIES } from "@/lib/validation/galleryItem";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, products, gallery, leaders, partners, cabinet, voices, successStories] = await Promise.all([
    getSettings(),
    getFirstProducts(8),
    getFirstGalleryItems(6),
    getLeaders(),
    getPartners(),
    getCabinetMembers(),
    getVoices(),
    getSuccessStories(),
  ]);

  return (
    <>
      <Nav active="Story" logo={settings?.logo} />
      <main id="main">
        <Hero settings={settings} />
        <Seam tone="night" />
        <Story settings={settings} />
        <Seam tone="paper" />

        <section className="section on-card" id="cabinet">
          <div className="wrap">
            <div className="kicker">
              <span className="num mono">02 — LEADERSHIP</span>
              <span className="rule"></span>
            </div>
            <div className="section-head center">
              <span className="section-eyebrow">The Cabinet</span>
              <h2>Who runs the Forum.</h2>
              <p>The Forum&apos;s leadership structure, from the Chairperson down.</p>
            </div>
            <CabinetTree members={cabinet} />
          </div>
        </section>

        <Seam tone="paper" />

        <VoicesStrip voices={voices} />
        <Seam tone="night" />

        {successStories.length > 0 && (
          <>
            <SuccessStoriesSection stories={successStories} />
            <Seam tone="paper" />
          </>
        )}

        <section className="section on-paper" id="gallery">
          <div className="wrap">
            <div className="kicker">
              <span className="num mono">05 — GALLERY</span>
              <span className="rule"></span>
            </div>
            <div className="section-head">
              <span className="section-eyebrow">In the workshop</span>
              <h2>Moments from around Skardu.</h2>
              <p>
                Craft circles, the Resource Center, and the shop shelf. Click a tile to view it
                fullscreen.
              </p>
            </div>
            <GalleryGrid
              initialItems={gallery.items}
              initialCursor={gallery.nextCursor}
              categories={GALLERY_CATEGORIES}
              variant="home"
            />
          </div>
        </section>

        <Seam tone="paper" />

        <section className="section on-card" id="shop">
          <div className="wrap">
            <div className="kicker">
              <span className="num mono">06 — THE SHOP</span>
              <span className="rule"></span>
            </div>
            <div className="section-head">
              <span className="section-eyebrow">Economic empowerment programme</span>
              <h2>Made by hand, sold by name.</h2>
              <p>
                Every piece is one of a kind, tagged with the member who made it. Pick a craft,
                then message us on WhatsApp — we&apos;ll confirm details, price, and delivery with
                you directly.
              </p>
            </div>
            <ShopGrid
              initialItems={products.items}
              initialCursor={products.nextCursor}
              crafts={CRAFTS.filter((c) => c !== "Other")}
              whatsappNumber={settings?.whatsappNumber || "923469225580"}
              variant="home"
            />
          </div>
        </section>

        {leaders.length > 0 && (
          <>
            <Seam tone="paper" />
            <section className="section on-paper" id="note">
              <div className="wrap">
                <div className="kicker">
                  <span className="num mono">07 — A NOTE</span>
                  <span className="rule"></span>
                </div>
                <div className="section-head center">
                  <span className="section-eyebrow">From the Leadership</span>
                  <h2>Why we started this.</h2>
                </div>
                <LeaderCarousel leaders={leaders} />
              </div>
            </section>
          </>
        )}

        <Seam tone="paper" />

        <DonateSection settings={settings} />

        <Seam tone="paper" />

        <BecomeMemberSection />

        <Seam tone="paper" />

        <PartnersSection partners={partners} />

        <Seam tone="night" />

        <section className="section on-night" id="contact">
          <div className="wrap">
            <div className="kicker">
              <span className="num mono">11 — GET IN TOUCH</span>
              <span className="rule"></span>
            </div>
            <div className="section-head">
              <span className="section-eyebrow">Say hello</span>
              <h2>Find us in Skardu.</h2>
              <p>
                Reach us on WhatsApp or email — see the footer below — or find the Resource
                Center on the map.
              </p>
            </div>
            <MapEmbed address={settings?.address} lat={settings?.mapLat} lng={settings?.mapLng} />
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
