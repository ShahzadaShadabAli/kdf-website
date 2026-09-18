import Image from "next/image";
import Reveal from "@/components/shared/Reveal";

const PILLARS = [
  {
    num: "01",
    title: "Advocacy & Rights",
    body: "Raising voice for the constitutional rights of persons with disabilities — a track record that includes the Disability Act, Gilgit-Baltistan 2019, passed with KDF, WHO, Sight Savers, and CHIP pushing the GB Assembly together.",
    icon: (
      <svg className="pillar-icon" viewBox="0 0 52 52" fill="none">
        <path
          d="M26 6 L44 14 V26 C44 37 36 45 26 47 C16 45 8 37 8 26 V14 Z"
          stroke="var(--teal)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M18 26 L23 32 L35 18"
          stroke="var(--clay)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    swatch: (
      <svg viewBox="0 0 120 90">
        <rect width="120" height="90" fill="var(--paper)" />
        <path
          d="M10 45 L40 15 L60 45 L80 10 L110 45"
          fill="none"
          stroke="var(--gold-soft)"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
        <path d="M0 70 L120 70" stroke="var(--teal)" strokeWidth="2" opacity="0.6" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Independent Living",
    body: "Running the Disability Assessment and Resource Center at DHQ Hospital and the Independent Living Centre near SCO Mess, RHQ Hospital — referrals, assistive devices, and rehabilitation support.",
    icon: (
      <svg className="pillar-icon" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="16" r="7" stroke="var(--teal)" strokeWidth="2" />
        <path d="M12 42 c0-9 6-15 14-15s14 6 14 15" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 27 v10 M20 34 h12" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    swatch: (
      <svg viewBox="0 0 120 90">
        <rect width="120" height="90" fill="var(--paper)" />
        <circle cx="60" cy="45" r="14" fill="none" stroke="var(--clay-soft)" strokeWidth="4" />
        <circle cx="60" cy="45" r="28" fill="none" stroke="var(--gold-soft)" strokeWidth="4" opacity="0.7" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Economic Empowerment",
    body: "The Stationary Shop social enterprise, running since 2011, reinvests 80% of its profit back into the business — livelihood and skill enhancement in members' own hands, not charity.",
    icon: (
      <svg className="pillar-icon" viewBox="0 0 52 52" fill="none">
        <rect x="10" y="18" width="32" height="22" rx="3" stroke="var(--teal)" strokeWidth="2" />
        <path d="M10 24 h32" stroke="var(--teal)" strokeWidth="2" />
        <circle cx="26" cy="14" r="4" fill="var(--clay)" />
      </svg>
    ),
    swatch: (
      <svg viewBox="0 0 120 90">
        <rect width="120" height="90" fill="var(--paper)" />
        <path
          d="M10 15 L10 75 M28 15 L28 75 M46 15 L46 75 M64 15 L64 75 M82 15 L82 75 M100 15 L100 75"
          stroke="var(--gold-soft)"
          strokeWidth="3"
          opacity="0.75"
        />
      </svg>
    ),
  },
];

export default function Story({ settings }) {
  const storyImage = settings?.storyImage;
  return (
    <section className="section on-paper" id="story">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">01 — ORIGIN</span>
          <span className="rule"></span>
        </div>
        <div className="story-grid">
          <Reveal className="story-figure">
            <div className="collage">
              <div className="collage-board"></div>
              <div className="collage-pin" aria-hidden="true"></div>
              <div className="collage-item collage-ridge" aria-hidden={!storyImage?.url}>
                {storyImage?.url ? (
                  <Image src={storyImage.url} alt={storyImage.alt || "KDF's story"} fill sizes="240px" style={{ objectFit: "cover" }} />
                ) : (
                  <svg viewBox="0 0 240 170" preserveAspectRatio="xMidYMid slice">
                    <rect width="240" height="170" fill="var(--night)" />
                    <path d="M0 140 L50 70 L90 110 L140 40 L190 120 L240 80 L240 170 L0 170 Z" fill="var(--night3)" />
                    <path
                      d="M0 140 L50 70 L90 110 L140 40 L190 120 L240 80"
                      fill="none"
                      stroke="var(--gold-soft)"
                      strokeWidth="1.6"
                      strokeDasharray="5 6"
                      opacity="0.75"
                    />
                  </svg>
                )}
              </div>
              <div className="collage-item collage-swatch" aria-hidden="true">
                <svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice">
                  <rect width="160" height="160" fill="var(--card)" />
                  <path d="M12 12 L30 30 M30 12 L12 30" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M12 44 L30 62 M30 44 L12 62" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M44 12 L62 30 M62 12 L44 30" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M44 44 L62 62 M62 44 L44 62" stroke="var(--clay)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M12 76 L30 94 M30 76 L12 94" stroke="var(--clay)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M44 76 L62 94 M62 76 L44 94" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div className="collage-item collage-seal" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="58" fill="var(--clay)" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="var(--card)" strokeWidth="1.4" strokeDasharray="3 5" opacity="0.8" />
                  <text x="60" y="55" textAnchor="middle" fontFamily="PT Serif, serif" fontWeight="700" fontSize="22" fill="var(--card)">
                    est.
                  </text>
                  <text x="60" y="80" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="15" fill="var(--card)">
                    2011
                  </text>
                </svg>
              </div>
            </div>
          </Reveal>
          <div className="story-copy">
            <span className="story-since">Since 2011</span>
            <p>
              <strong>Before 2008, Baltistan had no organisation led by persons with disabilities
              themselves.</strong> A CHIP-run project that year began sensitising 31 villages to
              disability rights, and by 2011 the self-help groups it had formed were ready to
              stand on their own — in July that year, their members decided to form Karakoram
              Disability Forum. KDF was registered on 6th October 2011 under the Voluntary
              Social Welfare Agencies Registration &amp; Control Ordinance 1961 (registration no.
              RA-SKD-311/2011), and today counts 45 general body members and a 6-member
              executive body.
            </p>
            <p>
              Its vision: <em>&quot;An inclusive society where every member of the community has
              access to all services, information and opportunities irrespective of their
              different statuses and abilities.&quot;</em> Its mission: to contribute to inclusive
              development by realising and fulfilling self-responsibility, helping each other in
              a disciplined way — built on three core values: Unity, Faith, and Justice.
            </p>
            <p>
              None of it is separate. A member who gets an assistive device this month may be the
              one arguing for a Disability Act in the GB Assembly next year, or running the
              Stationary Shop the year after. The thread runs through all of it.
            </p>
          </div>
        </div>

        <div className="pillars" id="craft">
          {PILLARS.map((p) => (
            <Reveal as="div" className="ledger-row" key={p.num}>
              <span className="ledger-num">{p.num}</span>
              {p.icon}
              <div className="ledger-body">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
              <div className="ledger-swatch">{p.swatch}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
