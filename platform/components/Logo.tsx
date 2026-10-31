import Link from "next/link";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold select-none">
      <span
        className={`grid place-items-center rounded-xl btn-primary ${small ? "h-8 w-8 text-base" : "h-10 w-10 text-lg"}`}
        aria-hidden
      >
        ب
      </span>
      <span className={small ? "text-lg" : "text-2xl"}>بنّاء</span>
    </Link>
  );
}
