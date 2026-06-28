/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getStudentsFiltered, addStudents, updateStudents, deleteStudent, searchStudents, getTeacher, getWaliKelas, setWaliKelas, getKepsek } from "@/components/lib/actions";
import { PlusCircle, Edit, Trash2, X, Search, UserIcon, CheckSquare, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Swal from "sweetalert2";

export default function SiswaPage() {
    const {data: session} = useSession();
    const [students, setStudents] = useState<any[]>([]);
    const [filterKelas, setFilterKelas] = useState<number>(1);
    const [filterRombel, setFilterRombel] = useState<string>("A");
    const [kepsek, setKepsek] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const availableRombels = (filterKelas <= 4) ? ["A", "B", "C"] : ["A", "B"];
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
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
            const delaySearch = setTimeout(() => {
                loadData();
            }, 500);
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

    const handleOpenModal = (siswa: any = null) => {
        if(siswa) {
            setEditingId(siswa._id);
            setFormData({
                nis: siswa.nis, 
                nisn: siswa.nisn || "",
                name: siswa.name,
                gender: siswa.gender || "L",
                kelas: siswa.kelas,
                rombel: siswa.rombel,
                status: siswa.status,
            });
        } else {
            setEditingId(null);
            setFormData({nis: "", nisn: "", name: "", gender: "L", kelas: filterKelas, rombel: filterRombel, status: "aktif"});
        }
        setShowModal(true);
    };

    const handleSelectStudent = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if(selectedIds.length === students.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(students.map(s => s._id));
        }
    };

    const handleBulkUpdate = async() => {
        if(selectedIds.length === 0) return;
        const result = await Swal.fire({
            title: "Proses Kenaikan Kelas Massal?",
            text: `Apakah Anda yakin ingin memindahkan ${selectedIds.length} siswa terpilih ke Kelas ${bulkKelas} - ${bulkRombel}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Ya, Pindahkan!",
            cancelButtonText: "Batal"
        });

        if(result.isConfirmed) {
            Swal.fire({
                title: 'Memproses Pemindahan...',
                text: 'Mohon tunggu sampai semua data berhasil diperbarui.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                for(const id of selectedIds) {
                    const currentStudent = students.find(s => s._id === id);
                    if(currentStudent) {
                        const updatedData = {
                            nis: currentStudent.nis,
                            nisn: currentStudent.nisn || "",
                            name: currentStudent.name,
                            gender: currentStudent.gender || "L",
                            status: currentStudent.status,
                            kelas: bulkKelas,     // Menggunakan nilai kelas baru
                            rombel: bulkRombel,   // Menggunakan nilai rombel baru
                        };
                        await updateStudents(id, updatedData);
                    }
                }
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                setStudents(data);
                setSelectedIds([]);
                await Swal.fire({
                    title: 'Berhasil!',
                    text: 'Kenaikan/pemindahan kelas massal berhasil diproses.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    timer: 2000,
                    timerProgressBar: true
                });
            } catch(error) {
                console.error("Gagal melakukan aksi massal:", error);
                await Swal.fire({
                    title: 'Terjadi Kesalahan!',
                    text: 'Gagal memperbarui beberapa data siswa. Silakan periksa kembali data Anda.',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6'
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        Swal.fire({
            title: editingId ? 'Memperbarui Data Siswa...' : 'Menambahkan Data Siswa...',
            text: 'Mohon tunggu sebentar.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            const res = editingId ? await updateStudents(editingId, formData) : await addStudents(formData);
            if(res.error) {
                await Swal.fire({
                    title: 'Gagal Menyimpan!',
                    text: "Error: " + res.error,
                    icon: 'error',
                    confirmButtonColor: '#3b82f6', // Menyesuaikan warna utama UI Anda
                    showClass: {
                        popup: 'animate__animated animate__shakeX' // Efek bergetar saat gagal
                    }
                });
            } else {
                setShowModal(false);
                // Refresh the student list
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                setStudents(data);
                await Swal.fire({
                    title: 'Berhasil!',
                    text: editingId ? 'Data siswa berhasil diperbarui.' : 'Data siswa berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    timer: 2000, // Menutup otomatis dalam 2 detik
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__bounceIn' // Efek bounce masuk yang mulus
                    }
                });
            }
        } catch(error) {
            console.error("Gagal memproses data siswa:", error);
            await Swal.fire({
                title: 'Terjadi Kesalahan!',
                text: 'Gagal terhubung ke server. Silakan periksa koneksi internet Anda.',
                icon: 'error',
                confirmButtonColor: '#3b82f6',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                }
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus data siswa?",
            text: `Apakah anda yakin ingin menghapus data "${name}"? Tindakan ini tidak dapat dibatalkan!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#3b82f6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
            background: "#ffffff",
            customClass: {
                popup: "rounded-xl",
            },
            showClass: {
                popup: 'animate__animated animate__fadeInDown animate__faster',
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp animate__faster',
            },
        });
        if(result.isConfirmed) {
            setLoading(true);
            Swal.fire({
                title: "Memproses...",
                text: "Tunggu sebentar",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const res = await deleteStudent(id);
            if(res.error) {
                await Swal.fire({
                    title: "Gagal menghapus!",
                    text: "Error: " + res.error,
                    icon: "error",
                    confirmButtonColor: "#3b82f6",
                    showClass: {
                        popup: 'animate__animated animate__shakeX'
                    },
                });
            } else {
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                setStudents(data);
                await Swal.fire({
                    title: "Berhasil!",
                    text: `Data siswa "${name}" berhasil dihapus`,
                    icon: "success",
                    confirmButtonColor: "#3b82f6",
                    timer: 2000,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__bounceIn'
                    }
                });
            }
            setLoading(false);
        }
    }

    const totalL = students.filter((s: any) => s.gender === "L").length;
    const totalP = students.filter((s: any) => s.gender === "P").length;
    const totalSiswa = students.length;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data siswa di sekolah SDN 0SERUA 02</p>
                </div>
                {isAdmin && (
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" title="plus">
                        <PlusCircle className="w-5 h-5">Tambah Siswa</PlusCircle>
                    </button>
                )}
                </div>
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-sm mt-1">
                                    <UserIcon className="w-5 h-5"></UserIcon>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">Informasi Kelas</h4>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Wali Kelas {filterKelas} {filterRombel} : <span className="font-bold text-blue-700 ml-1">{loadingWali ? "Memuat..." : (waliKelas ? waliKelas.name : "Belum Diatur")}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-white text-blue-800 text-[11px] px-2.5 py-1 rounded-md font-bold border border-blue-200 shadow-sm">Total: {totalSiswa} Siswa</span>
                                        <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-md font-bold border border-emerald-200">Laki-laki: {totalL}</span>
                                        <span className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-md font-bold border border-rose-200">Perempuan: {totalP}</span>
                                    </div>
                                </div>
                            </div>
                            {showKepsekCard && (
                                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-sm">
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
                                <select name="wk" id="wk" title="Pilih wali kelas" value={waliKelas?._id || ""} onChange={handleWaliKelasChange} disabled={loadingWali} className="border border-blue-200 bg-white text-blue-800 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm disabled:opacity-50 min-w-50">
                                    <option value="">Kosongkan/Belum ada</option>
                                    {allTeachers.filter(t => t.jabatanStruktural === "Guru Kelas").map(t => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                <div className="flex flex-col flex-1">
                    <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-1"></label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></Search>
                        <input type="text" id="search" title="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari Siswa..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-700" />
                    </div>
                </div>
                <div className="flex flex-col min-w-37.5">
                    <label htmlFor="filterKelas" className="block text-sm font-semibold text-gray-700 mb-1">
                        Kelas
                    </label>
                    <select id="filterKelas" value={filterKelas} onChange={(e) => setFilterKelas(Number(e.target.value))} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                </div>
                <div className="flex-1 max-w-xs">
                    <label htmlFor="filterRombel" className="block text-sm font-semibold text-gray-700 mb-1">Pilih Rombel</label>
                    <select name="rombel" id="filterRombel" value={filterRombel} onChange={(e) => setFilterRombel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {availableRombels.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>
            <AnimatePresence>
                {isAdmin && selectedIds.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
                        <div className="flex items-center gap-2 text-indigo-900 font-medium">
                            <CheckSquare className="w-5 h-5 text-indigo-600"/>
                            <span>Terpilih <strong>{selectedIds.length}</strong> siswa untuk dipindahkan / naik kelas secara massal</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm">
                                <Layers className="w-4 h-4 text-indigo-500"/>
                                <select title="Pilih Kelas Tujuan Massal" value={bulkKelas} onChange={(e) => setBulkKelas(Number(e.target.value))} className="bg-transparent text-sm font-semibold text-indigo-900 focus:outline-none cursor-pointer">
                                    {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Ke Kelas {k}</option>)}
                                </select>
                                <span className="text-gray-300">|</span>
                                <select title="Pilih Rombel Tujuan Massal" value={bulkRombel} onChange={(e) => setBulkRombel(e.target.value)} className="bg-transparent text-sm font-semibold text-indigo-900 focus:outline-none cursor-pointer">
                                    {["A", "B", "C"].map(r => <option key={r} value={r}>Rombel {r}</option>)}
                                </select>
                            </div>
                            <button onClick={handleBulkUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow">
                                Proses
                            </button>
                            <button onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-2">
                                Batal
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm w-full">
                {loading ? <div className="p-10 text-center">Memuat data...</div> : (
                    <motion.div initial={{
                        opacity: 0,
                        y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.25,
                        }}>
                    <table className="w-full text-left text-sm text-gray-600 min-w-200 whitespace-nowrap">
                        <thead className="bg-[#2735ff] border-b border-gray-200 text-white uppercase font-semibold">
                            <tr>
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
                                        <span className={`px-2 py-1 text-xs rounded-full ${siswa.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {siswa.status.toUpperCase()}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 flex justify-center gap-3">
                                            <button title="edit" onClick={() => handleOpenModal(siswa)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4"></Edit></button>
                                            <button type="button" title="trash" onClick={() => handleDelete(siswa._id, siswa.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"></Trash2></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </motion.div>
                )}
            </div>
            <AnimatePresence>
            {showModal && (
                <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingId ? "Edit" : "Tambah Siswa"}</h2>
                            <button title="cancel" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"></X></button>
                        </div>
                        <form action="" onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="nis" className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                                    <input id="nis" type="text" value={formData.nis} onChange={(e) => setFormData({...formData, nis: e.target.value})} required className="w-full border p-2 rounded-lg" />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                                    <input id="nisn" type="text" value={formData.nisn} onChange={(e) => setFormData({...formData, nisn: e.target.value})} className="w-full border p-2 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input id="name" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full border p-2 rounded-lg" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select title="gender" name="" id="" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full border p-2 rounded-lg">
                                        <option value="L">Laki-laki (L)</option>
                                        <option value="P">Perempuan (P)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select title="status" name="" id="" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded-lg">
                                        <option value="Aktif">Aktif</option>
                                        <option value="Lulus">Lulus</option>
                                        <option value="Pindah">Pindah Sekolah</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                <p className="text-xs text-blue-800 mb-2 font-medium">Penempatan kelas (Ubah disini untuk menaikan kelas)</p>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="kelas" className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                                        <select className="w-full border border-blue-500 rounded-lg px-3 py-2 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="kelas" name="kelas" id="kelas" value={formData.kelas} onChange={(e) => setFormData({...formData, kelas: Number(e.target.value)})}>
                                            {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="rombel" className="block text-sm font-medium text-gray-700 mb-1">Rombel</label>
                                        <select title="rombel" name="rombel" id="rombel" value={formData.rombel} onChange={(e) => setFormData({...formData, rombel: e.target.value})} className="w-full border border-blue-500 rounded-lg px-3 py-2 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                            {["A", "B", "C"].map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button title="batal" type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                <button title="submit" type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan data</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}