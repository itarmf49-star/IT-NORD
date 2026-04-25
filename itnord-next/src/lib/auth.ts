import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { Role } from "@/types/role";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const DEMO_ADMIN_EMAIL = "itnord@outlook.fr";
const DEMO_ADMIN_PASSWORD = "ITNORD@2026";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        // Beginner-friendly fallback admin account for control panel access.
        if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
          return {
            id: "demo-admin",
            email: DEMO_ADMIN_EMAIL,
            name: "MauriTech Admin",
            role: "ADMIN" as Role,
          };
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) return null;

        const { data: user, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
        if (error || !user?.password_hash) return null;

        const ok = await bcrypt.compare(password, user.password_hash as string);
        if (!ok) return null;

        return {
          id: user.id as string,
          email: (user.email as string) ?? undefined,
          name: (user.name as string) ?? undefined,
          image: (user.image as string) ?? undefined,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user.role as Role) ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as Role) ?? "CUSTOMER";
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
};
