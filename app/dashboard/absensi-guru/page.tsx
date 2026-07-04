/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getTeacherWithClass, saveTeacherAttendance } from "@/components/lib/actions";
import { Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AbsensiGuruPage() {
    const {data: session} = useSession();
    const userRole = (session?.user as any)?.role;
    const isReadOnly = userRole === "tu";
    const [teachers, setTeachers] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    // --- STATE ANIMASI KUSTOM (Pengganti Swal & Loading bawaan) ---
    const [formStage, setFormStage] = useState<"idle" | "loading" | "toast">("idle");
    const [formStatus, setFormStatus] = useState<"success" | "error">("success");
    const [formErrorMsg, setFormErrorMsg] = useState("");

    // --- TRANSISI KUSTOM DENGAN BEZIER CURVE ARRAY ---
    const smoothTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
    const fadeScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    useEffect(() => {
        try {
            setDate(new Date().toISOString().split("T")[0]);
        } catch (e) {
            console.error("Error setting date:", e);
        }
        setMounted(true);
        const load = async () => {
            try {
                const data = await getTeacherWithClass();
                if(!data || !Array.isArray(data)) {
                    console.error("Data guru error");
                }
                setTeachers(data);
                const initial: any = {};
                data.forEach((t: any) => {
                    if(t && t._id) {
                        initial[t._id] = { status: "hadir", notes: "" };
                    }
                });
                setAttendance(initial);
            } catch (error) {
                console.error("Terjadi kesalahan saat memuat data guru:", error);
            }
        };
        load();
    }, []);

    // --- HANDLER SIMPAN (Smooth Transition) ---
    const handleSave = async () => {
        if (isReadOnly) return;
        setFormStage("loading"); // Memunculkan overlay buku & pensil
        
        try {
            const payload = Object.keys(attendance).map(id => ({
                userId: id,
                status: attendance[id].status,
                notes: attendance[id].notes,
            }));
            
            await saveTeacherAttendance(payload, date);
            setFormStatus("success");
        } catch (error) {
            console.error("Gagal menyimpan absensi:", error);
            setFormStatus("error");
            setFormErrorMsg("Gagal menyimpan absensi, silahkan coba lagi.");
        }

        // Tahan animasi loading sebentar, lalu masuk mode wait ke toast
        setTimeout(() => {
            setFormStage("toast");
            
            // Hilangkan overlay sepenuhnya
            setTimeout(() => {
                setFormStage("idle");
            }, 3000);
        }, 1500); 
    };

    if(!mounted) return <div className="p-10 text-center text-slate-500 font-bold">Memuat halaman...</div>;

    return (
        <div className="p-6 relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Absensi Guru</h1>
                <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="date" className="text-sm font-semibold text-slate-700 min-w-20">Tanggal</label>
                        <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} disabled={isReadOnly} className="w-full sm:w-auto border border-slate-300 px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" />
                    </div>
                    <button onClick={handleSave} disabled={formStage !== "idle" || isReadOnly} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        <Save className="w-5 h-5"/>
                        {isReadOnly ? "Read only (TU)" : "Simpan Absensi"}
                    </button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={smoothTransition}>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                    <table className="min-w-175 w-full text-left text-sm">
                        <thead className="bg-[#271cff] border-b border-[#1b12d1] text-white uppercase font-bold text-xs tracking-wide">
                            <tr>
                                <th className="px-4 py-4 sm:px-6">ID Guru</th>
                                <th className="px-4 py-4 sm:px-6">Nama Guru</th>
                                <th className="px-4 py-4 sm:px-6 text-center">Status Kehadiran</th>
                                <th className="px-4 py-4 sm:px-6">Keterangan Khusus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teachers?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-3 py-10 sm:px-6 text-center text-slate-400 font-medium">
                                        Tidak ada guru yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                teachers?.map(t => (
                                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 sm:px-6 font-mono text-slate-500 text-xs">{t.idGuru || "-"}</td>
                                    <td className="px-4 py-4 sm:px-6 font-bold text-slate-800">{t.name}</td>
                                    <td className="px-4 py-4 sm:px-6">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {[
                                                { id: "hadir", label: "Hadir", activeClass: "bg-emerald-500 text-white border-emerald-600 shadow-sm" },
                                                { id: "izin", label: "Izin", activeClass: "bg-blue-500 text-white border-blue-600 shadow-sm" },
                                                { id: "sakit", label: "Sakit", activeClass: "bg-amber-500 text-white border-amber-600 shadow-sm" },
                                                { id: "alpa", label: "Alpa", activeClass: "bg-rose-500 text-white border-rose-600 shadow-sm" },
                                            ].map(s => {
                                                const isActive = attendance[t._id]?.status === s.id;
                                                return (
                                                    <button key={s.id} onClick={() => {
                                                        if(isReadOnly) return;
                                                        const newNotes = s.id === "hadir" ? "" : attendance[t._id]?.notes;
                                                            setAttendance({...attendance, [t._id]: {...attendance[t._id], status: s.id, notes: newNotes}});
                                                    }} disabled={isReadOnly} className={`px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all border disabled:cursor-not-allowed ${isActive ? s.activeClass : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-100"} ${isReadOnly ? "opacity-60" : ""}`}>
                                                        {s.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 sm:px-6 align-middle">
                                        <label htmlFor={`notes-${t._id}`} className="sr-only">Keterangan</label>
                                        <input type="text" id={`notes-${t._id}`} name={`notes-${t._id}`} placeholder={attendance[t._id]?.status === "hadir" ? "Hadir (tanpa catatan)" : "Tulis alasan/keterangan..."} value={attendance[t._id]?.notes || ""} onChange={e => setAttendance({...attendance, [t._id]: {...attendance[t._id], notes: e.target.value}})} disabled={attendance[t._id]?.status === "hadir" || isReadOnly} className={`w-full min-w-37.5 border rounded-lg outline-none text-sm p-2.5 transition-colors ${attendance[t._id]?.status === "hadir" || isReadOnly ? "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed font-medium" : "bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-800"}`} />
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ======================================================= */}
            {/* OVERLAY ANIMASI: LOADING & TOAST (MODE: WAIT)           */}
            {/* ======================================================= */}
            <AnimatePresence>
                {formStage !== "idle" && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={smoothTransition} className="absolute inset-0" />
                        
                        <AnimatePresence mode="wait">
                            {/* STAGE A: LOADING BUKU & PENSIL */}
                            {formStage === "loading" && (
                                <motion.div key="loading-form" {...fadeScale} transition={smoothTransition} className="bg-white w-64 h-64 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-6 relative z-10 border border-slate-100">
                                    <div className="w-32 h-24 relative mb-4 flex items-center justify-center">
                                        <div className="w-28 h-20 bg-slate-50 border-2 border-slate-200 rounded-sm relative flex shadow-inner">
                                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200 transform -translate-x-1/2 z-10" />
                                            <div className="w-1/2 h-full p-2 flex flex-col gap-1.5 justify-center items-end pr-3">
                                                <div className="w-full h-0.75 bg-slate-200 rounded-full" />
                                                <div className="w-4/5 h-0.75 bg-slate-200 rounded-full" />
                                                <div className="w-full h-0.75 bg-slate-200 rounded-full" />
                                            </div>
                                            <div className="w-1/2 h-full p-2 flex flex-col gap-1.5 justify-center items-start pl-3 relative">
                                                <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" viewBox="0 0 50 50">
                                                    <motion.path d="M 5,15 Q 15,12 25,18 T 45,15 M 5,27 Q 20,24 35,30" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                                                </svg>
                                            </div>
                                        </div>
                                        <motion.div className="absolute w-4 h-12 origin-bottom-left z-20" style={{ top: 10, left: 60 }} animate={{ x: [0, 15, -5, 20, 0], y: [0, 5, -2, 8, 0], rotate: [25, 30, 20, 35, 25] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                            <div className="w-full h-8 bg-amber-400 rounded-t-sm border-x border-t border-amber-600 relative">
                                                <div className="absolute -top-2 left-0 right-0 h-2 bg-rose-400 rounded-t-sm border-t border-x border-rose-500" />
                                            </div>
                                            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-amber-200 relative" style={{ content: "''" }}>
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-slate-800" />
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 tracking-wide animate-pulse">Menyimpan Rekap...</span>
                                    <span className="text-xs text-slate-400 mt-1 font-medium">Sinkronisasi Server</span>
                                </motion.div>
                            )}

                            {/* STAGE B: TOAST JEMPOL */}
                            {formStage === "toast" && (
                                <motion.div key="toast-form" {...fadeScale} transition={smoothTransition} className={`flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl shadow-2xl text-white relative z-10 w-80 text-center ${formStatus === "success" ? "bg-blue-600 border border-blue-500" : "bg-rose-600 border border-rose-500"}`}>
                                    {formStatus === "success" ? (
                                        <>
                                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={smoothTransition} className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner">
                                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <motion.path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }} />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Berhasil Disimpan</h3>
                                                <p className="text-blue-100 text-xs font-medium">Rekap absensi guru telah tercatat.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <AlertCircle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Gagal Menyimpan</h3>
                                                <p className="text-rose-100 text-xs font-medium">{formErrorMsg}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}