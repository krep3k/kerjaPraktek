/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, UserCheck, BookOpen, GraduationCap } from "lucide-react";
import { getDashboardStats } from "@/lib/actions";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "guru";
    const userName = session?.user?.name || "Pengguna";
    const stats = await getDashboardStats();
    return (
        <div className="space-y-6">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Selamat datang, {userName}!</h1>
                    <p className="text-blue-100 text-lg">
                        Sistem Manajemen Informasi SDN 02 Serua. Anda login sebagai <span className="font-semibold uppercase px-2 py-0.5 bg-white/20 rounded">{userRole}</span>
                    </p>
                </div>
                <GraduationCap className="w-24 h-24 text-blue-300 opacity-80"></GraduationCap>
            </div>
            {userRole === "admin" && (
                <>
                    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Ringkasan Sekolah</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Siswa Aktif" value={stats.totalSiswa} icon={Users} color="bg-green-500" />
                        <StatCard title="Guru Aktif" value={stats.totalGuru} icon={UserCheck} color="bg-blue-500" />
                    </div>
                </>
            )}
            {userRole === "guru" && (
                <div className="bg-white p-6 border rounded-xl shadow-sm mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Panduan Guru</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Gunakan menu di sebelah kiri untuk mengisi absensi harian Anda dan mencatat rekap nilai siswa. Pastikan absensi diisi setiap pagi sebelum jam pelajaran dimulai.
                    </p>
                </div>
            )}
        </div>
    );
}

function StatCard({title, value, icon: Icon, color}: {title: string, value: number, icon: any, color: string}) {
    return (
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:border-blue-200 transition">
            <div className={`${color} p-4 rounded-xl text-white shadow-inner`}>
                <Icon className="w-8 h-8"></Icon>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}