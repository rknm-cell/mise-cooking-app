import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    /** The base URL of the server */
    baseURL: process.env.NODE_ENV === "production" 
        ? "https://mise-cooking-app-production.up.railway.app" 
        : "http://localhost:8080",
})


