import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      isAdmin?: boolean;
      _id?: string;
      role?: "customer" | "supplier" | "admin";
      supplierId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin?: boolean;
    _id?: string;
    role?: "customer" | "supplier" | "admin";
    supplierId?: string;
  }
}
