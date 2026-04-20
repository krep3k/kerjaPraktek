"use client";
import Link from "next/link";
import { ArrowRight, CalendarCheck, BookOpen, Users, School } from "lucide-react";

export default function LandingPage() {
  const namaSekolah = "SDN 02 SERUA"

  return (
    <div className="min-h-screen bg-[#d2d8dd] font-sans selection:bg-blue-100">
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xl tracking-tight">
            <School className="w-8 h-8"/>
            <span>SIAKAD</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors px-4 py-2">
              Login
            </Link>
            <Link href="/login" className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 text-center lg:text-left mt-10 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs uppercase tracking-wider">
              Portal {namaSekolah}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-[900] text-slate-900 leading-[1.1] tracking-tight">
              Era Baru <br />
              <span className="text-blue-600">Digitalisasi</span> Sekolah
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Tinggalkan cara lama. Kelola administrasi, basis data siswa, dan presensi tenaga pendidik dengan platform yang modern, cepat, dan mudah digunakan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/login" className="inline-flex justify-center items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1">
                Masuk Dashboard<ArrowRight className="w-5 h-5"/>
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end hidden md:flex">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl -z-10"></div>
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="h-12 border-b border-slate-100 bg-slate-50 flex items-center px-5 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-6 space-y-5 bg-white">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-slate-200 rounded-md"></div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 bg-blue-50/50 rounded-2xl border border-blue-100 p-4 flex flex-col justify-end">
                    <div className="h-3 w-3/4 bg-blue-200 rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-blue-600 rounded"></div>
                  </div>
                  <div className="h-28 bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 flex flex-col justify-end">
                    <div className="h-3 w-3/4 bg-emerald-200 rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-emerald-500 rounded"></div>
                  </div>
                </div>
                <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <div className="h-3 w-full bg-slate-200 rounded mb-3"></div>
                  <div className="h-3 w-5/6 bg-slate-200 rounded mb-3"></div>
                  <div className="h-3 w-4/6 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-32 pt-20 border-t border-slate-200/60">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-[900] text-slate-900 mb-4">Fitur Unggulan</h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                Platform kami dilengkapi dengan berbagai fitur yang dirancang untuk meningkatkan efisiensi dan kualitas pengelolaan sekolah.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {icon: Users, title: "Manajemen Guru dan Siswa", desc: "Pusat informasi guru dan siswa yang rapi, aman, dan mudah diakses kapan saja."},
                {icon: CalendarCheck, title: "Presensi Digital", desc: "Catat kehadiran harian dengan cepat menggunakan antarmuka yang sangat intuitif."},
                {icon: BookOpen, title: "Export Laporan", desc: "Unduh rekapitulasi data ke format Excel (CSV) hanya dengan satu klik praktis"},
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8"/>
                  </div>
                  <h3 className="text-xl font-[900] text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
      </main>
      <main className="py-8 text-center text-slate-400 text-sm font-bold border-t border-slate-200/60 bg-white">
        &copy; {new Date().getFullYear()} {namaSekolah}
      </main>
    </div>
  )
}