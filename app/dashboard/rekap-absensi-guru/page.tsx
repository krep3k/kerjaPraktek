/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getTeacherAttendanceRecap, getAvailableAttendanceDates, getTeacherAttendanceMonthlySummary } from "@/components/lib/actions";
import { Download, Search, CalendarDays, Calendar, ChevronLeft, XCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RekapAbsensiGuru() {
    const [isMounted, setIsMounted] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "detail" | "range">("list");
    const [allDates, setAllDates] = useState<string[]>([]);
    const [displayedDates, setDisplayedDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [monthlyMonth, setMonthlyMonth] = useState(new Date().toISOString().slice(0, 7));
    const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- STATE ANIMASI KUSTOM (Pengganti Swal) ---
    const [overlayStage, setOverlayStage] = useState<"idle" | "loading" | "toast">("idle");
    const [overlayStatus, setOverlayStatus] = useState<"success" | "warning" | "error">("success");
    const [overlayTitle, setOverlayTitle] = useState("");
    const [overlayMsg, setOverlayMsg] = useState("");

    // --- TRANSISI KUSTOM BEZIER CURVE ---
    const smoothTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
    const fadeScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const monthOptions = [
        { value: "01", label: "Januari" },
        { value: "02", label: "Februari" },
        { value: "03", label: "Maret" },
        { value: "04", label: "April" },
        { value: "05", label: "Mei" },
        { value: "06", label: "Juni" },
        { value: "07", label: "Juli" },
        { value: "08", label: "Agustus" },
        { value: "09", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" }
    ];

    const yearOptions = Array.from({ length: 11 }, (_, i) => {
        return new Date().getFullYear() - 5 + i;
    });

    useEffect(() => {
        setIsMounted(true);
        const loadDates = async () => {
            setLoading(true);
            const dates = await getAvailableAttendanceDates();
            setAllDates(dates);
            setDisplayedDates(dates);
            setLoading(false);
        }
        loadDates();
    }, []);

    // --- HELPER UNTUK MUNCULKAN TOAST ---
    const showToast = (status: "success" | "warning" | "error", title: string, msg: string) => {
        setOverlayStatus(status);
        setOverlayTitle(title);
        setOverlayMsg(msg);
        setOverlayStage("toast");
        setTimeout(() => setOverlayStage("idle"), 3000);
    };

    // --- HELPER UNTUK PROSES DOWNLOAD ---
    const processDownloadWithAnimation = (downloadLogic: () => void) => {
        setOverlayStage("loading");
        setTimeout(() => {
            downloadLogic();
            setOverlayStatus("success");
            setOverlayTitle("Berhasil Diekspor!");
            setOverlayMsg("Berkas CSV sedang diunduh browser.");
            setOverlayStage("toast");
            setTimeout(() => setOverlayStage("idle"), 3000);
        }, 1500);
    };

    const handleDateClick = async (date: string) => {
        setLoading(true);
        setSelectedDate(date);
        const res = await getTeacherAttendanceRecap(date, date);
        setData(res);
        setViewMode("detail");
        setLoading(false);
    };

    const handleRangeSearch = async () => {
        if(!start || !end) {
            showToast("warning", "Tanggal Belum Lengkap!", "Pilih rentang tanggal terlebih dahulu.");
            return;
        }
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const filtered = allDates.filter(d => {
            const time = new Date(d).getTime();
            return time >= startTime && time <= endTime;
        });
        setDisplayedDates(filtered);
    };

    const handleLoadMonthlySummary = async () => {
        setMonthlyLoading(true);
        try {
            const summary = await getTeacherAttendanceMonthlySummary(monthlyMonth);
            setMonthlySummary(summary);
        } catch (error) {
            console.error("Gagal memuat rekap bulanan guru:", error);
            showToast("error", "Gagal Memuat Data!", "Gagal memuat rekap bulanan guru. Silakan coba lagi.");
        } finally {
            setMonthlyLoading(false);
        }
    };

    const handleResetFilter = () => {
        setStart("");
        setEnd("");
        setDisplayedDates(allDates);
    };

    const exportToCSV = () => {
        if(data.length === 0) {
            showToast("warning", "Gagal Mengekspor!", "Tidak ada data untuk diekspor.");
            return;
        }
        
        processDownloadWithAnimation(() => {
            const headers = ["Tanggal,ID Guru,Nama,JabatanStruktural,Status,Catatan\n"];
            const rows = data.map(i => {
                const dateStr = new Date(i.date).toLocaleDateString("id-ID");
                const notes = (i.notes || "-").replace(/,/g, "");
                const nama = (i.userId?.name || "").replace(/,/g, "");
                const jabatanStruktural = (i.userId?.jabatanStruktural || "").replace(/,/g, "");
                return `${dateStr}, ${i.userId?.idGuru || "-"}, ${nama}, ${jabatanStruktural}, ${i.status}, ${notes}\n`;
            });
            const blob = new Blob([headers + rows.join("")], {type: "text/csv"});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Absensi_Guru_${selectedDate}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    const exportMonthlySummaryToCSV = () => {
        if(monthlySummary.length === 0) {
            showToast("warning", "Gagal Mengekspor!", "Tidak ada data bulanan untuk diekspor.");
            return;
        }
        
        processDownloadWithAnimation(() => {
            const headers = ["Nama Guru,ID Guru,Jabatan Struktural,Hadir,Sakit,Izin,Alpha,Total\n"];
            const rows = monthlySummary.map(i => `${i.name},${i.idGuru},${i.jabatanStruktural},${i.hadir},${i.sakit},${i.izin},${i.alpa},${i.total}\n`);
            const blob = new Blob([headers + rows.join("")], {type: "text/csv"});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Rekap_Absensi_Guru_Bulanan_${monthlyMonth}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    const formatDateIndo = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    if(!isMounted) {
        return null;
    }

    return (
        <div className="p-6 relative">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-blue-600"/>Rekapitulasi Absensi Guru
            </h1>
            
            {viewMode === "list" && (
                <div className="space-y-6">
                    {/* Panel Filter Rentang Waktu */}
                    <div className="flex flex-wrap gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm items-end">
                        <div className="w-full md:w-auto">
                            <h3 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2"><Search className="w-4 h-4"/>Filter Berdasarkan Rentang Tanggal</h3>
                            <div className="flex flex-wrap gap-3 items-end">
                                <div>
                                    <label htmlFor="from" className="block text-[10px] font-bold mb-1 text-slate-500 uppercase">Dari Tanggal</label>
                                    <input type="date" id="from" value={start} onChange={e => setStart(e.target.value)} className="border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label htmlFor="to" className="block text-[10px] font-bold mb-1 text-slate-500 uppercase">Sampai Tanggal</label>
                                    <input type="date" id="to" value={end} onChange={e => setEnd(e.target.value)} className="border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <button onClick={handleRangeSearch} className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors">Terapkan Filter</button>
                                {(start || end) && (
                                    <button onClick={handleResetFilter} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center gap-2 border border-rose-200">
                                        <XCircle className="w-4 h-4"/>Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Panel Rekap Bulanan */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-600"/>Rekap Bulanan Absensi Guru</h3>
                        <div className="flex flex-wrap gap-3 items-end mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="month" className="block text-[10px] font-bold mb-1 text-slate-500 uppercase">Bulan</label>
                                    <select id="month" title="Bulan" value={monthlyMonth.slice(5)} onChange={e => setMonthlyMonth(`${monthlyMonth.slice(0, 4)}-${e.target.value}`)} className="border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                        {monthOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="year" className="block text-[10px] font-bold mb-1 text-slate-500 uppercase">Tahun</label>
                                    <select id="year" title="Tahun" value={monthlyMonth.slice(0, 4)} onChange={e => setMonthlyMonth(`${e.target.value}-${monthlyMonth.slice(5)}`)} className="border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                        {yearOptions.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleLoadMonthlySummary} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">Tampilkan Rekap Bulanan</button>
                            <button onClick={() => setMonthlySummary([])} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors border border-slate-200">Reset Bulanan</button>
                            <button onClick={exportMonthlySummaryToCSV} disabled={monthlySummary.length === 0} className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Export Bulanan CSV</button>
                        </div>
                        {monthlyLoading ? (
                            <div className="text-slate-500 text-sm font-medium animate-pulse">Memuat rekap bulanan...</div>
                        ) : monthlySummary.length === 0 ? (
                            <div className="text-slate-500 text-sm">Pilih bulan lalu klik Tampilkan Rekap Bulanan untuk melihat statistik.</div>
                        ) : (
                            <div className="overflow-x-auto border rounded-2xl">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 border-b font-bold text-slate-600 uppercase text-[10px]">
                                        <tr>
                                            <th className="px-6 py-4">Nama Guru</th>
                                            <th className="px-6 py-4">ID Guru</th>
                                            <th className="px-6 py-4">Jabatan</th>
                                            <th className="px-6 py-4 text-center">Hadir</th>
                                            <th className="px-6 py-4 text-center">Sakit</th>
                                            <th className="px-6 py-4 text-center">Izin</th>
                                            <th className="px-6 py-4 text-center">Alpha</th>
                                            <th className="px-6 py-4 text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {monthlySummary.map((item: any) => (
                                            <tr key={item.userId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.idGuru}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.jabatanStruktural}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-emerald-700">{item.hadir}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-amber-700">{item.sakit}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-blue-700">{item.izin}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-rose-700">{item.alpa}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    {/* Riwayat Absensi (Kotak Tanggal) */}
                    <div>
                        <h3 className="font-bold text-slate-700 text-base mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600"/>Riwayat Absensi Guru {start && end ? "(Hasil Filter)" : "Tersedia"}
                        </h3>
                        {loading ? (
                            <div className="text-slate-500 text-sm font-medium animate-pulse">Memuat riwayat absensi...</div>
                        ) : displayedDates.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border text-center text-slate-500 font-medium">Tidak ditemukan riwayat absensi untuk rentang tanggal yang dipilih.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {displayedDates.map((date) => (
                                    <button key={date} onClick={() =>handleDateClick(date)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                                        <div className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase mb-1">Lihat Detail</div>
                                        <div className="font-bold text-slate-800">{formatDateIndo(date)}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {viewMode === "detail" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
                        <div className="flex items-center gap-4">
                            <button title="return" onClick={() => setViewMode("list")} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg leading-tight">Detail Absensi</h2>
                                <p className="text-xs font-medium text-slate-500">{formatDateIndo(selectedDate)}</p>
                            </div>
                        </div>
                        <button onClick={exportToCSV} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm">
                            <Download className="w-4 h-4"/>Export Excel (CSV)
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border overflow-x-auto shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b font-bold text-slate-600 uppercase text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Nama Guru</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Memuat data</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Tidak ditemukan data absensi untuk tanggal yang dipilih.</td></tr>
                                ) : (
                                    data.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-600">{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {item.userId?.name || "Unknown"}
                                                <span className="block text-[10px] font-bold text-blue-600 uppercase mt-0.5">{item.userId?.jabatanStruktural}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${item.status === 'hadir' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : item.status === 'izin' ? 'bg-blue-100 text-blue-700 border border-blue-200' : item.status === 'sakit' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 italic text-slate-500 text-xs">{item.notes || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ======================================================= */}
            {/* OVERLAY ANIMASI: LOADING & TOAST (MODE: WAIT)           */}
            {/* ======================================================= */}
            <AnimatePresence>
                {overlayStage !== "idle" && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={smoothTransition} className="absolute inset-0" />
                        
                        <AnimatePresence mode="wait">
                            {/* STAGE A: LOADING UNDUHAN (IKON DOKUMEN & PANAH) */}
                            {overlayStage === "loading" && (
                                <motion.div key="loading-download" {...fadeScale} transition={smoothTransition} className="bg-white w-64 h-64 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-6 relative z-10 border border-slate-100">
                                    <div className="w-24 h-28 bg-emerald-50 border-2 border-emerald-200 rounded-lg relative flex flex-col items-center justify-center mb-4 overflow-hidden shadow-inner">
                                        <motion.div animate={{ y: [-25, 25], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: [0.22, 1, 0.36, 1] as const }} className="text-emerald-500 absolute">
                                            <Download className="w-10 h-10" strokeWidth={2.5} />
                                        </motion.div>
                                        <div className="absolute bottom-3 flex flex-col gap-1.5 w-12 items-center">
                                            <div className="h-1.5 bg-emerald-200 rounded-full w-full" />
                                            <div className="h-1.5 bg-emerald-200 rounded-full w-4/5" />
                                            <div className="h-1.5 bg-emerald-200 rounded-full w-full" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600 tracking-wide animate-pulse">Menyiapkan Berkas...</span>
                                    <span className="text-xs text-slate-400 mt-1 font-medium">Mengekspor ke Spreadsheet</span>
                                </motion.div>
                            )}

                            {/* STAGE B: TOAST (BERHASIL / PERINGATAN / GAGAL) */}
                            {overlayStage === "toast" && (
                                <motion.div key="toast-overlay" {...fadeScale} transition={smoothTransition} className={`flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl shadow-2xl text-white relative z-10 w-80 text-center ${overlayStatus === "success" ? "bg-emerald-600 border border-emerald-500" : overlayStatus === "warning" ? "bg-amber-500 border border-amber-400" : "bg-rose-600 border border-rose-500"}`}>
                                    {overlayStatus === "success" && (
                                        <>
                                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={smoothTransition} className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner">
                                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                    <motion.path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }} />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{overlayTitle}</h3>
                                                <p className="text-emerald-100 text-xs font-medium">{overlayMsg}</p>
                                            </div>
                                        </>
                                    )}
                                    {overlayStatus === "warning" && (
                                        <>
                                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <AlertTriangle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{overlayTitle}</h3>
                                                <p className="text-amber-100 text-xs font-medium">{overlayMsg}</p>
                                            </div>
                                        </>
                                    )}
                                    {overlayStatus === "error" && (
                                        <>
                                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <AlertCircle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{overlayTitle}</h3>
                                                <p className="text-rose-100 text-xs font-medium">{overlayMsg}</p>
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