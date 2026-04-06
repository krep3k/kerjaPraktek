/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardWrapper from "./dasboardWrapper";
import { redirect } from "next/navigation";

export default async function DashbardLayout({children}: {children: React.ReactNode}) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/");
    }
    const userRole = (session?.user as any)?.role || "guru";
    return (
        <DashboardWrapper userRole={userRole}>
            {children}
        </DashboardWrapper>
    );
}