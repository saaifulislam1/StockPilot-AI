import type { IconType } from "react-icons";
import { FcGoogle } from "react-icons/fc";
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
  | "facebook"
  | "google";

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
  google: FcGoogle,
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
      <circle cx="404" cy="108" r="92" fill="url(#heroGlow)" />

      <rect
        x="64"
        y="64"
        width="262"
        height="224"
        rx="28"
        fill="url(#heroPanel)"
        stroke="var(--border)"
      />
      <text x="92" y="96" fill="var(--muted)" fontSize="11" letterSpacing="2.8">
        COMPETITOR SNAPSHOT
      </text>
      <text x="92" y="126" fill="var(--text)" fontSize="24" fontWeight="600">
        Market pricing
      </text>

      <rect x="92" y="150" width="206" height="44" rx="18" fill="var(--surface)" />
      <text x="110" y="168" fill="var(--muted)" fontSize="10" letterSpacing="1.8">
        WEBSITE AVG
      </text>
      <text x="110" y="184" fill="var(--text)" fontSize="20" fontWeight="600">
        BDT 1,780
      </text>
      <rect x="240" y="162" width="38" height="20" rx="10" fill="var(--accent-soft)" />

      <rect x="92" y="206" width="206" height="44" rx="18" fill="var(--surface)" />
      <text x="110" y="224" fill="var(--muted)" fontSize="10" letterSpacing="1.8">
        FACEBOOK AVG
      </text>
      <text x="110" y="240" fill="var(--text)" fontSize="20" fontWeight="600">
        BDT 1,640
      </text>
      <rect x="228" y="218" width="50" height="20" rx="10" fill="url(#heroWarm)" />

      <rect x="336" y="78" width="136" height="126" rx="26" fill="var(--surface)" stroke="var(--border)" />
      <text x="360" y="108" fill="var(--muted)" fontSize="10" letterSpacing="1.8">
        TARGET MARGIN
      </text>
      <text x="360" y="154" fill="var(--text)" fontSize="38" fontWeight="700">
        34%
      </text>
      <rect x="360" y="168" width="88" height="12" rx="6" fill="var(--surface-strong)" />
      <rect x="360" y="168" width="58" height="12" rx="6" fill="url(#heroAccent)" />

      <rect x="316" y="224" width="166" height="102" rx="28" fill="var(--surface)" stroke="var(--border)" />
      <text x="336" y="254" fill="var(--muted)" fontSize="10" letterSpacing="1.8">
        LAUNCH BUDGET
      </text>
      <text x="336" y="290" fill="var(--text)" fontSize="24" fontWeight="700">
        BDT 40,800
      </text>
      <text x="336" y="310" fill="var(--muted)" fontSize="9" letterSpacing="0.2">
        Upfront cash for first batch
      </text>

      <path
        d="M118 332c24 0 45-5 63-15 17-10 32-22 45-36 19-20 39-35 58-45 24-11 51-16 84-16"
        fill="none"
        stroke="var(--accent-soft)"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="366" cy="220" r="10" fill="url(#heroAccent)" />
      <circle cx="418" cy="207" r="13" fill="url(#heroWarm)" />

      <rect x="92" y="310" width="176" height="50" rx="22" fill="var(--surface)" stroke="var(--border)" />
      <text x="114" y="331" fill="var(--muted)" fontSize="10" letterSpacing="2">
        DECISION VIEW
      </text>
      <text x="114" y="349" fill="var(--text)" fontSize="11.5" fontWeight="600">
        Track prices. Hold margin.
      </text>
    </svg>
  );
}
