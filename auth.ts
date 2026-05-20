import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { verifyUser } from "./lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        // 1. Check the env-configured admin account
        const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (adminEmail && adminHash && email === adminEmail) {
          const ok = await bcrypt.compare(password, adminHash);
          if (ok) {
            return { id: "admin", email: adminEmail, name: "Admin", role: "admin" };
          }
          return null;
        }

        // 2. Check registered customer accounts in MongoDB
        const user = await verifyUser(email, password);
        if (user) {
          return {
            id: user.email,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
});
