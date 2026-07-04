/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGNilaiRecord, saveBulkNilai, getStudentsFiltered } from "@/components/lib/actions";
import { getMataPelajaranByKelas } from "@/components/lib/constants";
import { Save, AlertCircle } from "lucide-react";
import { getRombelByKelas } from "@/components/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function RekapNilaiPage() {
    const {data: session} = useSession();
    const userRole = (session?.user as any)?.role;
    const isReadOnly = userRole === "tu";
    const [kelas, setKelas] = useState<number>(1);
    const [rombel, setRombel] = useState<string>("A");
    const [semester, setSemester] = useState<string>("Ganjil");
    const [mapel, setMapel] = useState<string>("Matematika");
    const [jenisNilai, setJenisNilai] = useState("Ulangan Harian");
    const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [nilaiData, setNilaiData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // --- STATE ANIMASI KUSTOM ---
    const [formStage, setFormStage] = useState<"idle" | "loading" | "toast">("idle");
    const [formStatus, setFormStatus] = useState<"success" | "error">("success");
    const [formErrorMsg, setFormErrorMsg] = useState("");

    // --- TRANSISI KUSTOM BEZIER CURVE ---
    const smoothTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
    const fadeScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const mataPelajaranOption = getMataPelajaranByKelas(kelas);
    const rombelOption = getRombelByKelas(kelas);
    const isEkskulMapel = mataPelajaranOption.ekskul.includes(mapel);
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const studentList = await getStudentsFiltered(kelas, rombel);
            setStudents(studentList);

            const jenisForQuery = isEkskulMapel ? "ekskul" : jenisNilai;
            const records = await getGNilaiRecord(kelas, rombel, semester, mapel, jenisForQuery, tanggal);
            const recordMap: any = {};

            studentList.forEach((s: any) => {
                recordMap[s._id] = isEkskulMapel ? "-" : 0;
            });

            records.forEach((r: any) => {
                recordMap[r.studentId] = isEkskulMapel ? r.nilaiEkskul : r.nilai;
            });

            setNilaiData(recordMap);
            setLoading(false);
        };
        loadData();
    }, [kelas, rombel, semester, mapel, jenisNilai, tanggal, isEkskulMapel]);

    const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const kelasBaru = Number(e.target.value);
        setKelas(kelasBaru);
        const daftarMapelBaru = getMataPelajaranByKelas(kelasBaru).semuaMapel;
        if(!daftarMapelBaru.includes(mapel)) {
            setMapel(daftarMapelBaru[0] || "");
        }
        const daftarRombelBaru = getRombelByKelas(kelasBaru);
        if(!daftarRombelBaru.includes(rombel)) {
            setRombel(daftarRombelBaru[0] || "");
        }
    };

    const handleMapelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mapelBaru = e.target.value;
        setMapel(mapelBaru);

        const mataPelajaranBaru = getMataPelajaranByKelas(kelas);
        if (mataPelajaranBaru.ekskul.includes(mapelBaru)) {
            setJenisNilai("ekskul");
        } else if (jenisNilai === "ekskul") {
            setJenisNilai("Ulangan Harian");
        }
    };

    // --- HANDLER SIMPAN (Smooth Transition) ---
    const handleSave = async () => {
        if (isReadOnly) return;
        setFormStage("loading"); // Memunculkan overlay buku & pensil

        const dataToSave = students.map(s => {
            if (isEkskulMapel) {
                return {
                    studentId: s._id,
                    nilaiEkskul: nilaiData[s._id] || "-"
                };
            }
            return {
                studentId: s._id,
                nilai: Number(nilaiData[s._id]) || 0
            };
        });

        try {
            const res = await saveBulkNilai(dataToSave, kelas, rombel, semester, mapel, isEkskulMapel ? "ekskul" : jenisNilai, tanggal);
            if(res.error){
                setFormStatus("error");
                setFormErrorMsg("Gagal menyimpan data: " + res.error);
            } else {
                setFormStatus("success");
            }
        } catch(error) {
            console.error("Gagal menyimpan nilai : ", error);
            setFormStatus("error");
            setFormErrorMsg("Gagal menghubungi server. Periksa koneksi internet Anda.");
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

    return (
        <div className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border relative">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Record Input Nilai</h1>
                <button title="save" onClick={handleSave} disabled={formStage !== "idle" || isReadOnly} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95">
                    <Save className="w-5 h-5"/>
                    <span>{isReadOnly ? "Read only (TU)" : "Simpan Nilai"}</span>
                </button>
            </div>
            
            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl border mb-6">
                <div className="block text-sm font-semibold text-blue-700 mb-1">Kelas
                    <label htmlFor="kelas-select">
                        <select title="kelas" id="kelas-select" value={kelas} onChange={handleKelasChange} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                            {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">Rombel
                    <label htmlFor="rombel-select">
                        <select title="rombel" id="rombel-select" value={rombel} onChange={e => setRombel(e.target.value)} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                            {rombelOption.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">Semester
                    <label htmlFor="semester-select">
                        <select title="semester" id="semester-select" value={semester} onChange={e => setSemester(e.target.value)} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">Mata Pelajaran
                    <label htmlFor="mapel">
                        <select title="mapel" id="mapel" value={mapel} onChange={handleMapelChange} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                            {mataPelajaranOption.mapelGuruKelas.map(m => (
                                <option value={m} key={m}>{m}</option>
                            ))}
                            {mataPelajaranOption.mapelBidangStudi.map(m => (
                                <option value={m} key={m}>{m}</option>
                            ))}
                            {mataPelajaranOption.ekskul.map(m => (
                                <option value={m} key={m}>{m}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div>
                    <label htmlFor="jenisNilaiText" className="block text-sm font-semibold text-blue-700 mb-1">Jenis Penilaian</label>
                    {isEkskulMapel ? (
                        <input
                            id="jenisNilaiText"
                            title="Jenis nilai ekskul"
                            type="text"
                            value="Ekstrakurikuler"
                            disabled
                            className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium cursor-not-allowed mt-1"
                        />
                    ) : (
                        <select title="Jenis Penilaian" name="jenisNilai" id="jenisNilaiSelect" value={jenisNilai} onChange={e => setJenisNilai(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium mt-1">
                            <option value="Tugas">Tugas</option>
                            <option value="Ulangan Harian">Ulangan Harian</option>
                            <option value="UTS">UTS</option>
                            <option value="UAS">UAS</option>
                        </select>
                    )}
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-blue-700 mb-1">Tanggal</label>
                    <input id="date" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} disabled={isReadOnly} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-1" />
                </div>
            </div>

            {loading ? <div className="text-center p-10 font-medium text-slate-500">Memuat data nilai...</div> : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={smoothTransition}>
                    <div className="rounded-2xl overflow-hidden border mt-4 shadow-sm">
                        <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-[#2522ff] text-white border-b">
                            <tr>
                                <th className="p-4 w-16">No</th>
                                <th className="p-4">Nama Siswa</th>
                                <th className="p-4 w-48 text-center">Input Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">Data siswa tidak ditemukan untuk kelas ini.</td>
                                </tr>
                            ) : students.map((s, idx) => (
                                <tr key={s._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 align-middle text-slate-500 font-medium">{idx + 1}</td>
                                    <td className="p-4 font-bold text-slate-800 align-middle">{s.name}</td>
                                    <td className="p-4 text-center align-middle">
                                        <label htmlFor={`nilai-${s._id}`} className="sr-only">Nilai siswa</label>
                                        {isEkskulMapel ? (
                                            <select
                                                id={`nilai-${s._id}`}
                                                title="Nilai ekskul"
                                                value={nilaiData[s._id] || "-"}
                                                onChange={e => setNilaiData({...nilaiData, [s._id]: e.target.value})}
                                                disabled={isReadOnly}
                                                className="w-24 text-center border p-1.5 rounded-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed outline-none shadow-sm"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="-">-</option>
                                            </select>
                                        ) : (
                                            <input
                                                id={`nilai-${s._id}`}
                                                title="Nilai siswa"
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={nilaiData[s._id] || ""}
                                                onChange={e => setNilaiData({...nilaiData, [s._id]: e.target.value})}
                                                disabled={isReadOnly}
                                                className="w-24 text-center border p-1.5 rounded-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed outline-none shadow-sm"
                                                placeholder="Nilai"
                                            />
                                        )}
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
                                    <span className="text-sm font-bold text-blue-600 tracking-wide animate-pulse">Menyimpan Nilai...</span>
                                    <span className="text-xs text-slate-400 mt-1 font-medium">Sinkronisasi Database</span>
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
                                                <p className="text-blue-100 text-xs font-medium">Data nilai telah direkapitulasi.</p>
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