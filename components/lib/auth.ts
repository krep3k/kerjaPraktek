/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import { User } from "./models";
import { hashEmail } from "./encryption";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Label", type: "password"}
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials.password) {
                    throw new Error("Email dan Password wajib diisi")
                }
                try {
                    await connectToDatabase();
                    const emailHash = hashEmail(credentials.email);
                    const user = await User.findOne({emailHash: emailHash, status: "aktif"});
                    if(!user) throw new Error("User tidak ditemukan atau status nonaktif");
                    const isMatch = await bcrypt.compare(credentials.password, user.password);
                    if(!isMatch) throw new Error("Password salah");

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Terjadi Kesalahan";
                    throw new Error(message);
                }
            }
        })
    ],
    callbacks: {
        async jwt({token, user}) {
            if(user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.name = user.name;
            }
            return token;
        },
        async session({session, token}) {
            if(session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).name = token.name;
            }
            return session;
        }
    },
    session: {strategy: "jwt"},
    pages: {signIn: "/login"},
    secret: process.env.NEXTAUTH_SECRET,
};