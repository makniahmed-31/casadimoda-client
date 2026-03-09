import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import User from "@/models/User";
import db from "@/utils/db";
import { JWT } from "next-auth/jwt";
import { Session, User as NextAuthUser } from "next-auth";

interface CustomUser extends Omit<NextAuthUser, "role"> {
  _id?: string;
  isAdmin?: boolean;
  role?: "customer" | "supplier" | "admin" | "transporter";
  supplierId?: string;
}

interface CustomToken extends JWT {
  _id?: string;
  isAdmin?: boolean;
  role?: "customer" | "supplier" | "admin" | "transporter";
  supplierId?: string;
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
        await db.connect();
        const user = await User.findOne({
          email: credentials.email,
        });

        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          return {
            id: user._id.toString(),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role || "customer",
            supplierId: user.supplierId?.toString(),
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
