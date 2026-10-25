// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// The frontend collects the three facts, hands them to POST /api/reviews,
// and steps back. It does not validate maths, store anything, or invent
// error messages — if the backend says 400, we print what the backend said.

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const MAX_COMMENT = 500;

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 transition-colors duration-150"
      fill={filled ? "var(--brand)" : "#cfccc8"}
      aria-hidden
    >
      <path d="M12 17.6 6.4 20.5l1.1-6.2-4.5-4.4 6.2-.9L12 2.9l2.8 6.1 6.2.9-4.5 4.4 1.1 6.2z" />
    </svg>
  );
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const router = useRouter();
  const { restaurantId } = use(params);

  const [name, setName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0); // re-triggers the shake on repeat errors
  const [submitting, setSubmitting] = useState(false);

  // Load the restaurant name so the reviewer knows what they are reviewing.
  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setName(data.name))
      .catch(() => setNotFound(true));
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        // Show the backend's error message verbatim, and shake to say so.
        setError(body.error ?? "Something went wrong.");
        setErrorKey((k) => k + 1);
        setSubmitting(false);
        return;
      }
      // Success: thanks, now show the page with all the reviews.
      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server.");
      setErrorKey((k) => k + 1);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-xl px-5 pb-16 pt-6">
        {notFound ? (
          <div className="rise rounded-2xl bg-white p-10 text-center shadow-card">
            <p className="font-bold">This restaurant does not exist.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rise rounded-2xl bg-white p-6 shadow-card sm:p-8"
          >
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Writing a review for
            </h2>
            <h1 className="mt-2 text-[26px] font-extrabold leading-tight">
              {name ?? "…"}
            </h1>

            <h3 className="mt-8 text-[15px] font-bold">Rate it</h3>
            <div className="mt-3 grid grid-cols-5 gap-2.5" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={star === rating}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  onClick={() => setRating(star)}
                  className={`grid h-16 place-items-center rounded-xl border bg-white transition-all duration-150 hover:border-brand/40 hover:bg-[#fdf1f1] active:scale-90 ${
                    star <= rating
                      ? "border-brand/60 shadow-sm"
                      : "border-line"
                  }`}
                >
                  <Star filled={star <= rating} />
                </button>
              ))}
            </div>

            <h3 className="mt-8 text-[15px] font-bold">Your review</h3>
            <textarea
              id="comment"
              value={comment}
              maxLength={MAX_COMMENT}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              placeholder="How was the food, the service, the vibe?"
              className="mt-3 h-44 w-full resize-none rounded-xl border border-line bg-white px-4 py-3.5 text-[15px] leading-snug transition-colors placeholder:text-[#b3b0ac] focus:border-brand/60 focus:outline-none"
            />
            <div className="mt-1.5 text-right text-xs text-muted">
              {comment.length}/{MAX_COMMENT}
            </div>

            {error && (
              <p
                key={errorKey}
                role="alert"
                className="shake mt-4 rounded-lg bg-[#fdf1f1] px-3 py-2 text-sm font-medium text-brand"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-8 w-full rounded-xl py-3.5 text-[15px] font-bold transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#e4e2df] disabled:text-[#a8a5a1] enabled:bg-brand enabled:text-white enabled:hover:bg-brand-press"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        )}

        <p className="rise mt-6 text-center text-sm text-muted" style={{ animationDelay: "120ms" }}>
          Your review is public and cannot be edited or deleted.
        </p>
      </div>
    </main>
  );
}
