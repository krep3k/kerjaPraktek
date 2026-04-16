import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export const config = {
  // Matcher ini melindungi halaman dashboard, tapi MEMBIARKAN /api, /login, dan aset publik
    matcher: ["/dashboard/:path*"],
};