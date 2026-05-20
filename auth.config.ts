import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup");

      if (isOnAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }
      if (isOnAdmin) {
        // must be logged in; role is verified again in the /admin page
        return isLoggedIn;
      }
      return true;
    },
  },
};
