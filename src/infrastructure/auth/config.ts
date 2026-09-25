import type { NextAuthConfig } from "next-auth";

const secure = process.env.NODE_ENV === "production";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  cookies: {
    sessionToken: {
      name: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure },
    },
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLogin = request.nextUrl.pathname === "/login";
      if (isLogin) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
