import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="bannaa-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset=".55" stopColor="#d946ef" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#bannaa-g)" />
      {/* stacked blocks: the "b" of Bannaa built from bricks */}
      <rect x="8" y="7" width="5" height="18" rx="2" fill="#fff" />
      <rect x="14" y="14" width="10" height="5" rx="2" fill="#fff" opacity=".85" />
      <rect x="14" y="20" width="10" height="5" rx="2" fill="#fff" opacity=".65" />
    </svg>
  );
}

export function Logo({ small = false, href = "/" }: { small?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 select-none group" aria-label="Bannaa home">
      <span className="transition-transform group-hover:rotate-[-6deg]">
        <LogoMark size={small ? 26 : 32} />
      </span>
      <span className={`font-semibold tracking-tight ${small ? "text-[15px]" : "text-lg"}`}>Bannaa</span>
    </Link>
  );
}
