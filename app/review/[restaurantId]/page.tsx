// app/review/[restaurantId]/page.tsx — Screen 1: write a review.
// The frontend collects the three facts, hands them to POST /api/reviews,
// and steps back. It does not validate maths, store anything, or invent
// error messages — if the backend says 400, we print what the backend said.

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        // Show the backend's error message verbatim.
        setError(body.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      // Success: thanks, now show the page with all the reviews.
      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server.");
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <p className="text-muted">This restaurant does not exist.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-5 py-14">
      <h1 className="text-2xl">{name ?? "…"}</h1>
      <p className="mt-1 text-sm text-muted">Write a review</p>

      <form onSubmit={handleSubmit} className="mt-10">
        <label className="block text-sm text-muted">Your rating</label>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              className={`h-11 w-11 rounded-full border text-sm ${
                star <= rating
                  ? "border-accent bg-accent text-background"
                  : "border-line text-foreground"
              }`}
            >
              {star}
            </button>
          ))}
        </div>

        <label htmlFor="comment" className="mt-8 block text-sm text-muted">
          Your comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What did you think?"
          className="mt-3 w-full rounded-md border border-line bg-transparent px-3 py-2 text-base resize-none focus:outline-none focus:border-accent"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-8 w-full rounded-md bg-foreground py-3 text-base text-background disabled:opacity-30"
        >
          {submitting ? "Sending…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
