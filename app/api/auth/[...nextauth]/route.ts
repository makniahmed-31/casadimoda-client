import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session, User as NextAuthUser } from "next-auth";

interface CustomUser extends Omit<NextAuthUser, "role"> {
  _id?: string;
  isAdmin?: boolean;
  role?: "customer" | "supplier" | "admin" | "transporter";
  supplierId?: string;
  expressToken?: string;
}

interface CustomToken extends JWT {
  _id?: string;
  isAdmin?: boolean;
  role?: "customer" | "supplier" | "admin" | "transporter";
  supplierId?: string;
  expressToken?: string;
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: CustomToken; user?: NextAuthUser }) {
      if (user) {
        token._id = (user as CustomUser)._id;
        token.isAdmin = (user as CustomUser).isAdmin;
        token.role = (user as CustomUser).role;
        token.supplierId = (user as CustomUser).supplierId;
        token.expressToken = (user as CustomUser).expressToken;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: CustomToken;
    }) {
      if (session.user) {
        // We cast to CustomUser to allow assignment of extra properties
        const user = session.user as CustomUser;
        user._id = token._id;
        user.isAdmin = token.isAdmin;
        user.role = token.role;
        user.supplierId = token.supplierId;
        user.expressToken = token.expressToken;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        const data = await res.json();

        if (res.ok && data.user) {
          const u = data.user;
          return {
            id: u._id,
            _id: u._id,
            name: u.name,
            email: u.email,
            isAdmin: u.isAdmin,
            role: u.role || "customer",
            supplierId: u.supplierId,
            expressToken: data.token,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
