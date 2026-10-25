// app/restaurant/[id]/page.tsx — Screen 2: the restaurant page.
// Calls GET /api/restaurants/[id] and renders what it gets.
// NO maths in this file: no adding, no dividing, no sorting.
// averageRating, totalReviews and latestReview were all computed by the API.

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
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

  if (notFound) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <p className="text-muted">This restaurant does not exist.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-5 py-14">
      {/* 1. Name, with cuisine and area underneath in muted text */}
      <h1 className="text-2xl">{data.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {data.cuisine}, {data.area}
      </p>

      {/* 2. The average — the biggest thing on the page. */}
      {/* This is the line that prints the API's computed number: it does not
          calculate anything. If averageRating is null it simply isn't shown. */}
      <div className="mt-8 flex items-baseline gap-2">
        {data.averageRating !== null ? (
          <span className="text-6xl">{data.averageRating}</span>
        ) : null}
        <span className="text-sm text-muted">
          {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
        </span>
      </div>

      {/* 3. Latest review, highlighted so it sits apart from the rest */}
      {data.latestReview && (
        <blockquote className="mt-8 rounded-md border-l-2 border-accent px-4 py-3 bg-[#f3f1ea]">
          <p className="text-base">{data.latestReview.comment}</p>
          <p className="mt-2 text-sm text-muted">
            ★ {data.latestReview.rating} · {formatDate(data.latestReview.createdAt)}
          </p>
        </blockquote>
      )}

      {/* 4. Older reviews, newest first (ordering was done by the API) */}
      {data.reviews.length > 0 && (
        <ul className="mt-8 divide-y divide-line">
          {data.reviews.map((review) => (
            <li key={review.id} className="py-4">
              <p className="text-base">{review.comment}</p>
              <p className="mt-1 text-sm text-muted">
                ★ {review.rating} · {formatDate(review.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* 6. Empty state when there is nothing yet */}
      {data.totalReviews === 0 && (
        <div className="mt-12 rounded-md border border-line p-8 text-center">
          <p className="text-muted">No reviews yet.</p>
          <p className="mt-1 text-muted">Be the first to say what you thought.</p>
        </div>
      )}

      {/* 5. Link to write a review */}
      <Link
        href={`/review/${id}`}
        className="mt-10 block w-full rounded-md bg-foreground py-3 text-base text-center text-background"
      >
        Write a review
      </Link>
    </main>
  );
}
