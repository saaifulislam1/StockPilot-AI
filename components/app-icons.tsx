export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "brand"
    | "sun"
    | "moon"
    | "plus"
    | "spark"
    | "save"
    | "box"
    | "chart"
    | "list"
    | "edit"
    | "arrow-right"
    | "clock"
    | "store"
    | "link"
    | "chevron-down"
    | "trash"
    | "facebook";
  className?: string;
}) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "brand":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="4" />
          <path d="M7 15h2.6L12 8l2.4 7H17" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.5" />
          <path d="M12 19.5V22" />
          <path d="M4.9 4.9 6.7 6.7" />
          <path d="m17.3 17.3 1.8 1.8" />
          <path d="M2 12h2.5" />
          <path d="M19.5 12H22" />
          <path d="m4.9 19.1 1.8-1.8" />
          <path d="m17.3 6.7 1.8-1.8" />
        </svg>
      );
    case "moon":
      return (
        <svg {...props}>
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props}>
          <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        </svg>
      );
    case "save":
      return (
        <svg {...props}>
          <path d="M5 21h14" />
          <path d="M12 3v14" />
          <path d="m7 12 5 5 5-5" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="M12 12 4 7.5" />
          <path d="M12 12l8-4.5" />
          <path d="M12 21v-9" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-3" />
        </svg>
      );
    case "list":
      return (
        <svg {...props}>
          <path d="M8 6h12" />
          <path d="M8 12h12" />
          <path d="M8 18h12" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
          <path d="m13.5 6.5 3 3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case "store":
      return (
        <svg {...props}>
          <path d="M4 10h16" />
          <path d="M6 10V7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5V10" />
          <path d="M5 10v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
          <path d="M10 14h4" />
        </svg>
      );
    case "link":
      return (
        <svg {...props}>
          <path d="M10 14 7.5 16.5a3 3 0 1 1-4.2-4.2L5.8 9.8" />
          <path d="m14 10 2.5-2.5a3 3 0 0 1 4.2 4.2l-2.5 2.5" />
          <path d="m8.5 15.5 7-7" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path d="M4 7h16" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          <path d="M6.5 7 7 19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l.5-12" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <path d="M14.5 8H17V4.5h-2.5C11.9 4.5 10 6.4 10 9v2H7v3.5h3V20h3.5v-5.5H16L16.5 11H13.5V9c0-.6.4-1 1-1Z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
  }
}

export function HeroArtwork() {
  return (
    <svg
      viewBox="0 0 560 420"
      className="h-auto w-full max-w-[460px]"
      role="img"
      aria-label="Product research dashboard illustration"
    >
      <defs>
        <linearGradient id="heroStage" x1="5%" y1="8%" x2="95%" y2="92%">
          <stop offset="0%" stopColor="var(--surface-strong)" />
          <stop offset="100%" stopColor="var(--surface)" />
        </linearGradient>
        <linearGradient id="heroPanel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--surface)" />
          <stop offset="100%" stopColor="var(--surface-muted)" />
        </linearGradient>
        <linearGradient id="heroAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-strong)" />
        </linearGradient>
        <linearGradient id="heroWarm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F39C6B" />
          <stop offset="100%" stopColor="#FF3864" />
        </linearGradient>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="rgba(255,56,100,0.28)" />
          <stop offset="100%" stopColor="rgba(255,56,100,0)" />
        </radialGradient>
      </defs>
      <rect x="30" y="28" width="500" height="364" rx="36" fill="url(#heroStage)" stroke="var(--border)" />
      <circle cx="424" cy="88" r="92" fill="url(#heroGlow)" />

      <rect x="64" y="64" width="302" height="204" rx="28" fill="url(#heroPanel)" stroke="var(--border)" />
      <rect x="92" y="92" width="88" height="22" rx="11" fill="var(--accent-soft)" />
      <rect x="190" y="94" width="70" height="18" rx="9" fill="var(--surface-strong)" />
      <rect x="92" y="130" width="240" height="12" rx="6" fill="var(--surface-strong)" opacity="0.85" />
      <rect x="92" y="154" width="188" height="12" rx="6" fill="var(--surface-strong)" opacity="0.55" />

      <rect x="92" y="192" width="92" height="48" rx="18" fill="var(--accent-soft)" />
      <rect x="198" y="192" width="74" height="48" rx="18" fill="var(--surface-strong)" />
      <rect x="286" y="192" width="46" height="48" rx="18" fill="var(--surface-strong)" />
      <rect x="108" y="206" width="32" height="20" rx="10" fill="url(#heroAccent)" />
      <rect x="210" y="206" width="48" height="20" rx="10" fill="var(--surface)" />

      <rect x="362" y="98" width="118" height="154" rx="26" fill="var(--surface)" stroke="var(--border)" />
      <rect x="386" y="124" width="70" height="12" rx="6" fill="var(--surface-strong)" />
      <rect x="386" y="152" width="46" height="46" rx="16" fill="url(#heroWarm)" />
      <rect x="438" y="152" width="18" height="46" rx="9" fill="var(--surface-strong)" />
      <rect x="386" y="214" width="70" height="10" rx="5" fill="var(--accent-soft)" />

      <path
        d="M380 270c20 0 38-9 51-24l34-39c10-12 16-28 16-44v-9"
        fill="none"
        stroke="var(--accent-soft)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <circle cx="482" cy="130" r="38" fill="url(#heroAccent)" />
      <path d="M464 130h36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M482 112v36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />

      <rect x="92" y="294" width="356" height="66" rx="26" fill="var(--surface)" stroke="var(--border)" />
      <text
        x="118"
        y="320"
        fill="var(--muted)"
        fontSize="11"
        letterSpacing="2.8"
      >
        MARKET AVG
      </text>
      <text
        x="118"
        y="348"
        fill="var(--text)"
        fontSize="28"
        fontWeight="700"
      >
        BDT 1,854
      </text>
      <rect x="286" y="316" width="126" height="12" rx="6" fill="var(--surface-strong)" />
      <rect x="286" y="316" width="94" height="12" rx="6" fill="url(#heroAccent)" />

      <rect x="366" y="42" width="108" height="34" rx="17" fill="url(#heroWarm)" opacity="0.95" />
      <text
        x="387"
        y="64"
        fill="#ffffff"
        fontSize="13"
        fontWeight="600"
      >
        Margin +35%
      </text>
    </svg>
  );
}
