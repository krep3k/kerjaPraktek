/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
    getStudentsFiltered, addStudents, updateStudents, deleteStudent, 
    searchStudents, getTeacher, getWaliKelas, setWaliKelas, getKepsek 
} from "@/components/lib/actions";
import { PlusCircle, Edit, Trash2, X, Search, UserIcon, CheckSquare, Layers, AlertCircle, CheckCircle2 } from "lucide-react";
// Pastikan import ini sesuai dengan versi package motion di project Anda
import { motion, AnimatePresence } from "framer-motion"; 

export default function SiswaPage() {
    const { data: session } = useSession();
    const [students, setStudents] = useState<any[]>([]);
    const [filterKelas, setFilterKelas] = useState<number>(1);
    const [filterRombel, setFilterRombel] = useState<string>("A");
    const [kepsek, setKepsek] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const availableRombels = (filterKelas <= 4) ? ["A", "B", "C"] : ["A", "B"];
    
    // --- STATE ANIMASI TAMBAH / EDIT DATA (Menggantikan showModal & Swal) ---
    const [formStage, setFormStage] = useState<"idle" | "dialog" | "loading" | "toast">("idle");
    const [formStatus, setFormStatus] = useState<"success" | "error">("success");
    const [formErrorMessage, setFormErrorMessage] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // --- STATE ANIMASI HAPUS DATA (Menggantikan Swal Hapus) ---
    const [deleteStage, setDeleteStage] = useState<"idle" | "dialog" | "loading" | "taking" | "toast">("idle");
    const [deleteStatus, setDeleteStatus] = useState<"success" | "error">("success");
    const [studentToDelete, setStudentToDelete] = useState<any>(null);

    // --- STATE ANIMASI BULK UPDATE MASSAL (Menggantikan Swal Massal) ---
    const [bulkStage, setBulkStage] = useState<"idle" | "loading" | "toast">("idle");
    const [bulkStatus, setBulkStatus] = useState<"success" | "error">("success");

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkKelas, setBulkKelas] = useState<number>(1);
    const [bulkRombel, setBulkRombel] = useState<string>("A");
    
    const [formData, setFormData] = useState({
        nis: "", nisn: "", name: "", gender: "L", kelas: 1, rombel: "A", status: "aktif"
    });
    
    const [waliKelas, setWaliKelasData] = useState<any>(null);
    const [allTeachers, setAllTeachers] = useState<any[]>([]);
    const [loadingWali, setLoadingWali] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const userRole = session?.user ? (session?.user as any).role : null;
    const isAdmin = userRole === "admin";
    const showKepsekCard = userRole && userRole !== "kepsek";

    // ... [Efek dan Pengambilan Data Tetap Sama Seperti Kode Asli] ...
    useEffect(() => {
        const fetchTeachers = async () => {
            if(isAdmin) {
                const teachers = await getTeacher();
                setAllTeachers(teachers);
            }
        };
        fetchTeachers();
    }, [isAdmin]);

    useEffect(() => {
        const fetchKepsek = async () => {
            if (showKepsekCard) {
                const data = await getKepsek();
                setKepsek(data);
            }
        };
        fetchKepsek();
    }, [showKepsekCard]);

    useEffect(() => {
        let isMounted = true;
        const fetchWaliInfo = async () => {
            setLoadingWali(true);
            try {
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const wk = await getWaliKelas(filterKelas, normalizedRombel);
                if(isMounted) {
                    setWaliKelasData(wk);
                }
            } catch (error) {
                console.error("Gagal memuat wali kelas", error);
            } finally {
                if(isMounted) setLoadingWali(false);
            }
        };
        fetchWaliInfo();
        return () => {isMounted = false;};
    }, [filterKelas, filterRombel]);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                if(searchQuery.trim() !== "") {
                    const data = await searchStudents(searchQuery);
                    if(isMounted) {
                        setStudents(data);
                        setSelectedIds([]);
                    }
                } else {
                    const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                    const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                    if(isMounted) {
                        setStudents(data);
                        setSelectedIds([]);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat data siswa", error);
            } finally {
                if(isMounted) setLoading(false);
            }
        };
        if(searchQuery.trim() !== "") {
            const delaySearch = setTimeout(() => loadData(), 500);
            return () => clearTimeout(delaySearch);
        } else {
            loadData();
        }
        return () => {isMounted = false};
    }, [filterKelas, filterRombel, searchQuery]);

    useEffect(() => {
        setBulkKelas(filterKelas);
        setBulkRombel(filterRombel);
    }, [filterKelas, filterRombel]);

    const handleWaliKelasChange = async(e: React.ChangeEvent<HTMLSelectElement>) => {
        const teacherId = e.target.value;
        setLoadingWali(true);
        const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
        await setWaliKelas(filterKelas, normalizedRombel, teacherId);
        const wk = await getWaliKelas(filterKelas, normalizedRombel);
        setWaliKelasData(wk);
        setLoadingWali(false);
    }

    // --- FUNGSI BARU UNTUK HANDLE MODAL FORM ---
    const handleOpenForm = (siswa: any = null) => {
        if(siswa) {
            setEditingId(siswa._id);
            setFormData({
                nis: siswa.nis, nisn: siswa.nisn || "", name: siswa.name,
                gender: siswa.gender || "L", kelas: siswa.kelas, rombel: siswa.rombel, status: siswa.status,
            });
        } else {
            setEditingId(null);
            setFormData({nis: "", nisn: "", name: "", gender: "L", kelas: filterKelas, rombel: filterRombel, status: "aktif"});
        }
        setFormStage("dialog");
    };

    const handleSelectStudent = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if(selectedIds.length === students.length) setSelectedIds([]);
        else setSelectedIds(students.map(s => s._id));
    };

    // --- FUNGSI SUBMIT DATA (Animasi Buku & Pensil) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStage("loading"); // Transisi ke animasi menulis buku

        let isError = false;
        
        try {
            const res = editingId ? await updateStudents(editingId, formData) : await addStudents(formData);
            
            if(res.error) {
                setFormStatus("error");
                setFormErrorMessage(res.error);
                isError = true;
            } else {
                // Refresh Data
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                setStudents(data);
                setFormStatus("success");
            }
        } catch(error) {
            console.error(error);
            setFormStatus("error");
            setFormErrorMessage("Koneksi server terputus.");
            isError = true;
        }

        // Tampilkan Jempol / Error Toast
        setTimeout(() => {
            setFormStage("toast");
            // Reset ke Idle setelah beberapa detik
            setTimeout(() => {
                setFormStage("idle");
                if(!isError) {
                    setEditingId(null);
                }
            }, isError ? 6000 : 3500);
        }, 1500); // Simulasi delay sebentar agar animasi buku terlihat
    };

    // --- FUNGSI HAPUS DATA (Animasi Tong Sampah) ---
    const handleDeleteClick = (siswa: any) => {
        setStudentToDelete(siswa);
        setDeleteStage("dialog");
    };

    const confirmDelete = async () => {
        setDeleteStage("loading"); // Mulai animasi barang jatuh
        try {
            const res = await deleteStudent(studentToDelete._id);
            if(res.error) {
                setDeleteStatus("error");
                setDeleteStage("toast");
            } else {
                // Refresh Data
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                setStudents(data);
                
                setDeleteStatus("success");
                setDeleteStage("taking"); // Animasi lengan mengambil tong
                
                setTimeout(() => {
                    setDeleteStage("toast");
                }, 1500);
            }
        } catch(error) {
            console.error(error);
            setDeleteStatus("error");
            setDeleteStage("toast");
        }

        // Reset ke idle
        setTimeout(() => {
            setDeleteStage("idle");
            setStudentToDelete(null);
        }, 4500);
    };

    // --- FUNGSI BULK UPDATE MASSAL ---
    const handleBulkUpdate = async() => {
        if(selectedIds.length === 0) return;
        setBulkStage("loading");
        
        try {
            for(const id of selectedIds) {
                const currentStudent = students.find(s => s._id === id);
                if(currentStudent) {
                    const updatedData = {
                        nis: currentStudent.nis, nisn: currentStudent.nisn || "", name: currentStudent.name,
                        gender: currentStudent.gender || "L", status: currentStudent.status,
                        kelas: bulkKelas, rombel: bulkRombel,
                    };
                    await updateStudents(id, updatedData);
                }
            }
            const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
            const data = await getStudentsFiltered(filterKelas, normalizedRombel);
            setStudents(data);
            setSelectedIds([]);
            setBulkStatus("success");
        } catch(error) {
            console.error(error);
            setBulkStatus("error");
        }
        
        setBulkStage("toast");
        setTimeout(() => setBulkStage("idle"), 3000);
    };

    const totalL = students.filter((s: any) => s.gender === "L").length;
    const totalP = students.filter((s: any) => s.gender === "P").length;
    const totalSiswa = students.length;

    // Komponen Bentuk Jatuh Tong Sampah
    const shapes = [
        <div key="1" className="w-4 h-4 bg-blue-500 rounded-sm shadow-sm" />,
        <div key="2" className="w-4 h-4 bg-rose-500 rounded-full shadow-sm" />,
        <div key="3" className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-14 border-b-amber-500" />,
        <div key="4" className="w-6 h-3 bg-emerald-500 rounded-full shadow-sm" />,
        <div key="5" className="w-4 h-4 bg-purple-500 rotate-45 shadow-sm" />,
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto relative">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data siswa di sekolah SDN 0SERUA 02</p>
                </div>
                {isAdmin && (
                    <motion.button 
                        layoutId="form-morph-wrapper"
                        onClick={() => handleOpenForm()} 
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Tambah Siswa
                    </motion.button>
                )}
            </div>

            {/* --- INFO PANEL --- */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-sm mt-1">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">Informasi Kelas</h4>
                            <p className="text-sm font-semibold text-blue-900">
                                Wali Kelas {filterKelas} {filterRombel} : <span className="font-bold text-blue-700 ml-1">{loadingWali ? "Memuat..." : (waliKelas ? waliKelas.name : "Belum Diatur")}</span>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-white text-blue-800 text-[11px] px-2.5 py-1 rounded-md font-bold border border-blue-200 shadow-sm">Total: {totalSiswa} Siswa</span>
                                <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-md font-bold border border-emerald-200">Laki-laki: {totalL}</span>
                                <span className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-md font-bold border border-rose-200">Perempuan: {totalP}</span>
                            </div>
                        </div>
                    </div>
                    {showKepsekCard && (
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-sm mt-2">
                            <div className="shrink-0">
                                {kepsek?.profilePicture ? (
                                    <img src={kepsek.profilePicture} alt={kepsek.name} className="w-16 h-16 rounded-full object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold">
                                        {kepsek?.name ? kepsek.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase() : "KP"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Kepala Sekolah</p>
                                <p className="text-lg font-semibold text-gray-900 truncate max-w-xs">{kepsek?.name || "Belum ditetapkan"}</p>
                            </div>
                        </div>
                    )}
                </div>
                {isAdmin && (
                    <div className="flex flex-col items-start gap-2 md:items-end">
                        <label htmlFor="wk" className="text-sm font-semibold text-blue-800">Pilih Wali Kelas</label>
                        <select name="wk" id="wk" value={waliKelas?._id || ""} onChange={handleWaliKelasChange} disabled={loadingWali} className="border border-blue-200 bg-white text-blue-800 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm disabled:opacity-50 min-w-50">
                            <option value="">Kosongkan/Belum ada</option>
                            {allTeachers.filter(t => t.jabatanStruktural === "Guru Kelas").map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* --- FILTER & PENCARIAN --- */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                <div className="flex flex-col flex-1">
                    <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-1">Pencarian</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" id="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari Siswa..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-700" />
                    </div>
                </div>
                <div className="flex flex-col min-w-37.5">
                    <label htmlFor="filterKelas" className="block text-sm font-semibold text-gray-700 mb-1">Kelas</label>
                    <select id="filterKelas" value={filterKelas} onChange={(e) => setFilterKelas(Number(e.target.value))} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                </div>
                <div className="flex-1 max-w-xs">
                    <label htmlFor="filterRombel" className="block text-sm font-semibold text-gray-700 mb-1">Pilih Rombel</label>
                    <select id="filterRombel" value={filterRombel} onChange={(e) => setFilterRombel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {availableRombels.map(r => <option key={r} value={r}>Rombel {r}</option>)}
                    </select>
                </div>
            </div>

            {/* --- PANEL BULK UPDATE --- */}
            <AnimatePresence>
                {isAdmin && selectedIds.length > 0 && bulkStage === "idle" && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
                        <div className="flex items-center gap-2 text-indigo-900 font-medium">
                            <CheckSquare className="w-5 h-5 text-indigo-600"/>
                            <span>Terpilih <strong>{selectedIds.length}</strong> siswa untuk dipindahkan / naik kelas secara massal</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm">
                                <Layers className="w-4 h-4 text-indigo-500"/>
                                <select title="Pilih Kelas" value={bulkKelas} onChange={(e) => setBulkKelas(Number(e.target.value))} className="bg-transparent text-sm font-semibold text-indigo-900 focus:outline-none cursor-pointer">
                                    {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Ke Kelas {k}</option>)}
                                </select>
                                <span className="text-gray-300">|</span>
                                <select title="Pilih Rombel" value={bulkRombel} onChange={(e) => setBulkRombel(e.target.value)} className="bg-transparent text-sm font-semibold text-indigo-900 focus:outline-none cursor-pointer">
                                    {["A", "B", "C"].map(r => <option key={r} value={r}>Rombel {r}</option>)}
                                </select>
                            </div>
                            <button onClick={handleBulkUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow">
                                Proses Kenaikan
                            </button>
                            <button onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-2">
                                Batal
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TABEL DATA --- */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm w-full">
                {loading ? <div className="p-10 text-center text-gray-500 font-medium">Memuat data...</div> : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <table className="w-full text-left text-sm text-gray-600 min-w-200 whitespace-nowrap">
                        <thead className="bg-[#2735ff] border-b border-gray-200 text-white uppercase font-semibold">
                            <tr>
                                {isAdmin && (
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input type="checkbox" title="Pilih Semua" checked={students.length > 0 && selectedIds.length === students.length} onChange={handleSelectAll} className="w-4 h-4 accent-blue-500 rounded cursor-pointer" />
                                    </th>
                                )}
                                <th className="px-6 py-4 w-16">No</th>
                                <th className="px-6 py-4">NIS</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">Nama Siswa</th>
                                <th className="px-6 py-4 text-center">Kelas</th>
                                <th className="px-6 py-4 text-center">Rombel</th>
                                <th className="px-6 py-4 text-center">Ket (L/P)</th>
                                <th className="px-6 py-4">Status</th>
                                {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr><td colSpan={isAdmin ? 10 : 9} className="p-6 text-center text-gray-400">Tidak ada data siswa</td></tr>
                            ) : students.map((siswa, index) => (
                                <tr key={siswa._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    {isAdmin && (
                                        <td className="px-4 py-4 text-center">
                                            <input type="checkbox" title={`Pilih ${siswa.name}`} checked={selectedIds.includes(siswa._id)} onChange={() => handleSelectStudent(siswa._id)} className="w-4 h-4 accent-blue-600 rounded cursor-pointer" />
                                        </td>
                                    )}
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4 tabular-nums">{siswa.nis}</td>
                                    <td className="px-6 py-4 tabular-nums">{siswa.nisn || "-"}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{siswa.name}</td>
                                    <td className="px-6 py-4 text-center font-bold text-blue-600">{siswa.kelas}</td>
                                    <td className="px-6 py-4 text-center font-bold text-blue-600">{siswa.rombel}</td>
                                    <td className="px-6 py-4 text-center font-semibold">{siswa.gender}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${siswa.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {siswa.status.toUpperCase()}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 flex justify-center gap-3">
                                            <button onClick={() => handleOpenForm(siswa)} className="text-blue-600 hover:text-blue-800 transition-colors p-1"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteClick(siswa)} className="text-red-500 hover:text-red-700 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </motion.div>
                )}
            </div>

            {/* ============================================================================== */}
            {/* OVERLAYS ANIMASI KUSTOM (MENGGANTIKAN SEMUA SWEETALERT & MODAL LAMA)           */}
            {/* ============================================================================== */}
            
            {/* 1. OVERLAY FORM & ANIMASI SIMPAN (BUKU PENSIL -> JEMPOL) */}
            <AnimatePresence>
                {formStage !== "idle" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => formStage === "dialog" && setFormStage("idle")}
                        />
                        
                        <AnimatePresence mode="popLayout">
                            {/* STAGE A: DIALOG FORM */}
                            {formStage === "dialog" && (
                                <motion.div 
                                    key="dialog"
                                    layoutId="form-morph-wrapper"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
                                >
                                    <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">{editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</h2>
                                        <button onClick={() => setFormStage("idle")} className="text-gray-400 hover:text-rose-500 transition-colors p-1 rounded-md"><X className="w-5 h-5" /></button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="nis" className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                                                <input id="nis" type="text" value={formData.nis} onChange={(e) => setFormData({...formData, nis: e.target.value})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                                                <input id="nisn" type="text" value={formData.nisn} onChange={(e) => setFormData({...formData, nisn: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                            <input id="name" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                                <select id="gender" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                    <option value="L">Laki-laki (L)</option>
                                                    <option value="P">Perempuan (P)</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                <select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                    <option value="aktif">Aktif</option>
                                                    <option value="lulus">Lulus</option>
                                                    <option value="pindah">Pindah Sekolah</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                                            <p className="text-xs text-blue-800 mb-2 font-semibold">Penempatan Kelas Saat Ini</p>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-blue-700 mb-1">Tingkat Kelas</label>
                                                    <select 
                                                        value={formData.kelas} 
                                                        onChange={(e) => {
                                                            const newKelas = Number(e.target.value);
                                                            let newRombel = formData.rombel;

                                                            // Validasi otomatis: Jika ubah ke kelas 5/6 tapi rombel saat ini C, reset otomatis ke A
                                                            if (newKelas >= 5 && formData.rombel === "C") {
                                                                newRombel = "A";
                                                            }

                                                            setFormData({...formData, kelas: newKelas, rombel: newRombel});
                                                        }}
                                                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium">
                                                        {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-blue-700 mb-1">Grup Rombel</label>
                                                    <select value={formData.rombel} onChange={(e) => setFormData({...formData, rombel: e.target.value})} className="w-full border border-blue-300 rounded-lg px-3 py-2 text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium">
                                                        {(formData.kelas <= 4 ? ["A", "B", "C"] : ["A", "B"]).map(r => (
                                                            <option key={r} value={r}>Rombel {r}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                            <button type="button" onClick={() => setFormStage("idle")} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
                                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors">
                                                {editingId ? "Perbarui Data" : "Simpan Siswa"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* STAGE B: LOADING MENYIMPAN (Buku & Pensil) */}
                            {formStage === "loading" && (
                                <motion.div 
                                    key="loading"
                                    layoutId="form-morph-wrapper"
                                    className="bg-white w-64 h-64 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-6 relative z-10"
                                >
                                    <div className="w-32 h-24 relative mb-4 flex items-center justify-center">
                                        {/* Buku Geometris */}
                                        <div className="w-28 h-20 bg-slate-50 border-2 border-slate-200 rounded-sm relative flex shadow-inner">
                                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200 transform -translate-x-1/2 z-10" />
                                            <div className="w-1/2 h-full p-2 flex flex-col gap-1.5 justify-center items-end pr-3">
                                                <div className="w-full h-0.75 bg-slate-200 rounded-full" />
                                                <div className="w-4/5 h-0.75 bg-slate-200 rounded-full" />
                                                <div className="w-full h-0.75 bg-slate-200 rounded-full" />
                                            </div>
                                            <div className="w-1/2 h-full p-2 flex flex-col gap-1.5 justify-center items-start pl-3 relative">
                                                <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" viewBox="0 0 50 50">
                                                    <motion.path d="M 5,15 Q 15,12 25,18 T 45,15 M 5,27 Q 20,24 35,30" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"
                                                        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Pensil Geometris */}
                                        <motion.div className="absolute w-4 h-12 origin-bottom-left z-20" style={{ top: 10, left: 60 }}
                                            animate={{ x: [0, 15, -5, 20, 0], y: [0, 5, -2, 8, 0], rotate: [25, 30, 20, 35, 25] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <div className="w-full h-8 bg-amber-400 rounded-t-sm border-x border-t border-amber-600 relative">
                                                <div className="absolute -top-2 left-0 right-0 h-2 bg-rose-400 rounded-t-sm border-t border-x border-rose-500" />
                                            </div>
                                            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-amber-200 relative" style={{ content: "''" }}>
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-slate-800" />
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 tracking-wide animate-pulse">Menyimpan Data...</span>
                                    <span className="text-xs text-slate-400 mt-1">Sinkronisasi Database</span>
                                </motion.div>
                            )}

                            {/* STAGE C: TOAST SUKSES/GAGAL (Jempol) */}
                            {formStage === "toast" && (
                                <motion.div 
                                    key="toast"
                                    layoutId="form-morph-wrapper"
                                    className={`flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl shadow-2xl text-white relative z-10  text-center ${formStatus === "success" ? "bg-blue-600 w-80" : "bg-rose-600 w-96"}`}
                                >
                                    {formStatus === "success" ? (
                                        <>
                                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner">
                                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <motion.path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Berhasil Disimpan</h3>
                                                <p className="text-blue-100 text-xs">Data siswa telah terdaftar di sistem.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div animate={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }} className="bg-white/20 p-4 rounded-full border border-white/30 shrink-0">
                                                <AlertCircle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div className="flex flex-col items-center text-center">
                                                <h3 className="text-xl font-bold mb-2">Gagal Menyimpan</h3>
                                                <p className="text-rose-100 text-sm max-w-70 leading-relaxed bg-rose-700/50 p-2 rounded-lg border border-rose-500/50">{formErrorMessage}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. OVERLAY HAPUS DATA (DIALOG -> TONG SAMPAH -> TOAST) */}
            <AnimatePresence>
                {deleteStage !== "idle" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => deleteStage === "dialog" && setDeleteStage("idle")} />
                        
                        <AnimatePresence mode="wait">
                            {/* STAGE A: DIALOG HAPUS */}
                            {deleteStage === "dialog" && (
                                <motion.div key="dialog-delete" layoutId="delete-morph" className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-3 w-80 relative z-10">
                                    <div className="flex items-center gap-3 text-rose-600 mb-2">
                                        <div className="p-3 bg-rose-50 rounded-full border border-rose-100"><Trash2 className="w-6 h-6" /></div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">Hapus Data <br/><span className="text-rose-600 truncate block max-w-37.5">{studentToDelete?.name}</span></h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">Tindakan ini permanen dan tidak dapat dibatalkan. Yakin ingin membuang data ini?</p>
                                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
                                        <button onClick={() => setDeleteStage("idle")} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Batal</button>
                                        <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm">Ya, Hapus</button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STAGE B & C: TONG SAMPAH JATUH & DIAMBIL LENGAN */}
                            {(deleteStage === "loading" || deleteStage === "taking") && (
                                <motion.div key="anim-delete" layoutId="delete-morph" className="bg-white w-72 h-64 rounded-2xl shadow-2xl overflow-hidden relative flex items-center justify-center z-10 border border-slate-100">
                                    <motion.div className="relative flex flex-col items-center justify-end w-32 h-40"
                                        animate={deleteStage === "taking" ? { x: 300 } : { x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: "easeIn" }}
                                    >
                                        {/* Tutup Tong */}
                                        <motion.div className="w-24 h-3 bg-slate-700 rounded-t-md relative z-20 origin-bottom-left"
                                            animate={deleteStage === "taking" ? { rotate: 0, y: 0 } : { rotate: -65, y: -10, x: -10 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        >
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-slate-600 rounded-t-sm" />
                                        </motion.div>
                                        {/* Badan Tong */}
                                        <div className="w-20 h-24 bg-slate-800 rounded-b-xl relative z-20 flex justify-center gap-2 pt-3 shadow-inner">
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                        </div>

                                        {/* Sampah Geometris Jatuh */}
                                        {deleteStage === "loading" && (
                                            <div className="absolute inset-0 z-10 flex justify-center overflow-hidden">
                                                {shapes.map((Shape, index) => (
                                                    <motion.div key={index} className="absolute"
                                                        initial={{ y: -100, opacity: 0, rotate: 0, scale: 0.5 }}
                                                        animate={{ y: [ -80, 20, 80 ], opacity: [0, 1, 0], rotate: [0, 180, 360], scale: [0.5, 1, 0.8] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
                                                    >
                                                        {Shape}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Lengan Mengambil */}
                                        {deleteStage === "taking" && (
                                            <motion.div className="absolute top-10 flex items-center z-30"
                                                initial={{ x: -200 }} animate={{ x: -45 }} transition={{ type: "spring", stiffness: 100, damping: 12 }}
                                            >
                                                <div className="w-48 h-8 bg-amber-200 rounded-l-full shadow-sm" />
                                                <div className="w-10 h-14 bg-amber-300 rounded-full -ml-4 border-r-4 border-amber-400/50" />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                    <motion.div className="absolute bottom-6 text-xs font-bold tracking-widest text-slate-400 uppercase" animate={deleteStage === "taking" ? { opacity: 0 } : { opacity: 1 }}>
                                        {deleteStage === "loading" ? "Membuang Data..." : ""}
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* STAGE D: TOAST HAPUS */}
                            {deleteStage === "toast" && (
                                <motion.div key="toast-delete" layoutId="delete-morph" className="flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white relative z-10 w-80 bg-slate-800 border border-slate-700">
                                    {deleteStatus === "success" ? (
                                        <>
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                                <Trash2 className="w-8 h-8 text-rose-400" />
                                            </motion.div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Data Terhapus</span>
                                                <span className="text-slate-400 text-xs">Arsip siswa telah dibersihkan.</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-8 h-8 text-rose-500" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Gagal Menghapus</span>
                                                <span className="text-slate-400 text-xs">Terdapat kendala pada server.</span>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

            {/* 3. OVERLAY MASSAL (BULK) SEDERHANA */}
            <AnimatePresence>
                {bulkStage !== "idle" && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col items-center text-center max-w-xs">
                            {bulkStage === "loading" ? (
                                <>
                                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">Memproses Kenaikan...</h3>
                                    <p className="text-xs text-gray-500 mt-1">Menggeser rombel siswa yang dipilih</p>
                                </>
                            ) : (
                                <>
                                    {bulkStatus === "success" ? <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" /> : <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />}
                                    <h3 className="text-lg font-bold text-gray-900">{bulkStatus === "success" ? "Proses Selesai!" : "Terjadi Kesalahan"}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{bulkStatus === "success" ? "Data kelas massal berhasil diperbarui." : "Gagal memproses tindakan massal."}</p>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}