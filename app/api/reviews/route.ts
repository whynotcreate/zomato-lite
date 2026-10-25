// app/api/reviews/route.ts — POST /api/reviews
// Accepts a review, validates it in this order:
//   1. rating is an integer 1-5
//   2. comment is non-empty after trimming
//   3. the restaurant actually exists (a real database lookup)
// On first failure: HTTP 400 with a plain-English error.
// On success: inserts exactly one row, returns HTTP 201.

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const restaurantId = body?.restaurantId;
  const rating = body?.rating;
  const comment = body?.comment;

  // Check 1: rating is a whole number between 1 and 5.
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 },
    );
  }

  // Check 2: comment is a non-empty string after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 },
    );
  }

  // Check 3: does this restaurant actually exist? (database lookup)
  const [restaurant] = await sql`
    SELECT id FROM restaurants WHERE id = ${restaurantId}
  `;
  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 400 },
    );
  }

  // All checks passed: write one row. Nothing else in the database changes.
  const [row] = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: row.id },
    { status: 201 },
  );
}
