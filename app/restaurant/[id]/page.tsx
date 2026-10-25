// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Calls GET /api/restaurants/[id] and renders what it gets.
// NO maths in this file: no adding, no dividing, no sorting.
// averageRating, totalReviews and latestReview were all computed by the API.
// (Formatting dates and taking initials is display work, not product logic.)

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import RatingChip from "@/app/components/RatingChip";
import TimeAgo from "@/app/components/TimeAgo";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantPageData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

// "Ludhiana Burrito" -> "LB". Pure display formatting.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "•";
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<RestaurantPageData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`).then((res) => {
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      res.json().then(setData);
    });
  }, [id]);

  return (
    <main className="min-h-screen">
      <Navbar />

      {notFound ? (
        <div className="mx-auto mt-10 max-w-xl px-5">
          <div className="rise rounded-2xl bg-white p-10 text-center shadow-card">
            <p className="font-bold">This restaurant does not exist.</p>
          </div>
        </div>
      ) : !data ? (
        <div className="mx-auto mt-10 max-w-xl px-5">
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#e8e7e4]">
            <div className="loading-line h-full w-1/3 rounded-full bg-brand" />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xl px-5 pb-32">
          {/* --- The restaurant card ------------------------------------------------ */}
          <section
            className="rise mt-5 overflow-hidden rounded-2xl bg-white shadow-card"
            style={{ animationDelay: "0ms" }}
          >
            {/* Red banner with the dotted texture and the initials */}
            <div
              className="flex h-36 items-end p-5"
              style={{
                background:
                  "radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.5px) 0 0/16px 16px, var(--brand)",
              }}
            >
              <span className="text-4xl font-extrabold text-white">{initials(data.name)}</span>
            </div>

            {/* Name, tags, review count — and the rating badge overlapping the banner */}
            <div className="flex items-start gap-4 p-5 pt-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-[22px] font-extrabold leading-tight">{data.name}</h1>
                <p className="mt-0.5 text-sm text-muted">{data.area}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f2f2ef] px-3 py-1 text-xs font-semibold text-[#55524e]">
                    {data.cuisine}
                  </span>
                  <span className="rounded-full bg-[#f2f2ef] px-3 py-1 text-xs font-semibold text-[#55524e]">
                    Dine-in
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Based on {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
                </p>
              </div>

              {/* This prints the API's computed number — it calculates nothing.
                  With no reviews there is nothing to print, so it shows "New". */}
              <div className="pop -mt-14 grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30"
                style={{ animationDelay: "150ms" }}
              >
                {data.averageRating !== null ? (
                  <div className="text-center leading-none">
                    <div className="text-[20px] font-extrabold">{data.averageRating}</div>
                    <div className="mt-1 text-[11px] font-semibold opacity-80">
                      {data.totalReviews}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-bold">New</div>
                )}
              </div>
            </div>
          </section>

          {/* --- Latest review (highlighted) ---------------------------------------- */}
          {data.latestReview && (
            <section className="mt-7">
              <h2
                className="rise mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted"
                style={{ animationDelay: "80ms" }}
              >
                Latest review
              </h2>
              <article
                className="rise relative rounded-r-xl border-l-[3px] border-brand bg-white p-4 pt-5 shadow-card"
                style={{ animationDelay: "140ms" }}
              >
                {/* the animated accent line, drawing down the left edge */}
                <span
                  className="draw-line absolute inset-y-0 -left-[3px] w-[3px] rounded-full bg-brand"
                  aria-hidden
                />
                <span className="absolute -top-2.5 left-4 rounded-full bg-brand px-2.5 py-[3px] text-[10px] font-bold tracking-widest text-white shadow-sm">
                  LATEST
                </span>
                <div className="flex items-center gap-3">
                  <RatingChip rating={data.latestReview.rating} className="pop" />
                  <TimeAgo
                    iso={data.latestReview.createdAt}
                    className="ml-auto text-xs text-muted"
                  />
                </div>
                <p className="mt-3 text-[15px] leading-snug">{data.latestReview.comment}</p>
              </article>
            </section>
          )}

          {/* --- Earlier reviews (newest first, ordering done by the API) ------------ */}
          {data.reviews.length > 0 && (
            <section className="mt-7">
              <h2
                className="rise mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted"
                style={{ animationDelay: "200ms" }}
              >
                Earlier reviews
              </h2>
              <ul className="space-y-3">
                {data.reviews.map((review, i) => (
                  <li
                    key={review.id}
                    className="rise rounded-xl bg-white p-4 shadow-card"
                    style={{ animationDelay: `${260 + i * 45}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <RatingChip rating={review.rating} className="pop" />
                      <TimeAgo iso={review.createdAt} className="ml-auto text-xs text-muted" />
                    </div>
                    <p className="mt-3 text-[15px] leading-snug">{review.comment}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* --- Empty state: invite the first review -------------------------------- */}
          {data.totalReviews === 0 && (
            <div
              className="rise mt-7 rounded-2xl bg-white p-10 text-center shadow-card"
              style={{ animationDelay: "100ms" }}
            >
              <p className="text-3xl" aria-hidden> ☆ </p>
              <p className="mt-3 font-bold">No reviews yet.</p>
              <p className="mt-1 text-sm text-muted">Be the first to say what you thought.</p>
            </div>
          )}
        </div>
      )}

      {/* --- Fixed bottom action bar ------------------------------------------------ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-xl px-5 pb-4 pt-3">
          <Link
            href={`/review/${id}`}
            className="block w-full rounded-xl bg-brand py-3.5 text-center text-[15px] font-bold text-white transition-all hover:bg-brand-press active:scale-[0.99]"
          >
            Write a Review
          </Link>
        </div>
      </div>
    </main>
  );
}
