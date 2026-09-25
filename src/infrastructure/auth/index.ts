import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticate } from "@/modules/identity/application/authenticate";
import { systemClock } from "@/infrastructure/clock";
import { passwordHasher } from "@/infrastructure/auth/password";
import { authConfig } from "@/infrastructure/auth/config";
import { prisma } from "@/infrastructure/database/client";
import { createAuditLogin } from "@/infrastructure/database/audit-repository";
import { createUserRepository } from "@/infrastructure/database/user-repository";
import type { Role } from "@/modules/identity/domain/login";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const result = await authenticate(
          { email, password },
          {
            users: createUserRepository(prisma),
            passwords: passwordHasher,
            auditLogin: createAuditLogin(prisma),
            clock: systemClock,
          },
        );
        if (!result.ok) return null;
        return result.user;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "OPERATOR";
      }
      return session;
    },
  },
});
