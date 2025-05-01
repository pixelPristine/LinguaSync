import axios from "axios";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import axiosServer from "./utils/axiosServer";

export class InvalidLoginError extends CredentialsSignin {
  code = "custom";
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Facebook,
    Credentials({
      credentials: {
        email: {},
        otp: {},
      },
      async authorize(credentials) {
        try {
          const res = await axiosServer.post("/api/auth/verify-otp", {
            email: credentials.email,
            otp: credentials.otp,
          });
          const { token, name, email } = res.data;
          if (token && name && email) {
            return { id: email, name, email, token };
          }
          return null;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const message =
              error.response?.data?.error || "Something went wrong";
            throw new InvalidLoginError(message);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.type === "credentials") {
        const customUser = user as typeof user & { token: string };
        token.name = user.name;
        token.email = user.email;
        token.accessToken = customUser.token;
        return token;
      }

      // Social login logic
      if (
        account &&
        (account.provider === "google" || account.provider === "facebook")
      ) {
        try {
          const res = await axiosServer.post("/api/auth/social-login", {
            email: token.email,
            name: token.email,
          });

          const { token: backendToken } = res.data;
          token.accessToken = backendToken;
        } catch (error) {
          console.error("Failed to sync social login user", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        return {
          ...session,
          accessToken: token.accessToken ?? "",
        };
      }
      return session;
    },
  },
});
