import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
  // Matcher ini melindungi halaman dashboard, tapi MEMBIARKAN /api, /login, dan aset publik
    matcher: ["/dashboard/:path*"],
};