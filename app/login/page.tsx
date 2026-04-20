"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { School, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage(){
    const namaSekolah = "SDN 02 SERUA";
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
        } catch (error) {
            setError("terjadi kesalahan");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F1F5F9] font-sans">
            <div className="hidden lg:flex lg:w-3/5 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                <div className="relative z-10 max-w-lg text-white">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 mb-12 shadow-2xl">
                        <School className="w-10 h-10 text-blue-200"/>
                        <span className="text-2xl font-[900] tracking-tighter">SIAKAD DIGITAL</span>
                    </div>
                    <h1 className="text-6xl font-[900] leading-tight mb-6">
                        Kelola Absensi <br />
                        <span className="text-blue-200">Lebih Efisien</span>
                    </h1>
                    <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90">
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
                    <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-[900] text-slate-900 mb-2">Login</h2>
                            <p className="text-slate-500 font-bold text-sm">Masuk dengan Akun yang Tersedia</p>
                        </div>
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shrink-0"></span>
                                {error}
                            </div>
                        )}
                        <form action="" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail className="w-5 h-5"/>
                                    </div>
                                    <input type="email" id="email" name="email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-slate-800" required placeholder="Masukan Email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock className="w-5 h-5"/>
                                    </div>
                                    <input type="password" id="password" name="password" required placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-slate-800" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 mt-4 uppercase tracking-widest">
                                {loading ? "Memverifikasi..." : (
                                    <>
                                        <LogIn className="w-5 h-5"/>Login
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    <p className="mt-10 text-center text-slate-400 text-xs font-bold tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} {namaSekolah}
                    </p>
                </div>
            </div>
        </div>
    );
}
