"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 overflow-hidden">

      <section className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 py-20">

        {/* DOODLE ATAS MOBILE */}
        <div className="lg:hidden w-full flex justify-center">
          <Doodle />
        </div>

        {/* TEXT */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-blue-700">
            SDN SERUA 02
          </h1>

          <p className="text-gray-600 max-w-xl mx-auto lg:mx-0 text-lg italic">
            Sistem Informasi Akademik untuk membantu pengelolaan data siswa,
            guru, nilai, dan administrasi sekolah secara digital.
          </p>

          <Link href="/login" className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-blue-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-2xl">
            <span className="transition-all duration-300 group-hover:opacity-0">
              Mulai
            </span>
            <span className="absolute flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <LogIn className="w-6 h-6"/>
            </span>
          </Link>
        </div>

        {/* DOODLE DESKTOP */}
        <div className="hidden lg:flex flex-1 justify-center">
          <Doodle />
        </div>

        {/* DOODLE BAWAH MOBILE */}
        <div className="lg:hidden w-full flex justify-center">
          <Doodle />
        </div>

      </section>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .float {
          animation: float 4s ease-in-out infinite;
        }

        .float-slow {
          animation: float 6s ease-in-out infinite;
        }

        .float-fast {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

    </main>
  );
}


/* ================= DOODLE ================= */

function Doodle() {
  return (
    <div className="relative w-85 h-70 md:w-105 md:h-85">

      {/* Background blob */}
      <div className="absolute w-full h-full bg-blue-50 rounded-[40px]"></div>

      {/* dashboard card */}
      <div className="absolute top-8 left-10 w-48 h-28 bg-white rounded-xl shadow-lg p-3 float">
        <div className="h-3 bg-blue-300 rounded w-2/3 mb-2"></div>

        <div className="flex gap-2 items-end h-10">
          <div className="w-2 bg-blue-400 h-4"></div>
          <div className="w-2 bg-blue-500 h-7"></div>
          <div className="w-2 bg-blue-600 h-5"></div>
          <div className="w-2 bg-blue-400 h-8"></div>
        </div>
      </div>

      {/* data card */}
      <div className="absolute bottom-8 right-8 w-40 h-20 bg-white rounded-xl shadow-md p-3 float-slow">
        <div className="h-2 bg-blue-300 rounded w-1/2 mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-2/3 mt-1"></div>
      </div>

      {/* floating circles */}
      <div className="absolute top-0 right-12 w-10 h-10 bg-blue-200 rounded-full float-fast"></div>
      <div className="absolute bottom-2 left-6 w-6 h-6 bg-blue-400 rounded-full float"></div>
      <div className="absolute top-24 right-2 w-4 h-4 bg-blue-500 rounded-full float-slow"></div>

      {/* squares */}
      <div className="absolute top-16 left-0 w-10 h-10 bg-blue-300 rotate-12 rounded-md float"></div>
      <div className="absolute bottom-10 right-0 w-12 h-12 bg-blue-200 rotate-45 rounded-lg float-fast"></div>

      {/* lines */}
      <div className="absolute top-6 left-1/2 w-20 h-1 bg-blue-300"></div>
      <div className="absolute bottom-4 right-1/3 w-16 h-1 bg-blue-200"></div>

    </div>
  );
}