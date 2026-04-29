/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/components/lib/auth";
import { Users, UserCheck, GraduationCap, LayoutDashboard } from "lucide-react";
import { getDashboardStats } from "@/components/lib/actions";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "guru";
    const userName = session?.user?.name || "Pengguna";
    const stats = await getDashboardStats();
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <LayoutDashboard size={14}/>
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-slate-800">Ringkasan</span>
            </div>
            <div className="relative bg-blue-600 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl shadow-blue-600/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            Selamat datang, {userName}!
                        </h1>
                        <p className="text-blue-100 text-lg font-medium opacity-90">
                            Senang Melihat anda kembali, anda login sebagai
                            <span className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase border border-white/30">{userRole}</span>
                        </p>
                    </div>
                    <GraduationCap className="w-20 h-20 md:w-32 md:h-32 text-blue-200 opacity-40 drop-shadow-lg"/>
                </div>
            </div>
            {userRole === "admin" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Guru Aktif" value={stats.totalGuru} icon={UserCheck} color="text-blue-600" bgColor="bg-blue-50"/>
                    <StatCard title="Total Siswa" value={stats.totalSiswa} icon={Users} color="text-emerald-600" bgColor="bg-emerald-50"/>
                </div>
            )}
            {userRole === "guru" && (
                <div className="bg-white p-8 border border-slate-100 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Panduan Guru</h2>
                        <p className="text-slate-500 leading-relaxed max-w-2xl font-medium">
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
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`${bgColor} ${color} p-5 rounded-2xl transition-transform group-hover:scale-110`}>
                <Icon className="w-7 h-7"/>
            </div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value.toLocaleString()}</h3>
            </div>
        </div>
    );
}