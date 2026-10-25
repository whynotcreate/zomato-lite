// app/components/RatingChip.tsx — the coloured square that carries a rating.
// Colour is pure presentation: 4–5 green, 2–3 amber, 1 red.

const COLOR: Record<number, string> = {
  1: "var(--bad)",
  2: "var(--meh)",
  3: "var(--meh)",
  4: "var(--good)",
  5: "var(--good)",
};

export default function RatingChip({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-[15px] font-bold text-white ${className}`}
      style={{ background: COLOR[rating] ?? "var(--muted)" }}
    >
      {rating}
    </span>
  );
}
