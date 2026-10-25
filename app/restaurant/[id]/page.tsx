// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Calls GET /api/restaurants/[id] and renders what it gets.
// NO maths in this file: no adding, no dividing, no sorting.
// averageRating, totalReviews and latestReview were all computed by the API.
// (Formatting dates and taking initials is display work, not product logic.)

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import RatingChip from "@/app/components/RatingChip";
import TimeAgo from "@/app/components/TimeAgo";
import hero from "../../../public/hero.jpg";

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

// Loading state: a quiet skeleton in the shape of the real page,
// so the content swaps in without the page jumping.
function Skeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading">
      <div className="h-40 rounded-2xl bg-[#e8e7e4]" />
      <div className="mt-4 space-y-2 px-2">
        <div className="h-6 w-2/3 rounded bg-[#e8e7e4]" />
        <div className="h-4 w-1/3 rounded bg-[#e8e7e4]" />
        <div className="h-4 w-1/2 rounded bg-[#e8e7e4]" />
      </div>
      <div className="mt-8 h-40 rounded-xl bg-white" />
      <div className="mt-6 mb-3 h-3 w-40 rounded bg-[#e8e7e4]" />
      <div className="mt-2 h-24 rounded-xl bg-white" />
      <div className="mt-3 h-24 rounded-xl bg-white" />
    </div>
  );
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
        <div className="mx-auto max-w-xl px-5 pt-5">
          <Skeleton />
        </div>
      ) : (
        <div className="mx-auto max-w-xl px-5 pb-32">
          {/* --- The restaurant card ------------------------------------------------ */}
          <section
            className="rise mt-5 overflow-hidden rounded-2xl bg-white shadow-card"
            style={{ animationDelay: "0ms" }}
          >
            {/* Hero photo with a warm bottom gradient so the initials read clearly */}
            <div className="relative h-40">
              <Image
                src={hero}
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 576px"
                className="kenburns object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(28,27,26,0.55), rgba(28,27,26,0.05) 55%), linear-gradient(120deg, rgba(224,82,82,0.28), rgba(224,82,82,0) 60%)",
                }}
              />
              <span className="absolute bottom-4 left-5 text-4xl font-extrabold text-white drop-shadow-md">
                {initials(data.name)}
              </span>
            </div>

            {/* Name, tags, review count — and the rating badge straddling the boundary */}
            <div className="flex items-start gap-4 px-5 pb-5 pt-3.5">
              <div className="min-w-0 flex-1">
                <h1 className="text-[22px] font-extrabold leading-tight">{data.name}</h1>
                <p className="mt-0.5 text-sm text-muted">{data.area}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#fdecec] px-3 py-1 text-xs font-semibold text-brand">
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
              <div
                className="pop -mt-14 grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl bg-brand text-white ring-4 ring-white transition-transform duration-200 hover:scale-105"
                style={{ animationDelay: "150ms" }}
              >
                {data.averageRating !== null ? (
                  <div className="text-center leading-none">
                    <div className="text-[22px] font-extrabold tracking-tight">
                      {data.averageRating}
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-0.5 text-[11px] font-semibold opacity-90">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
                        <path d="M12 17.6 6.4 20.5l1.1-6.2-4.5-4.4 6.2-.9L12 2.9l2.8 6.1 6.2.9-4.5 4.4 1.1 6.2z" />
                      </svg>
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
                className="rise card-lift relative rounded-r-xl rounded-l-sm border-l-[3px] border-brand bg-white p-4 pt-5 shadow-card"
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
                    className="rise card-lift rounded-xl bg-white p-4 shadow-card"
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
              <p className="text-3xl" aria-hidden>☆</p>
              <p className="mt-3 font-bold">No reviews yet.</p>
              <p className="mt-1 text-sm text-muted">Be the first to say what you thought.</p>
            </div>
          )}
        </div>
      )}

      {/* --- Fixed bottom action bar ------------------------------------------------ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
        <div
          className="mx-auto max-w-xl px-5 pt-3"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
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
