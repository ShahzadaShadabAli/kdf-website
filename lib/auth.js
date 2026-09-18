import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/firebase";
import { docToItem } from "@/lib/firestoreHelpers";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export const authOptions = {
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = await getDb();
        const users = db.collection("adminUsers");
        const email = String(credentials.email).toLowerCase().trim();
        const snapshot = await users.where("email", "==", email).limit(1).get();
        if (snapshot.empty) return null;
        const user = docToItem(snapshot.docs[0]);

        if (!user.isActive) return null;

        if (
          user.lockedUntil &&
          new Date(user.lockedUntil).getTime() > Date.now()
        ) {
          throw new Error("Account locked. Try again later.");
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!valid) {
          const failedAttempts = (user.failedAttempts || 0) + 1;
          const update = { failedAttempts };
          if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            update.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
            update.failedAttempts = 0;
          }
          await users.doc(user._id).update(update);
          return null;
        }

        await users.doc(user._id).update({
          lastLoginAt: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
        });

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export function requireRole(session, roles) {
  if (!session?.user) return false;
  return roles.includes(session.user.role);
}
