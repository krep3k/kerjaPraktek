"use client";
import Link from "next/link";
import { ArrowRight, CalendarCheck, BookOpen, Users, School } from "lucide-react";

export default function LandingPage() {
  const namaSekolah = "SDN SERUA 02"

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans selection:bg-[#EDCD44]/20 transition-colors duration-300">
      <header className="w-full bg-[#d8d6ff] backdrop-blur-md border-b border-[#a2a0f8] fixed top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3a5ad8] font-extrabold text-xl tracking-tight">
            <School className="w-8 h-8"/>
            <span>SIAKAD SDN SERUA 02</span>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/login" className="hidden rounded-full sm:block text-sm font-bold bg-[#5c92ff] hover:bg-[#1f52b9] text-[#ffffff] hover:text-[#939393] transition-colors px-4 py-2">
              Login
            </Link>
            <Link href="/login" className="bg-[#3458da] text-[#ffffff] text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#213a95] transition-all shadow-lg shadow-[#EDCD44]/20">
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 text-center lg:text-left mt-10 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3458da]/15 border border-[#3458da]/30 text-[#0d00ff] font-bold text-xs uppercase tracking-wider">
              Portal {namaSekolah}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-[900] text-[#2D2735] leading-[1.1] tracking-tight">
              Era Baru <br />
              <span className="text-[#2626dc]">Digitalisasi</span> Sekolah
            </h1>
            <p className="text-lg text-[#2D2735] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Tinggalkan cara lama. Kelola administrasi, basis data siswa, dan presensi tenaga pendidik dengan platform yang modern, cepat, dan mudah digunakan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/login" className="inline-flex justify-center items-center gap-3 bg-[#3458da] text-[#efedf3] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#1f238a] transition-all shadow-xl shadow-[#EDCD44]/20 hover:-translate-y-1">
                Masuk Dashboard<ArrowRight className="w-5 h-5"/>
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end hidden md:flex">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#DC3E26]/15 rounded-full blur-3xl -z-10"></div>
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F8E6A0] overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="h-12 border-b border-[#F8E6A0] bg-[#EDCD44]/15 flex items-center px-5 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#DC3E26]"></div>
                <div className="w-3 h-3 rounded-full bg-[#EDCD44]"></div>
                <div className="w-3 h-3 rounded-full bg-[#81CAD6]"></div>
              </div>
              <div className="p-6 space-y-5 bg-white">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-[#F1E6A5] rounded-md"></div>
                  <div className="h-8 w-8 bg-[#81CAD6]/30 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 bg-[#EDCD44]/10 rounded-2xl border border-[#EDCD44]/20 p-4 flex flex-col justify-end">
                    <div className="h-3 w-3/4 bg-[#81CAD6]/40 rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-[#EDCD44] rounded"></div>
                  </div>
                  <div className="h-28 bg-[#DC3E26]/10 rounded-2xl border border-[#DC3E26]/20 p-4 flex flex-col justify-end">
                    <div className="h-3 w-3/4 bg-[#F3C659]/40 rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-[#DC3E26] rounded"></div>
                  </div>
                </div>
                <div className="h-32 bg-[#81CAD6]/10 rounded-2xl border border-[#81CAD6]/20 p-4">
                  <div className="h-3 w-full bg-[#F4E8A5] rounded mb-3"></div>
                  <div className="h-3 w-5/6 bg-[#F4E8A5] rounded mb-3"></div>
                  <div className="h-3 w-4/6 bg-[#F4E8A5] rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-32 pt-20 border-t border-[#F8E6A0]/60">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-[900] text-[#2D2735] mb-4">Fitur Unggulan</h2>
              <p className="text-[#6E6B7F] max-w-2xl mx-auto font-medium">
                Platform kami dilengkapi dengan berbagai fitur yang dirancang untuk meningkatkan efisiensi dan kualitas pengelolaan sekolah.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {icon: Users, title: "Manajemen Guru dan Siswa", desc: "Pusat informasi guru dan siswa yang rapi, aman, dan mudah diakses kapan saja."},
                {icon: CalendarCheck, title: "Presensi Digital", desc: "Catat kehadiran harian dengan cepat menggunakan antarmuka yang sangat intuitif."},
                {icon: BookOpen, title: "Export Laporan", desc: "Unduh rekapitulasi data ke format Excel (CSV) hanya dengan satu klik praktis"},
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#a0b3f8] hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 bg-[#EDCD44]/10 text-[#2626dc] rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8"/>
                  </div>
                  <h3 className="text-xl font-[900] text-[#2D2735] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#6E6B7F] leading-relaxed text-sm font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
      </main>
      <main className="py-8 text-center text-[#6E6B7F] text-sm font-bold border-t border-[#b3a0f8] bg-white transition-colors duration-300">
        &copy; {new Date().getFullYear()} {namaSekolah}
      </main>
    </div>
  )
}
