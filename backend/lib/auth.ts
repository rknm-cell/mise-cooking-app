import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";

// Environment variables - you'll need to add these to your .env file
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "your-secret-key-here";
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:8080";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  basePath: "/auth",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
    passwordMinLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // Security settings
  csrf: {
    enabled: true,
  },
  // Rate limiting
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
  },
  // Remove Next.js specific plugins for Express
  // plugins: [nextCookies()],
});
