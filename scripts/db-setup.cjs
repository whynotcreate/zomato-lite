// Applies db/schema.sql and seed data to the Neon Postgres database.
// Run with: npm run db:setup
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

// No dotenv dependency: read DATABASE_URL out of .env.local ourselves.
const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8").trim().split("\n");
const line = env.find((l) => l.trim().startsWith("DATABASE_URL="));
if (!line) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const sql = neon(line.trim().slice("DATABASE_URL=".length));

async function main() {
  // 1. Reset (idempotent: safe to run again)
  await sql`DROP TABLE IF EXISTS reviews;`;
  await sql`DROP TABLE IF EXISTS restaurants;`;

  // 2. Schema
  await sql`CREATE TABLE restaurants (
    id       SERIAL PRIMARY KEY,
    name     TEXT NOT NULL,
    cuisine  TEXT NOT NULL,
    area     TEXT NOT NULL
  )`;
  await sql`CREATE TABLE reviews (
    id             SERIAL PRIMARY KEY,
    restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id),
    rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  // 3. Seed: one restaurant, three reviews days apart so "latest" is meaningful
  const [restaurant] = await sql`
    INSERT INTO restaurants (name, cuisine, area)
    VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32')
    RETURNING id
  `;
  const rid = restaurant.id;
  await sql`
    INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES
      (${rid}, 5, 'Paneer burrito is unreal',  now() - interval '8 days'),
      (${rid}, 4, 'Good, but slow service',    now() - interval '6 days'),
      (${rid}, 4, 'Solid. Would repeat.',      now() - interval '2 days')
  `;

  // 4. Show the rows created
  const restaurants = await sql`SELECT * FROM restaurants ORDER BY id`;
  const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY id`;
  console.log("=== restaurants ===");
  console.table(restaurants);
  console.log("=== reviews ===");
  console.table(reviews);
  console.log("\nAverage would be (computed at read time, never stored): 4.33");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
