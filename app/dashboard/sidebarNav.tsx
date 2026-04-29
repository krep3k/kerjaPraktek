"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, UserCheck, LayoutDashboard, ClipboardList, BookCheck, ClipboardCheckIcon, BookOpenCheckIcon, FolderKanban } from "lucide-react";

export default function SidebarNav({userRole, isCollapsed} : {userRole: string, isCollapsed: boolean}) {
    const pathName = usePathname();
    const navs = [
        {name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "guru", "kepsek"]},
        {name: "Data Siswa", href: "/dashboard/siswa", icon: Users, roles: ["admin", "guru", "kepsek"]},
        {name: "Data Guru", href: "/dashboard/guru", icon: UserCheck, roles: ["admin", "kepsek"]},
        {name: "Absensi Guru", href: "/dashboard/absensi-guru", icon: ClipboardCheckIcon, roles: ["admin", "kepsek"]},
        {name: "Absensi Siswa", href: "/dashboard/absensi", icon: ClipboardList, roles: ["admin", "guru"]},
        {name: "Nilai", href: "/dashboard/nilai", icon: BookOpen, roles: ["admin", "guru"]},
        {name: "Rekap", href: "/dashboard/rekap", icon: BookCheck, roles: ["admin", "guru"]},
        {name: "Rekap Absensi Guru", href: "/dashboard/rekap-absensi-guru", icon: BookOpenCheckIcon, roles: ["admin", "kepsek"]},
        {name: "Gudang Data", href: "/dashboard/gudang", icon: FolderKanban, roles: ["admin", "guru", "kepsek"]}
    ];

    const filteredNavs = navs.filter(nav => nav.roles.includes(userRole));

    return (
        <nav className="px-3 space-y-1">
            {filteredNavs.map((nav) => {
                const Icon = nav.icon;
                const isActive = pathName === nav.href || (nav.href !== "/dashboard" && pathName.startsWith(`${nav.href}/`));
                return (
                    <Link key={nav.name} href={nav.href} title={isCollapsed ? nav.name : ""} className={`flex items-center rounded-2xl transition-all duration-200 group ${isCollapsed ? "justify-center p-3.5" : "gap-4 px-5 py-3.5"} ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}>
                        <Icon className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"} shrink-0 transition-transform group-hover:scale-110`}/>
                        {!isCollapsed && <span className="text-[15px] truncate tracking-tight">{nav.name}</span>}
                    </Link>
                )
            })}
        </nav>
    );
}
