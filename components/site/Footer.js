export default function Footer({ settings }) {
  const whatsapp = settings?.whatsappNumber || "923469225580";
  const email = settings?.contactEmail || "kdf_dpo.skardu@hotmail.com";
  const address =
    settings?.address ||
    "Skardu Independent Living Centre (ILC), Near SCO Mess, RHQ Hospital, Opp. Boys High School No.1, Skardu, GB";

  const socials = [
    {
      key: "facebook",
      url: settings?.facebookUrl,
      label: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      url: settings?.instagramUrl,
      label: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      url: settings?.whatsappUrl || `https://wa.me/${whatsapp}`,
      label: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.24.68-1.38 1.3-1.9 1.35-.5.05-1.03.24-3.45-.72-2.9-1.16-4.77-4.1-4.92-4.3-.15-.2-1.17-1.56-1.17-2.98s.75-2.1 1.02-2.38c.26-.28.57-.35.76-.35h.55c.18 0 .43-.07.66.5.24.58.8 2 .87 2.14.07.15.12.32.02.5-.1.2-.15.32-.3.5-.15.17-.3.38-.44.5-.15.15-.3.3-.13.6.17.3.75 1.24 1.6 2 1.1.98 2.02 1.28 2.32 1.43.3.15.48.13.66-.08.18-.2.75-.87.96-1.17.2-.3.4-.25.68-.15.28.1 1.78.84 2.08.99.3.15.5.22.58.35.07.13.07.75-.17 1.43z" />
        </svg>
      ),
    },
    {
      key: "linkedin",
      url: settings?.linkedinUrl,
      label: "LinkedIn",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 13v4" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      url: settings?.tiktokUrl,
      label: "TikTok",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M14 3v11.5a3.5 3.5 0 11-3.5-3.5" />
          <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
        </svg>
      ),
    },
  ].filter((s) => s.url);

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <h3>Karakoram Disability Forum</h3>
          <p>
            A disabled persons&apos; organisation in Skardu working on rights, independent
            living, and economic empowerment since 2011.
          </p>
          {socials.length > 0 && (
            <div className="foot-socials">
              {socials.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3>Visit</h3>
          <ul className="foot-links">
            <li>
              <a href="/#story">Story</a>
            </li>
            <li>
              <a href="/#voices">Voices</a>
            </li>
            <li>
              <a href="/gallery">Gallery</a>
            </li>
            <li>
              <a href="/shop">Shop</a>
            </li>
            <li>
              <a href="/#become-a-member">Become a Member</a>
            </li>
            <li>
              <a href="/#donate">Donate</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>Reach us</h3>
          <ul className="foot-links">
            <li>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">
                WhatsApp / +{whatsapp}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>{address}</li>
          </ul>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} Karakoram Disability Forum</span>
        <span>Skardu, Gilgit-Baltistan</span>
      </div>
    </footer>
  );
}
