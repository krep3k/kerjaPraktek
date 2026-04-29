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
        <div className="flex h-screen w-full bg-[#F1F5F9] overflow-hidden">
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col h-screen ${isSidebarOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full w-72 shadow-none"} lg:relative lg:translate-x-0 lg:shadow-none ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}>
                <div className={`p-6 border-b border-slate-50 flex items-center h-20 shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <div className="w-5 h-5 bg-white rounded-sm"></div>
                            </div>
                            <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">SIAKAD</span>
                        </div>
                    )}
                    <button title="Close Sidebar" onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                        <X className="w-6 h-6"/>
                    </button>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200">
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                    <SidebarNav userRole={userRole} isCollapsed={isCollapsed}/>
                </div>
                <div className={`p-4 border-t border-slate-50 shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}>
                    <LogOutButton isCollapsed={isCollapsed}/>
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#F1F5F9]">
                <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center lg:hidden z-30">
                    <button title="menu" onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-4 text-slate-600 hover:bg-blue-50 rounded-xl transition">
                        <Menu className="w-6 h-6"/>
                    </button>
                    <h1 className="font-black text-slate-800">SIAKAD</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#F1F5F9] scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}