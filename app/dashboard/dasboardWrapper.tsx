"use client";
import React, {useState, useEffect, useTransition} from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import SidebarNav from "./sidebarNav";
import LogOutButton from "./logoutButton";

export default function DashboardWrapper({
    children, userRole
} : {
    children: React.ReactNode;
    userRole: string
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [, startTransition] = useTransition();
    const pathname = usePathname();
    useEffect(() => {
        startTransition(() => {
            setIsSidebarOpen(false);
        });
    }, [pathname, startTransition]);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        }
    }, [isSidebarOpen]);

    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden relative">
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-xl lg:shadow-none flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-6 border-b flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-600">SDN 02 SERUA</h2>
                        <p className="text-sm text-gray-500 capitalize mt-1">Panel {userRole}</p>
                    </div>
                    <button title="close" onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg">
                        <X className="w-6 h-6"></X>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <SidebarNav userRole={userRole}></SidebarNav>
                </div>
                <div className="p-4 border-t bg-white">
                    <LogOutButton></LogOutButton>
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                <header className="bg-white border-b px-4 py-3 flex items-center lg:hidden sticky top-0 z-30 shadow-sm">
                    <button title="menu" onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                        <Menu className="w-6 h-6"></Menu>
                    </button>
                    <h1 className="font-bold text-lg text-gray-800">SIAKAD</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 w-full -webkit-overflow-scrolling-touch">
                    {children}
                </main>
            </div>
        </div>
    )
}