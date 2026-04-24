import type { IconType } from "react-icons";
import {
  LuArrowDownToLine,
  LuArrowRight,
  LuBookmark,
  LuChartColumn,
  LuChevronDown,
  LuClock3,
  LuLink,
  LuList,
  LuMoon,
  LuPackage,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuSparkles,
  LuStore,
  LuSun,
  LuTrash2,
} from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa6";
import { HiOutlinePresentationChartLine } from "react-icons/hi2";

type IconName =
  | "brand"
  | "sun"
  | "moon"
  | "plus"
  | "spark"
  | "save"
  | "bookmark"
  | "box"
  | "chart"
  | "list"
  | "edit"
  | "sync"
  | "arrow-right"
  | "clock"
  | "store"
  | "link"
  | "chevron-down"
  | "trash"
  | "facebook";

const iconMap: Record<IconName, IconType> = {
  "arrow-right": LuArrowRight,
  bookmark: LuBookmark,
  box: LuPackage,
  brand: HiOutlinePresentationChartLine,
  chart: LuChartColumn,
  "chevron-down": LuChevronDown,
  clock: LuClock3,
  edit: LuPencil,
  facebook: FaFacebookF,
  link: LuLink,
  list: LuList,
  moon: LuMoon,
  plus: LuPlus,
  save: LuArrowDownToLine,
  spark: LuSparkles,
  store: LuStore,
  sun: LuSun,
  sync: LuRefreshCw,
  trash: LuTrash2,
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const Component = iconMap[name];
  return <Component className={className} aria-hidden="true" />;
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
      <rect
        x="30"
        y="28"
        width="500"
        height="364"
        rx="36"
        fill="url(#heroStage)"
        stroke="var(--border)"
      />
      <circle cx="424" cy="88" r="92" fill="url(#heroGlow)" />

      <rect
        x="64"
        y="64"
        width="302"
        height="204"
        rx="28"
        fill="url(#heroPanel)"
        stroke="var(--border)"
      />
      <rect x="92" y="92" width="88" height="22" rx="11" fill="var(--accent-soft)" />
      <rect
        x="190"
        y="94"
        width="70"
        height="18"
        rx="9"
        fill="var(--surface-strong)"
      />
      <rect
        x="92"
        y="130"
        width="240"
        height="12"
        rx="6"
        fill="var(--surface-strong)"
        opacity="0.85"
      />
      <rect
        x="92"
        y="154"
        width="188"
        height="12"
        rx="6"
        fill="var(--surface-strong)"
        opacity="0.55"
      />

      <rect x="92" y="192" width="92" height="48" rx="18" fill="var(--accent-soft)" />
      <rect
        x="198"
        y="192"
        width="74"
        height="48"
        rx="18"
        fill="var(--surface-strong)"
      />
      <rect
        x="286"
        y="192"
        width="46"
        height="48"
        rx="18"
        fill="var(--surface-strong)"
      />
      <rect x="108" y="206" width="32" height="20" rx="10" fill="url(#heroAccent)" />
      <rect x="210" y="206" width="48" height="20" rx="10" fill="var(--surface)" />

      <rect
        x="362"
        y="98"
        width="118"
        height="154"
        rx="26"
        fill="var(--surface)"
        stroke="var(--border)"
      />
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

      <rect
        x="92"
        y="294"
        width="356"
        height="66"
        rx="26"
        fill="var(--surface)"
        stroke="var(--border)"
      />
      <text x="118" y="320" fill="var(--muted)" fontSize="11" letterSpacing="2.8">
        TRACKED METRICS
      </text>
      <text x="118" y="346" fill="var(--text)" fontSize="24" fontWeight="600">
        Price, margin, and demand signals
      </text>
      <rect x="372" y="310" width="52" height="34" rx="17" fill="var(--surface-strong)" />
      <rect x="387" y="320" width="22" height="14" rx="7" fill="url(#heroAccent)" />
    </svg>
  );
}
