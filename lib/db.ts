// lib/db.ts — one place that owns the connection to the Neon Postgres database.
// The connection string comes from .env.local (DATABASE_URL), never from code.
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export default sql;
