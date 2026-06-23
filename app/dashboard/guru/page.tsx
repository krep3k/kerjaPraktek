/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getTeacher, saveTeacher, deleteTeacher } from "@/components/lib/actions";
import { User as UserIcon, Pencil, Trash2, X, PlusCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Swal from "sweetalert2";

interface Teacher {
    _id: string;
    name: string;
    email: string;
    status: string;
    profilePicture?: string;
    idGuru?: string;
    nip?: string;
    nuptk?: string;
    jenisKelamin?: string;
    noTelp?: string;
    pendidikan?: string;
    statusKepegawaian?: string;
}

export default function DataGuruPage() {
    const {data: session} = useSession();
    const userRole = (session?.user as any)?.role;
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [photoBase64, setPhotoBase64] = useState("");
    const [loading, setLoading] = useState(false);
    const [viewingTeacher, setViewingTeacher] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const formFieldClass = "w-full border border-slate-300 bg-white text-slate-900 rounded-xl px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const formFieldSelectClass = `${formFieldClass} cursor-pointer`;
    
    useEffect(() => {
        const loadTeachers = async() => {
            setTeachers(await getTeacher());
        };
        loadTeachers();
    }, []);

    const handleEdit = (teacher:any) => {
        setSelectedTeacher(teacher);
        setPhotoBase64(teacher.profilePicture || "");
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedTeacher(null);
        setPhotoBase64("");
        setModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus data guru?",
            text: `Apakah anda yakin ingin menghapus data guru "${name}"? Tindakan ini tidak bisa dibatalkan!`,
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
                text: "Mohon tunggu sebentar",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            const res = await deleteTeacher(id);
            if(res.error) {
                await Swal.fire({
                    title: "Gagal menghapus!",
                    text: res.error,
                    icon: "error",
                    confirmButtonColor: "#3b82f6",
                    showClass: {
                        popup: 'animate__animated animate__shakeX',
                    },
                });
            } else {
                const freshTeacher = await getTeacher();
                setTeachers(freshTeacher);
                await Swal.fire({
                    title: "Berhasil!",
                    text: `Data guru "${name}" berhasil dihapus`,
                    icon: "success",
                    confirmButtonColor: "#3b82f6",
                    timer: 2000,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__bounceIn',
                    }
                });
            }
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleProfileClick = (teacher: Teacher) => {
        if (teacher.profilePicture) {
            setViewingTeacher(teacher);
        } else {
            alert("Tidak ada foto profile");
        }
    };

    const handleDetailPhotoClick = () => {
        if (viewingTeacher?.profilePicture) {
            setPreviewImage(viewingTeacher.profilePicture);
        } else {
            alert("Tidak ada foto profile");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSubmit = new FormData(e.currentTarget);
            const result = await saveTeacher(formDataToSubmit);
            if(result.error) {
                alert("Gagal menyimpan data " + result.error);
            } else {
                setModalOpen(false);
                const freshTeacher = await getTeacher();
                setTeachers(freshTeacher);
            }
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Data Guru</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola akun dan profile guru yang terhormat</p>
                </div>
                {userRole === "admin" && (
                    <button title="modalOpen" onClick={handleAddNew} className="flex items-center justify-center gap-2.5 bg-[#0f2bff] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-[#1518c7] hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 ease-in-out active:scale-95">
                        <PlusCircle color="currentColor" size={22} strokeWidth={2.5}/>
                    </button>
                )}
            </div>
            <div className="bg-card border border-border rounded-xl overflow-x-auto shadow-sm w-full">
                <table className="w-full text-left text-sm text-muted-foreground min-w-200">
                    <thead className="bg-[#353fff] border-b border-border text-white uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Profil</th>
                            <th className="px-6 py-4">Id</th>
                            <th className="px-6 py-4">Nama Lengkap</th>
                            <th className="px-6 py-4">Status</th>
                            {userRole === "admin" && (
                                <th className="px-6 py-4 text-center">Aksi</th>
                            )}
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t._id} className="border-b border-border hover:bg-muted">
                                <td className="px-6 py-4">
                                    <button type="button" onClick={() => handleProfileClick(t)} className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-border transition hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                        {t.profilePicture ? (
                                            <Image src={t.profilePicture} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" unoptimized />
                                        ) : (
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">
                                                {getInitials(t.name)}
                                            </div>
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-foreground">{t.idGuru ? t.idGuru : "-"}</td>
                                <td className="px-6 py-4 font-medium text-foreground">{t.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${t.status === "aktif" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                                        {t.status === "aktif" ? (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif</>
                                        ) : (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Nonaktif</>
                                        )}
                                    </span>
                                </td>
                                {userRole === "admin" && (
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button title="edit" onClick={() => handleEdit(t)} className="p-2 text-white hover:text-primary bg-[#223cff] hover:bg-[#5e66ff] rounded-lg transition">
                                                <Pencil className="wa-4 h-4"></Pencil>
                                            </button>
                                            <button title="delete" onClick={() => handleDelete(t._id, t.name)} className="p-2 text-white hover:text-destructive bg-[#ff2929] hover:bg-[#ff4b4b] rounded-lg transition">
                                                <Trash2 className="h-4 w-4"></Trash2>
                                            </button>
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 flex items-center justify-center gap-3">
                                    <button onClick={() => setViewingTeacher(t)} className="p-2 text-white bg-[#cd3fd0] hover:bg-[#d999d6] rounded-lg transition tooltip" title="Lihat Detail">
                                        <Eye className="w-5 h-5"></Eye>
                                    </button>
                                </td>
                                <AnimatePresence>
                                {viewingTeacher && (
                                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <motion.div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                                            <div className="bg-linear-to-r from-primary bg-[#2036ff] to-primary-foreground/80 p-6 flex justify-between items-center text-white">
                                                <div className="flex items-center gap-4">
                                                    <button type="button" onClick={handleDetailPhotoClick} className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-card shadow-md flex items-center justify-center transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400">
                                                        {viewingTeacher.profilePicture ? (
                                                            <Image src={viewingTeacher.profilePicture} alt="Profile" width={64} height={64} className="w-16 h-16 rounded-full object-cover" unoptimized />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center text-card-foreground text-2xl font-bold border-2 border-card/50">
                                                                {viewingTeacher.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-full"></span>
                                                    </button>
                                                    <div>
                                                        <h2 className="text-xl font-bold">{viewingTeacher.name}</h2>
                                                        <p className="text-primary-foreground/80 text-sm font-medium">{viewingTeacher.jabatan || "Guru"}  {viewingTeacher.idGuru || "-"}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setViewingTeacher(null)} className="p-2 hover:bg-card/20 rounded-full transition" title="X"><X className="w-6 h-6"></X></button>
                                            </div>
                                            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm bg-[#ffffff]">
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-foreground border-b pb-2 text-base">Profile Guru</h3>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <span className="text-muted-foreground">TTL</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.tempatLahir || "-"}, {viewingTeacher.tanggalLahir}</span>
                                                        <span className="text-muted-foreground">Gender</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.jenisKelamin || "-"}</span>
                                                        <span className="text-muted-foreground">No. WhatsApp</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.noTelp || "-"}</span>
                                                        <span className="text-muted-foreground">Pendidikan Terakhir</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher?.pendidikan || "-"}</span>
                                                        <span className="text-muted-foreground">Email Akun</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.email || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-foreground border-b pb-2 text-base">Data Kedinasan</h3>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <span className="text-muted-foreground">Status Pegawai</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: <span className="bg-success/10 text-success px-2 py-0.5 rounded-md">{viewingTeacher.statusKepegawaian || "-"}</span></span>
                                                        <span className="text-muted-foreground">Golongan/Ruang</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.golongan || "-"}</span>
                                                        <span className="text-muted-foreground">Jabatan Struktural</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.jabatanStruktural || "-"}</span>
                                                        {viewingTeacher.jabatanStruktural === "Guru Kelas" && (
                                                            <>
                                                                <span className="text-muted-foreground">Mengampu kelas</span>
                                                                <span className="col-span-2 font-semibold text-primary">: {viewingTeacher.kelas} {viewingTeacher.rombel}</span>
                                                            </>
                                                        )}
                                                        {viewingTeacher.jabatanStruktural === "Guru Mapel" && (
                                                            <>
                                                                <span className="text-muted-foreground">Mata Pelajaran</span>
                                                                <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.mataPelajaran || "-"}</span>
                                                            </>
                                                        )}
                                                        <span className="text-muted-foreground">Jabatan Fungsional</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.jabatanFungsional || "-"}</span>
                                                        <span className="text-muted-foreground">TMT Mengajar</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.tmtMengajar || "-"}</span>
                                                        <span className="text-muted-foreground">NIP</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.nip || "-"}</span>
                                                        <span className="text-muted-foreground">NUPTK</span>
                                                        <span className="col-span-2 font-semibold text-foreground">: {viewingTeacher.nuptk || "-"}</span>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-4 pt-2">
                                                    <h3 className="font-bold text-foreground border-b pb-2 text-base">Alamat Domisili</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-muted-foreground text-xs mb-1">Alamat Jalan</p>
                                                            <p className="font-semibold text-foreground">{viewingTeacher.alamatLengkap || "-"}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-muted-foreground text-xs mb-1">Desa/Kelurahan</p>
                                                                <p className="font-semibold text-foreground">{viewingTeacher.desa || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground text-xs mb-1">Kecamatan</p>
                                                                <p className="font-semibold text-foreground">{viewingTeacher.kecamatan || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground text-xs mb-1">Kabupaten/Kota</p>
                                                                <p className="font-semibold text-foreground">{viewingTeacher.kabupaten || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground text-xs mb-1">Provinsi</p>
                                                                <p className="font-semibold text-foreground">{viewingTeacher.provinsi}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                        <AnimatePresence>
                                            {previewImage && (
                                                <motion.div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                                    <motion.div className="relative bg-card rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}>
                                                        <button title="previewImage" type="button" onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-slate-900 shadow-sm hover:bg-white transition">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                        <Image src={previewImage} alt="Preview Foto Guru" className="w-full max-h-[80vh] object-contain bg-black" />
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">Belum ada guru</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AnimatePresence>
            {isModalOpen && (
                <motion.div className="fixed inset-0 bg-/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <motion.div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full p-6 border border-border max-h-[85vh] overflow-y-auto relative" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                        <button title="X" onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted transition">
                            <X className="w-4 h-4"></X>
                        </button>
                        <h2 className="text-xl font-bold text-foreground mb-6">{selectedTeacher ? "Edit Pofile Guru" : "Tambah Akun Guru Baru"}</h2>
                        <form action="" onSubmit={handleSubmit} key={selectedTeacher?._id || "new"} className="flex flex-col max-h-[85vh]">
                            <label htmlFor="hidden"></label>
                            <input type="hidden" name="id" value={selectedTeacher?._id || ""} />
                            <input type="hidden" name="profilePicture" value={photoBase64 || ""} />
                            <div className="overflow-y-auto pr-2 space-y-6 pb-6 custom-scrollbar">
                                <div className="bg-accent/30 bg-gray-100 p-5 rounded-2xl border border-accent shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
                                    <h3 className="font-bold text-primary border-b border-accent pb-2 mb-4 flex items-center gap-2">Profile</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                                            <div className="flex-none">
                                                {photoBase64 ? (
                                                    <Image src={photoBase64} alt="Preview" width={80} height={80} className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm" unoptimized />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center border border-dashed border-blue-200">
                                                        <UserIcon className="w-8 h-8"/>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">Foto Profil Guru</p>
                                                <p className="text-xs text-slate-500 mb-3">Unggah foto JPG/PNG agar mudah dikenali. Maks. 2MB.</p>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
                                                    <label htmlFor="pp" className="inline-flex items-center justify-center rounded-xl border border-blue-300 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer">
                                                        Pilih Foto
                                                    </label>
                                                    {photoBase64 && <span className="text-xs text-slate-500">Foto sudah dipilih</span>}
                                                </div>
                                                <input id="pp" name="pp" title="pp" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="name" className="block text-xs font-bold text-muted-foreground uppercase mb-1">Nama Lengkap</label>
                                            <input type="text" name="name" id="name" defaultValue={selectedTeacher?.name || ""} required className={formFieldClass} placeholder="Contoh: Budi Santoso, S.Pd" />
                                        </div>
                                        <div>
                                            <label htmlFor="idGuru" className="block text-xs font-bold text-muted-foreground uppercase mb-1">Id Guru</label>
                                            <input type="text" id="idGuru" name="idGuru" defaultValue={selectedTeacher?.idGuru || ""} required className={`${formFieldClass} font-mono`} placeholder="ID.2024..." />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                            <input type="email" name="email" id="email" defaultValue={selectedTeacher?.email || ""} required className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                            <input type="password" name="password" id="password" required={!selectedTeacher} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="role" className="block text-sm font-bold text-slate-700">Role</label>
                                            <select name="role" id="role" required className={formFieldSelectClass}>
                                                <option value="guru">Guru</option>
                                                <option value="kepsek">Kepala Sekolah</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-100 p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
                                    <h3 className="font-bold text-amber-800 border-b border-amber-100 pb-2 mb-4 flex items-center gap-2">Data Pribadi</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="tempatLahir" className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempat Lahir</label>
                                            <input type="text" id="tempatLahir" name="tempatLahir" defaultValue={selectedTeacher?.tempatLahir || ""} className={formFieldClass} placeholder="Kota/Kabupaten" />
                                        </div>
                                        <div>
                                            <label htmlFor="tanggalLahir" className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Lahir</label>
                                            <input type="date" id="tanggalLahir" name="tanggalLahir" defaultValue={selectedTeacher?.tanggalLahir || ""} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="gender" className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                            <select name="jenisKelamin" id="gender" defaultValue={selectedTeacher?.jenisKelamin || ""} className={formFieldSelectClass}>
                                                <option value="Laki-laki">Laki-laki</option>
                                                <option value="Perempuan">Perempuan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="wa" className="block text-xs font-bold text-slate-500 uppercase mb-1">No. WhatsApp</label>
                                            <input type="text" id="wa" name="noTelp" defaultValue={selectedTeacher?.noTelp || ""} className={formFieldClass} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-100 p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500"></div>
                                    <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2 mb-4 flex items-center gap-2">Data Kedinasan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="statusPegawai" className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Kepegawaian</label>
                                            <select name="statusKepegawaian" id="statusPegawai" defaultValue={selectedTeacher?.statusKepegawaian || "PNS"} className={formFieldSelectClass}>
                                                {["PNS", "PPPK", "GTY", "Honorer"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="golongan" className="block text-xs font-bold text-slate-500 uppercase mb-1">Golongan/Ruang</label>
                                            <select name="golongan" id="golongan" defaultValue={selectedTeacher?.golongan || ""} className={formFieldSelectClass}>
                                                <option value="">-- Non PNS / Kosong --</option>
                                                {["I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"].map(gol => (
                                                    <option value={gol} key={gol}>{gol}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="jabatanStruktural" className="block text-xs font-bold text-slate-500 uppercase mb-1">Jabatan Struktural</label>
                                            <select name="jabatanStruktural" id="jabatanStruktural" defaultValue={selectedTeacher?.jabatanStruktural || "Guru Kelas"} onChange={(e) => {
                                                if(e.target.value !== "Guru Mapel") {
                                                    const mapelDropdown = document.getElementById("mataPelajaran") as HTMLSelectElement;
                                                    if(mapelDropdown) mapelDropdown.value = "";
                                                }
                                                if(e.target.value !== "Guru Kelas") {
                                                    const kls = document.getElementsByName("kelas")[0] as HTMLSelectElement;
                                                    const rmb = document.getElementsByName("rombel")[0] as HTMLSelectElement;
                                                    if(kls) kls.value = "";
                                                    if(rmb) rmb.value = "";
                                                }}} className={formFieldSelectClass}>
                                                {["Guru Kelas", "Guru Mapel", "Guru Ekskul", "Kepala Sekolah"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="jabatanFungsional" className="block text-xs font-bold text-slate-500 uppercase mb-1">Jabatan Fungsional</label>
                                            <select name="jabatanFungsional" id="jabatanFungsional" defaultValue={selectedTeacher?.jabatanFungsional || "Guru Pertama"} className={formFieldSelectClass}>
                                                {["Guru Pertama", "Guru Muda", "Guru Madya", "Guru Utama"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="mataPelajaran" className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                                            <select name="mataPelajaran" id="mataPelajaran" defaultValue={selectedTeacher?.mataPelajaran || ""} className={formFieldSelectClass}>
                                                <option value="">-- Guru Kelas (Kosongkan) --</option>
                                                <option value="PAI">Pendidikan Agama Islam (PAI)</option>
                                                <option value="PJOK">PJOK</option>
                                                <option value="BTQ">BTQ</option>
                                                <option value="TIK">TIK</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <label htmlFor="kelas" className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas yang diampu</label>
                                                <select name="kelas" id="kelas" defaultValue={selectedTeacher?.kelas || ""} className={formFieldSelectClass}>
                                                    <option value="">--Pilih Kelas--</option>
                                                    {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="rombel" className="block text-xs font-bold text-slate-500 uppercase mb-1">Rombel</label>
                                                <select name="rombel" id="rombel" defaultValue={selectedTeacher?.rombel || ""} className={formFieldSelectClass}>
                                                    <option value="">--Pilih Rombel--</option>
                                                    {["A", "B", "C"].map(r => <option key={r} value={r}>Rombel {r}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="tmtMengajar" className="block text-xs font-bold text-slate-500 uppercase mb-1">TMT Mengajar</label>
                                            <input type="date" id="tmtMengajar" name="tmtMengajar" defaultValue={selectedTeacher?.tmtMengajar || ""} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="nip" className="block text-xs font-bold text-slate-500 uppercase mb-1">NIP</label>
                                            <input type="text" id="nip" name="nip" defaultValue={selectedTeacher?.nip || ""} className={`${formFieldClass} font-mono`} />
                                        </div>
                                        <div>
                                            <label htmlFor="nuptk" className="block text-xs font-bold text-slate-500 uppercase mb-1">NUPTK</label>
                                            <input type="text" id="nuptk" name="nuptk" defaultValue={selectedTeacher?.nuptk || ""} className={`${formFieldClass} font-mono`} />
                                        </div>
                                        <div>
                                            <label htmlFor="pend" className="block text-xs font-bold text-slate-500 uppercase mb-1">Pendidikan Terakhir</label>
                                            <select name="pendidikan" id="pend" defaultValue={selectedTeacher?.pendidikan || "S1"} className={formFieldSelectClass}>
                                                {["SMA/SMK", "D3", "S1", "S2", "S3"].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="status" className="block text-xs font-bold text-emerald-600 uppercase mb-1">Status</label>
                                            <select name="status" id="status" defaultValue={selectedTeacher?.status || "aktif"} className={formFieldSelectClass}>
                                                <option value="aktif">🟢 Aktif Mengajar</option>
                                                <option value="nonaktif">🔴 Nonaktif / Keluar</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-100 p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-purple-500"></div>
                                    <h3 className="font-bold text-purple-800 border-b border-purple-100 pb-2 mb-4 flex items-center gap-2">Alamat Domisili</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label htmlFor="alamat" className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat Lengkap</label>
                                            <input type="text" id="alamat" name="alamatLengkap" defaultValue={selectedTeacher?.alamatLengkap || ""} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="desa" className="block text-xs font-bold text-slate-500 uppercase mb-1">Desa / Kelurahan</label>
                                            <input type="text" id="desa" name="desa" defaultValue={selectedTeacher?.desa || ""} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="kecamatan" className="block text-xs font-bold text-slate-500 uppercase mb-1">Kecamatan</label>
                                            <input type="text" id="kecamatan" name="kecamatan" defaultValue={selectedTeacher?.kecamatan || ""} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="kabupaten" className="block text-xs font-bold text-slate-500 uppercase mb-1">Kabupaten / Kota</label>
                                            <input type="text" id="kabupaten" name="kabupaten" defaultValue={selectedTeacher?.kabupaten || ""} className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="provinsi" className="block text-xs font-bold text-slate-500 uppercase mb-1">Provinsi</label>
                                            <input type="text" id="provinsi" name="provinsi" defaultValue={selectedTeacher?.provinsi || ""} className={formFieldClass} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-200 bg-transparent sticky bottom-0 backdrop-blur-sm">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 text-white font-bold bg-red-600 hover:bg-red-700 rounded-xl transition-colors">Batal</button>
                                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-md active:scale-95">
                                    {loading ? "Memproses..." : (selectedTeacher ? "Simpan perubahan" : "Simpan Guru")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}