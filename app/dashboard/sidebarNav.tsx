"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, UserCheck, LayoutDashboard, ClipboardList, BookCheck, ClipboardCheckIcon, BookOpenCheckIcon } from "lucide-react";

export default function SidebarNav({userRole} : {userRole: string}) {
    const pathName = usePathname();
    const navs = [
        {name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "guru"]},
        {name: "Data Siswa", href: "/dashboard/siswa", icon: Users, roles: ["admin", "guru"]},
        {name: "Data Guru", href: "/dashboard/guru", icon: UserCheck, roles: ["admin"]},
        {name: "Absensi Guru", href: "/dashboard/absensi-guru", icon: ClipboardCheckIcon, roles: ["admin"]},
        {name: "Absensi Siswa", href: "/dashboard/absensi", icon: ClipboardList, roles: ["admin", "guru"]},
        {name: "Nilai", href: "/dashboard/nilai", icon: BookOpen, roles: ["admin", "guru"]},
        {name: "Rekap", href: "/dashboard/rekap", icon: BookCheck, roles: ["admin", "guru"]},
        {name: "Rekap Absensi Guru", href: "/dashboard/rekap-absensi-guru", icon: BookOpenCheckIcon, roles: ["admin"]}
    ];

    const filteredNavs = navs.filter(nav => nav.roles.includes(userRole));

    return (
        <nav className="flex-1 p-4 space-y-2">
            {filteredNavs.map((nav) => {
                const Icon = nav.icon;
                const isActive = nav.href === "/dashboard" ? pathName === "/dashboard" : pathName === nav.href || pathName.startsWith(`${nav.href}/`);

                return (
                    <Link key={nav.name} href={nav.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white font-semibold shadow-md" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                        <Icon className="w-5 h-5"></Icon>
                        <span>{nav.name}</span>
                    </Link>
                )
            })}
        </nav>
    );
}