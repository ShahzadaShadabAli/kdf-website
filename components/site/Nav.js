"use client";
import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#story", label: "Story" },
  { href: "/#cabinet", label: "Cabinet" },
  { href: "/#voices", label: "Voices" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/#donate", label: "Donate" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav({ active }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <svg className="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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
          Karakoram Disability Forum
        </Link>
        <button
          className="burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="navLinks"
          onClick={() => setOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`nav-links${open ? " open" : ""}`} id="navLinks">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={active === l.label ? "active" : ""} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="/#become-a-member">
          Become a Member
        </a>
      </div>
    </header>
  );
}
