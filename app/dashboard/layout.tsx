/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogOutButton from "./logoutButton";
import SidebarNav from "./sidebarNav";

export default async function DashbardLayout({children}: {children: React.ReactNode}) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any).role || "guru";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-blue-600">SDN 02 Serua</h2>
                    <p className="text-sm text-gray-500 capitalize mt-1">Panel {userRole}</p>
                </div>
                <SidebarNav userRole={userRole}></SidebarNav>
                <div className="p-4 border-t">
                    <LogOutButton></LogOutButton>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}