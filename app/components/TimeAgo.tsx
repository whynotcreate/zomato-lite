// app/components/TimeAgo.tsx — turns a timestamp into "just now", "6m ago",
// or "13 days ago", and keeps itself fresh every 30 seconds.
// It formats a fact the backend already sent; it computes no product logic.

"use client";

import { useEffect, useState } from "react";

function format(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function TimeAgo({ iso, className = "" }: { iso: string; className?: string }) {
  const [label, setLabel] = useState(() => format(iso));

  useEffect(() => {
    const tick = () => setLabel(format(iso));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [iso]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
