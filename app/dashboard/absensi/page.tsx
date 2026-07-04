/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAbsensiRecord, saveBulkAbsensi, getStudentsFiltered } from "@/components/lib/actions";
import { Save, AlertCircle } from "lucide-react";
import { getRombelByKelas } from "@/components/lib/constants";
import { getMataPelajaranByKelas } from "@/components/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function AbsensiPage() {
    const {data: session} = useSession();
    const userRole = (session?.user as any)?.role;
    const isReadOnly = userRole === "tu";
    const [kelas, setKelas] = useState<number>(1);
    const [rombel, setRombel] = useState<string>("A");
    const today = new Date().toISOString().split("T")[0];
    const [tanggal, setTanggal] = useState<string>(today);
    const [students, setStudents] = useState<any[]>([]);
    const [absensiData, setAbsensiData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [mapel, setMapel] = useState("Matematika");
    const rombelOption = getRombelByKelas(kelas);

    // --- STATE ANIMASI SIMPAN (Buku & Pensil -> Toast) ---
    const [formStage, setFormStage] = useState<"idle" | "loading" | "toast">("idle");
    const [formStatus, setFormStatus] = useState<"success" | "error">("success");
    const [formErrorMsg, setFormErrorMsg] = useState("");

    // Transisi kustom sederhana yang smooth
    const smoothTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
    const fadeScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const studentList = await getStudentsFiltered(kelas, rombel);
            setStudents(studentList);
            const records = await getAbsensiRecord(kelas, rombel, tanggal);
            const recordMap: any = {};
            studentList.forEach((s: any) => {recordMap[s._id] = {status: "Hadir", keterangan: ""};});
            records.forEach((r: any) => {recordMap[r.studentId] = {status: r.status, keterangan: r.keterangan};});
            setAbsensiData(recordMap);
            setLoading(false);
        };
        loadData();
    }, [kelas, rombel, tanggal]);

    const handleAbsenChange = (id: string, field: string, value: string) => {
        setAbsensiData((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            }
        }));
    }

    const handleStatusSelect = (id: string, status: string) => {
        setAbsensiData((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                status,
                keterangan: status === "Hadir" ? "" : prev[id]?.keterangan || "",
            }
        }));
    }

    const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const kelasBaru = Number(e.target.value);
        setKelas(kelasBaru);
        const daftarMapelBaru = getMataPelajaranByKelas(kelasBaru).semuaMapel;
        if(!daftarMapelBaru.includes(mapel)) {
            setMapel(daftarMapelBaru[0] || "");
        }
        const daftarRombelBaru = getRombelByKelas(kelasBaru);
        if(!daftarMapelBaru.includes(rombel)) {
            setRombel(daftarRombelBaru[0] || "");
        }
    };

    // --- HANDLER SUBMIT (Animasi Smooth) ---
    const handleSave = async () => {
        setFormStage("loading"); // Memunculkan overlay buku & pensil
        
        try {
            const dataToSave = students.map(s => ({
                studentId: s._id,
                status: absensiData[s._id].status,
                keterangan: absensiData[s._id].keterangan
            }));
            
            const res = await saveBulkAbsensi(dataToSave, kelas, rombel, tanggal);
            
            if(res.error) {
                setFormStatus("error");
                setFormErrorMsg("Gagal menyimpan: " + res.error);
            } else {
                setFormStatus("success");
            }
        } catch {
            setFormStatus("error");
            setFormErrorMsg("Terjadi kesalahan jaringan atau server.");
        }

        // Tahan animasi loading sebentar agar transisinya terlihat, lalu pindah ke toast
        setTimeout(() => {
            setFormStage("toast");
            
            // Hilangkan toast dan kembali ke mode idle
            setTimeout(() => {
                setFormStage("idle");
            }, 3000);
        }, 1500); 
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Record Absensi Siswa</h1>
                <div className="flex gap-3">
                    <button title="save" onClick={handleSave} disabled={isReadOnly} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95">
                        <Save className="w-5 h-5" />
                        <span className="font-semibold">{isReadOnly ? "Read only (TU)" : "Simpan Absensi"}</span>
                    </button>
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className="block text-sm font-semibold text-blue-700 mb-1">
                    <label htmlFor="" className="block text-sm font-semibold text-blue-700 mb-1">Kelas
                        <select value={kelas} onChange={handleKelasChange} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                            {[1, 2, 3, 4, 5, 6].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">
                    <label htmlFor="" className="block text-sm font-semibold text-blue-700 mb-1">Rombel
                        <select value={rombel} onChange={e => setRombel(e.target.value)} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                            {rombelOption.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">
                    <label htmlFor="date" className="block text-sm font-semibold text-blue-700 mb-1">Tanggal
                        <input id="date" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1" />
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-10 font-medium text-slate-500">Memuat data absensi...</div> 
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mt-4">
                        <table className="min-w-175 w-full table-auto text-left text-sm border-collapse">
                            <thead className="bg-[#2c25ff] border-b text-white">
                                <tr>
                                    <th className="p-4 w-16">No</th>
                                    <th className="p-4">Nama Siswa</th>
                                    <th className="p-4 text-center">Status Kehadiran</th>
                                    <th className="p-4">Keterangan Khusus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">Data siswa tidak ditemukan untuk kelas ini.</td>
                                    </tr>
                                ) : students.map((s, idx) => (
                                    <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50 last:border-b-0 transition-colors">
                                        <td className="p-4 align-middle text-slate-500 font-medium">{idx + 1}</td>
                                        <td className="p-4 font-bold text-slate-800 align-middle max-w-50 truncate">{s.name}</td>
                                        <td className="p-4 text-center align-middle">
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {[
                                                    { id: "Hadir", label: "Hadir", activeClass: "bg-emerald-500 text-white border-emerald-600 shadow-sm" },
                                                    { id: "Izin", label: "Izin", activeClass: "bg-blue-500 text-white border-blue-600 shadow-sm" },
                                                    { id: "Sakit", label: "Sakit", activeClass: "bg-amber-500 text-white border-amber-600 shadow-sm" },
                                                    { id: "Alpha", label: "Alpha", activeClass: "bg-rose-500 text-white border-rose-600 shadow-sm" },
                                                ].map(st => {
                                                    const isActive = absensiData[s._id]?.status === st.id;
                                                    return (
                                                        <button key={st.id} type="button" onClick={() => {
                                                            if(!isReadOnly) handleStatusSelect(s._id, st.id);
                                                        }} disabled={isReadOnly} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border disabled:cursor-not-allowed ${isActive ? st.activeClass : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-100"} ${isReadOnly ? "opacity-60" : ""}`}>
                                                            {st.label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <label htmlFor={`ket-${s._id}`} className="sr-only">Keterangan</label>
                                            <input id={`ket-${s._id}`} type="text" placeholder={absensiData[s._id]?.status === "Hadir" ? "Hadir (tanpa catatan)" : "Tulis alasan/keterangan..."} value={absensiData[s._id]?.keterangan || ""} onChange={e => handleAbsenChange(s._id, "keterangan", e.target.value)} disabled={absensiData[s._id]?.status === "Hadir" || isReadOnly} className={`w-full min-w-37.5 border rounded-lg outline-none text-sm p-2.5 transition-colors ${absensiData[s._id]?.status === "Hadir" || isReadOnly ? "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed font-medium" : "bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-800"}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* ======================================================= */}
            {/* OVERLAY ANIMASI: LOADING & TOAST (MODE: WAIT)           */}
            {/* ======================================================= */}
            <AnimatePresence>
                {formStage !== "idle" && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        {/* Backdrop menghilang secara otomatis saat mode pop/wait */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0" />
                        
                        {/* Gunakan mode wait agar elemen lama hilang bersih sebelum yang baru muncul */}
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
                                                    <motion.path d="M 5,15 Q 15,12 25,18 T 45,15 M 5,27 Q 20,24 35,30" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                                                </svg>
                                            </div>
                                        </div>
                                        <motion.div className="absolute w-4 h-12 origin-bottom-left z-20" style={{ top: 10, left: 60 }} animate={{ x: [0, 15, -5, 20, 0], y: [0, 5, -2, 8, 0], rotate: [25, 30, 20, 35, 25] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                                            <div className="w-full h-8 bg-amber-400 rounded-t-sm border-x border-t border-amber-600 relative">
                                                <div className="absolute -top-2 left-0 right-0 h-2 bg-rose-400 rounded-t-sm border-t border-x border-rose-500" />
                                            </div>
                                            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-amber-200 relative" style={{ content: "''" }}>
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-slate-800" />
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 tracking-wide animate-pulse">Menyimpan Rekap...</span>
                                    <span className="text-xs text-slate-400 mt-1 font-medium">Sinkronisasi Absensi</span>
                                </motion.div>
                            )}

                            {/* STAGE B: TOAST JEMPOL */}
                            {formStage === "toast" && (
                                <motion.div key="toast-form" {...fadeScale} transition={smoothTransition} className={`flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl shadow-2xl text-white relative z-10 w-80 text-center ${formStatus === "success" ? "bg-blue-600 border border-blue-500" : "bg-rose-600 border border-rose-500"}`}>
                                    {formStatus === "success" ? (
                                        <>
                                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "tween", duration: 0.3 }} className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner">
                                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <motion.path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Berhasil Disimpan</h3>
                                                <p className="text-blue-100 text-xs font-medium">Kehadiran kelas telah direkap.</p>
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