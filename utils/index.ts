export const getBaseUrl = () => {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
    }
    // Prioritize explicitly set URL
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }
    // Fallback to Vercel system URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
};
