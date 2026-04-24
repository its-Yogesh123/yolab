import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  ""
);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        console.log('credentials',credentials);
        // const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        // const res = await fetch(`${apiBase}/auth/login`, {
        //   method: "POST",
        //   body: JSON.stringify(credentials),
        // });
        // const data = await res.json();
        // if (data.error) {
        //   throw new Error(data.error);
        // }
        // return data.user;
        return credentials;
      },
    }),

  ],
  secret: process.env.NEXTAUTH_SECRET, // ⚡ important in production
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };