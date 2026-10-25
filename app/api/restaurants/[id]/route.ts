// app/api/restaurants/[id]/route.ts — GET /api/restaurants/[id]
// Returns the restaurant page's data, shaped exactly like the screen:
// name, big average rating, latest review highlighted, then the rest.
// Nothing is stored in advance — AVG, COUNT and the sort run on every request.

import { NextResponse } from "next/server";
import sql from "@/lib/db";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: "Invalid restaurant id." }, { status: 404 });
  }

  // Fact lookup: does the restaurant exist?
  const [restaurant] = await sql`
    SELECT id, name, cuisine, area
    FROM restaurants
    WHERE id = ${restaurantId}
  `;
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  // Every review for this restaurant, newest first.
  const rows = (
    await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC
    `
  ).map((r: { id: number; rating: number; comment: string; created_at: Date }): ReviewRow => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));

  // Computed, fresh, every time — never stored:
  const [stats] = await sql`
    SELECT AVG(rating)::float AS average, COUNT(*)::int AS total
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;

  const reviews = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  if (reviews.length === 0) {
    // "What happens when there is nothing yet?" — decided here, once,
    // so the frontend has nothing left to figure out.
    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: null,
      totalReviews: 0,
      latestReview: null,
      reviews: [],
    });
  }

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating: Math.round(Number(stats.average) * 10) / 10, // 4.333 -> 4.3
    totalReviews: stats.total,
    latestReview: reviews[0], // newest, shown separately so it isn't printed twice
    reviews: reviews.slice(1), // all except the latest, still newest first
  });
}
