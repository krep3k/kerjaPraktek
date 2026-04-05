"use client";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-3xl bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <GraduationCap className="mx-auto h-20 w-20 text-blue-600 mb-6"></GraduationCap>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Sistem Rekap SDN 02 Serua</h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Platform manajemen sekolah cerdas untuk mencatat absensi, nilai, profil guru, hingga kenaikan kelas otomatis.
          Membantu admin dan pendidik agar fokus pada apa yang penting: masa depan siswa.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
            Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}