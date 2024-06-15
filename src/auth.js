import NextAuth, { CallbackRouteError } from "next-auth"
import { createUser, getUserActorFromDB } from "./db/actor";
import Credentials from "next-auth/providers/credentials"
import returnKeyPair from "@/utils/keyPair";
import { connectToDB } from "@/db";
import bcrypt from "bcrypt";
import { INSTANCE } from "./constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(credentials)
        await connectToDB();
        const dbUser = await getUserActorFromDB("username password");
        if (dbUser) {
            const isVerified = bcrypt.compareSync(credentials.password, dbUser.password) && dbUser.username == credentials.username;
            if (isVerified) {
                console.log("verified")
                return {username: credentials.username}
            }
            return {error: "Invalid username or password"}
        } else {
            const keyPair = returnKeyPair();
            await createUser({
                username: credentials.username,
                password: bcrypt.hashSync(credentials.password, 12),
                name: credentials.username,
                profileURL: `https://${INSTANCE}/`,
                fediverse: {
                    self: `https://${INSTANCE}/actor`,
                    inbox: `https://${INSTANCE}/inbox`,
                    outbox: `https://${INSTANCE}/oubox`,
                    publicKey: keyPair.publicKey,
                    privateKey: keyPair.privateKey
                }
            })
            return {username: credentials.username}
        }
      },
    }),
  ],
  callbacks: {
    async signIn({user,account,credentials}) {
        if (user?.error) throw new Error('Invalid Username / password')
        return user
    }
  }
})