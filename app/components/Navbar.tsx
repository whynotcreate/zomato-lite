// app/components/Navbar.tsx — the shared top bar: wordmark + BETA pill.
// Pure display; it holds no data and makes no requests.

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-5">
        <Link href="/" className="text-[22px] font-extrabold tracking-tight text-brand">
          zomato<span className="font-semibold text-[#b9b6b2]">lite</span>
        </Link>
        <span className="rounded-full bg-[#fbe9ea] px-3 py-1 text-[11px] font-bold tracking-widest text-brand">
          BETA
        </span>
      </div>
    </header>
  );
}
