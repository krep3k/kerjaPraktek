"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { School, Mail, Lock, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage(){
    const namaSekolah = "SDN SERUA 02";
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res= await signIn("credentials", {
                email,
                password,
                redirect: false
            });
            if(res?.error) {
                setError(res.error);
                setLoading(false);
            } else if (res?.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("terjadi kesalahan");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#9ec0ff] font-sans">
            <div className="hidden lg:flex lg:w-3/5 bg-[#2651dc] relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EDCD44]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                <div className="relative z-10 max-w-lg text-white">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 mb-12 shadow-2xl">
                        <School className="w-10 h-10 text-[#feffff]"/>
                        <span className="text-2xl font-[900] tracking-tighter">SIAKAD DIGITAL</span>
                    </div>
                    <h1 className="text-6xl font-[900] leading-tight mb-6">
                        Kelola Absensi <br />
                        <span className="text-[#ffffff]">Lebih Efisien</span>
                    </h1>
                    <p className="text-xl text-[#ffffff] font-medium leading-relaxed opacity-90">
                        Selamat datang kembali di Portal Administrasi {namaSekolah}. Silakan masuk untuk mengelola data akademik dan laporan kehadiran.
                    </p>
                    <div className="mt-12 flex gap-4">
                        <div className="h-1.5 w-12 bg-white rounded-full"></div>
                        <div className="h-1.5 w-4 bg-white/30 rounded-full"></div>
                        <div className="h-1.5 w-4 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-[#DC3E26]/20 border border-[#a7a4f4]">
                        <div className="mb-10">
                            <h2 className="text-3xl font-[900] text-[#2D2735] mb-2">Login</h2>
                            <p className="text-[#6E6B7F] font-bold text-sm">Masuk dengan Akun yang Tersedia</p>
                        </div>
                        {error && (
                            <div className="mb-6 p-4 bg-[#DC3E26]/10 border border-[#DC3E26]/20 text-[#DC3E26] rounded-2xl text-xs font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#DC3E26] rounded-full animate-pulse shrink-0"></span>
                                {error}
                            </div>
                        )}
                        <form action="" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-black text-[#6E6B7F] uppercase tracking-widest ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6E6B7F] group-focus-within:text-[#4447ed] transition-colors">
                                        <Mail className="w-5 h-5"/>
                                    </div>
                                    <input type="email" id="email" name="email" className="w-full pl-12 pr-4 py-4 bg-[#F7F3E3] border-2 border-[#F7F3E3] rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#EDCD44] focus:ring-4 focus:ring-[#EDCD44]/20 transition-all text-[#2D2735]" required placeholder="Masukan Email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-black text-[#6E6B7F] uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6E6B7F] group-focus-within:text-[#EDCD44] transition-colors">
                                        <Lock className="w-5 h-5"/>
                                    </div>
                                    <input type="password" id="password" name="password" required placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-[#F7F3E3] border-2 border-[#F7F3E3] rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#EDCD44] focus:ring-4 focus:ring-[#EDCD44]/20 transition-all text-[#2D2735]" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#4469ed] text-[#ffffff] py-4 rounded-2xl font-black text-sm hover:bg-[#3d5ed6] hover:shadow-xl hover:shadow-[#EDCD44]/20 active:scale-[0.98] transition-all disabled:opacity-70 mt-4 uppercase tracking-widest">
                                {loading ? "Memverifikasi..." : (
                                    <>
                                        <LogIn className="w-5 h-5"/>Login
                                    </>
                                )}
                            </button>
                            <Link href="/" className="w-full flex items-center justify-center gap-2 mt-3 py-4 rounded-2xl border-2 border-[#a4acf4] text-[#2D2735] font-black text-sm hover:bg-[#ffffff] hover:border-[#6944ed] transition-all uppercase tracking-widest">
                                <ArrowLeft className="w-5 h-5"/>Kembali
                            </Link>
                        </form>
                    </div>
                    <p className="mt-10 text-center text-[#6E6B7F] text-xs font-bold tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} {namaSekolah}
                    </p>
                </div>
            </div>
        </div>
    );
}
