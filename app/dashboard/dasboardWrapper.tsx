"use client";
import React, {useState, useEffect, useTransition} from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import SidebarNav from "./sidebarNav";
import LogOutButton from "./logoutButton";

export default function DashboardWrapper({
    children, userRole
} : {
    children: React.ReactNode;
    userRole: string
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [, startTransition] = useTransition();
    const pathname = usePathname();
    useEffect(() => {
        startTransition(() => {
            setIsSidebarOpen(false);
        });
    }, [pathname, startTransition]);

    return (
        <div className="flex h-screen w-full bg-[#F6F4F9] overflow-hidden transition-colors duration-300">
            <div
                className={`fixed inset-0 bg-[#2D2735]/10 z-40 lg:hidden backdrop-blur-sm transition-opacity ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-[#ada0f8] transition-all duration-300 ease-in-out flex flex-col h-screen ${isSidebarOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full w-72 shadow-none"} lg:relative lg:translate-x-0 lg:shadow-none ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}>
                <div className={`p-6 border-b border-[#ffffff] flex items-center h-20 shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="bg-[#4452ed] p-2 rounded-xl">
                                <div className="w-5 h-5 bg-white rounded-sm"></div>
                            </div>
                            <span className="font-black text-xl tracking-tighter text-[#2D2735] uppercase">SDN SERUA 02</span>
                        </div>
                    )}
                    <button title="Close Sidebar" onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[#6E6B7F] hover:bg-[#81CAD6]/10 rounded-lg">
                        <X className="w-6 h-6"/>
                    </button>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-1.5 bg-[#81CAD6]/10 text-[#6E6B7F] hover:text-[#262cdc] rounded-lg border border-[#a0b3f8]">
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                    <SidebarNav userRole={userRole} isCollapsed={isCollapsed}/>
                </div>
                <div className={`p-4 border-t border-[#ffffff] shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}>
                    <LogOutButton isCollapsed={isCollapsed}/>
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#F6F4F9]">
                <header className="flex-none bg-white border-b border-[#a4a0f8] px-6 py-4 flex items-center lg:hidden z-30 transition-colors duration-300">
                    <button title="menu" onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-4 text-[#6E6B7F] hover:bg-[#81CAD6]/10 rounded-xl transition">
                        <Menu className="w-6 h-6"/>
                    </button>
                    <h1 className="font-black text-[#2D2735]">SDN SERUA 02</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#F6F4F9] scroll-smooth transition-colors duration-300">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
