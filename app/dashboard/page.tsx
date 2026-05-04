/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/components/lib/auth";
import { Users, UserCheck, GraduationCap, LayoutDashboard, ClipboardList, BookOpen, BookCheck, ClipboardCheckIcon, BookOpenCheck, FolderKanban, User2Icon } from "lucide-react";
import { getDashboardStats } from "@/components/lib/actions";

const dashboardNavs = [
    { name: "Data Siswa", href: "/dashboard/siswa", icon: Users, roles: ["admin", "guru", "kepsek"], description: "Kelola data siswa dan lihat informasi lengkap." },
    { name: "Data Guru", href: "/dashboard/guru", icon: User2Icon, roles: ["admin", "kepsek"], description: "Kelola data guru dan hak akses mereka." },
    { name: "Absensi Guru", href: "/dashboard/absensi-guru", icon: ClipboardCheckIcon, roles: ["admin", "kepsek"], description: "Lihat dan rekap absensi guru." },
    { name: "Absensi Siswa", href: "/dashboard/absensi", icon: ClipboardList, roles: ["admin", "guru"], description: "Catat kehadiran siswa harian secara cepat." },
    { name: "Nilai", href: "/dashboard/nilai", icon: BookOpen, roles: ["admin", "guru"], description: "Masukkan dan tinjau nilai siswa." },
    { name: "Rekapitulasi Siswa", href: "/dashboard/rekap", icon: BookCheck, roles: ["admin", "guru"], description: "Lihat rekap absensi dan nilai siswa." },
    { name: "Rekapitulasi Guru", href: "/dashboard/rekap-absensi-guru", icon: BookOpenCheck, roles: ["admin", "kepsek"], description: "Lihat rekap bulanan absensi guru." },
    { name: "Bank Data", href: "/dashboard/gudang", icon: FolderKanban, roles: ["admin", "guru", "kepsek"], description: "Akses bank data dokumen dan file penting." },
];

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "guru";
    const userName = session?.user?.name || "Pengguna";
    const stats = await getDashboardStats();
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-[#6E6B7F] text-sm font-medium">
                <LayoutDashboard size={14}/>
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-[#2D2735]">Ringkasan</span>
            </div>
            <div className="relative bg-[#EDCD44] rounded-4xl p-8 md:p-10 text-[#2D2735] shadow-2xl shadow-[#EDCD44]/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#81CAD6]/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            Selamat datang, {userName}!
                        </h1>
                        <p className="text-[#2D2735]/80 text-lg font-medium opacity-90">
                            Senang Melihat anda kembali, anda login sebagai
                            <span className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase border border-white/30">{userRole}</span>
                        </p>
                    </div>
                    <GraduationCap className="w-20 h-20 md:w-32 md:h-32 text-[#2D2735]/40 drop-shadow-lg"/>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardNavs.filter(nav => nav.roles.includes(userRole)).map((nav) => (
                    <NavCard key={nav.name} href={nav.href} icon={nav.icon} title={nav.name} description={nav.description} />
                ))}
            </div>
            {userRole === "admin" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Guru Aktif" value={stats.totalGuru} icon={UserCheck} color="text-[#81CAD6]" bgColor="bg-[#81CAD6]/10"/>
                    <StatCard title="Total Siswa" value={stats.totalSiswa} icon={Users} color="text-[#EDCD44]" bgColor="bg-[#EDCD44]/10"/>
                </div>
            )}
            {userRole === "guru" && (
                <div className="bg-white p-8 border border-[#F8E6A0] rounded-4xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#81CAD6]/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-[#2D2735] mb-4 tracking-tight">Panduan Guru</h2>
                        <p className="text-[#6E6B7F] leading-relaxed max-w-2xl font-medium">
                            Gunakan menu navigasi untuk mengisi absensi harian dan mencatat rekap nilai siswa. 
                            Pastikan data diisi secara akurat setiap hari sebelum kegiatan belajar mengajar dimulai.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({title, value, icon: Icon, color, bgColor}: {title: string, value: number, icon: any, color: string, bgColor: string}) {
    return (
        <div className="bg-white p-6 rounded-4xl border border-[#F8E6A0] shadow-sm flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`${bgColor} ${color} p-5 rounded-2xl transition-transform group-hover:scale-110`}>
                <Icon className="w-7 h-7 text-[#2D2735]"/>
            </div>
            <div>
                <p className="text-xs font-black text-[#6E6B7F] uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-[#2D2735] tracking-tight">{value.toLocaleString()}</h3>
            </div>
        </div>
    );
}

function NavCard({ href, icon: Icon, title, description }: { href: string; icon: any; title: string; description: string; }) {
    return (
        <Link href={href} className="group block rounded-4xl border border-[#F8E6A0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#EDCD44]/50">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="text-[#2D2735] font-bold text-lg">{title}</div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#81CAD6]/10 text-[#81CAD6] transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                </span>
            </div>
            <p className="text-sm text-[#6E6B7F] leading-relaxed">{description}</p>
        </Link>
    );
}