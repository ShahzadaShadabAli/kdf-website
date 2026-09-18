"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/swrFetcher";

const NAV = [
  { section: null, items: [{ href: "/admin", label: "Dashboard", icon: "grid" }] },
  {
    section: "Content",
    items: [
      { href: "/admin/products", label: "Products", icon: "box" },
      { href: "/admin/gallery", label: "Gallery", icon: "image" },
      { href: "/admin/leaders", label: "Leaders", icon: "users" },
      { href: "/admin/voices", label: "Voices & Work", icon: "quote" },
      { href: "/admin/cabinet", label: "Cabinet", icon: "tree" },
      { href: "/admin/partners", label: "Partners", icon: "handshake" },
    ],
  },
  {
    section: "Inbox",
    items: [
      { href: "/admin/membership-requests", label: "Membership Requests", icon: "badge" },
      { href: "/admin/contact-messages", label: "Contact Messages", icon: "mail" },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: "gear", superOnly: true },
      { href: "/admin/users", label: "Users", icon: "people", superOnly: true },
      { href: "/admin/account", label: "My Account", icon: "gear" },
    ],
  },
];

const ICONS = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M12 7.5V12M12 12L6 16.5M12 12l6 4.5" />
    </svg>
  ),
  handshake: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12l5-5 4 2 3-3 5 5" />
      <path d="M6 8l6 6 3-3" />
      <path d="M14 12l3 3" />
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 13 6 22l6-3 6 3-2.5-9" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 8c-2 0-3.5 1.5-3.5 4S5 15.5 7 15c0 2-1 3-2.5 3.5" />
      <path d="M16 8c-2 0-3.5 1.5-3.5 4S14 15.5 16 15c0 2-1 3-2.5 3.5" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1H3a2 2 0 010-4h.09A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.55V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.55 1H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.55 1z" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-4 3-6.5 7-6.5S16 17 16 21" />
      <path d="M17 8a3 3 0 110 6" />
      <path d="M22 21c0-3-1.9-5.3-4.5-6" />
    </svg>
  ),
};

const TITLES = {
  "/admin": ["Dashboard", "Overview of the site's content and activity"],
  "/admin/products": ["Products", "Manage the shop catalogue"],
  "/admin/gallery": ["Gallery", "Manage photo essay images"],
  "/admin/leaders": ["Leaders", "Manage the Leader's Note carousel"],
  "/admin/voices": ["Voices & Work", "Manage the homepage quote/vignette strip"],
  "/admin/cabinet": ["Cabinet", "Manage the leadership org chart"],
  "/admin/partners": ["Partners", "Manage funder & partner logos"],
  "/admin/membership-requests": ["Membership Requests", "Honorary and permanent member applications"],
  "/admin/contact-messages": ["Contact Messages", "General inquiries from the footer form"],
  "/admin/settings": ["Settings", "Editable site copy and contact details"],
  "/admin/users": ["Users", "Manage admin accounts and roles"],
  "/admin/account": ["My Account", "Change your own login password"],
};

export default function AdminShell({ session, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const role = session?.user?.role;
  const [title, sub] = TITLES[pathname] || ["Admin", ""];

  const { data: membershipData } = useSWR("/api/membership?status=new&limit=100", fetcher);
  const { data: contactData } = useSWR("/api/contact?status=new&limit=100", fetcher);
  const badgeCounts = {
    "/admin/membership-requests": membershipData?.items?.length || 0,
    "/admin/contact-messages": contactData?.items?.length || 0,
  };

  return (
    <div className="admin-shell">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-brand">
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M6 30 C 6 18, 14 8, 20 8 S 34 18, 34 30"
              stroke="var(--gold)"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
            <circle cx="20" cy="8" r="2.6" fill="var(--clay-soft)" />
            <circle cx="6" cy="30" r="2.6" fill="var(--teal-soft)" />
            <circle cx="34" cy="30" r="2.6" fill="var(--teal-soft)" />
          </svg>
          KDF Admin
        </div>
        <nav className="sidebar-nav">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && <div className="side-group-label">{group.section}</div>}
              {group.items
                .filter((item) => !item.superOnly || role === "super_admin")
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`side-link${pathname === item.href ? " active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    {ICONS[item.icon]}
                    {item.label}
                    {badgeCounts[item.href] > 0 && <span className="badge">{badgeCounts[item.href]}</span>}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}</div>
          <div className="sidebar-user-info">
            <strong>{session?.user?.name || session?.user?.email}</strong>
            <span>{role === "super_admin" ? "super admin" : "editor"}</span>
          </div>
          <button className="logout-btn" aria-label="Log out" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="mobile-menu-btn" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div>
              <h2>{title}</h2>
              <div className="topbar-sub">{sub}</div>
            </div>
          </div>
          <a className="admin-btn admin-btn-outline" href="/" target="_blank" rel="noopener">
            View Site ↗
          </a>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
