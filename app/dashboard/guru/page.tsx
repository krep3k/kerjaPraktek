/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { saveTeacher, deleteTeacher, getKepsek, getGuruOnly, updateKepsek, deleteKepsek } from "@/components/lib/actions";
import { User as UserIcon, Pencil, Trash2, X, PlusCircle, Eye, Crown, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [kepsek, setKepsek] = useState<any>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    
    const [viewingTeacher, setViewingTeacher] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [photoBase64, setPhotoBase64] = useState("");
    
    // STATES ANIMASI
    const [formStage, setFormStage] = useState<"idle" | "dialog" | "loading" | "toast">("idle");
    const [formStatus, setFormStatus] = useState<"success" | "error">("success");
    const [formErrorMsg, setFormErrorMsg] = useState("");
    
    const [deleteStage, setDeleteStage] = useState<"idle" | "dialog" | "loading" | "taking" | "toast">("idle");
    const [deleteStatus, setDeleteStatus] = useState<"success" | "error">("success");
    const [targetToDelete, setTargetToDelete] = useState<{id: string, name: string, type: "guru" | "kepsek"} | null>(null);

    const [kepsekStage, setKepsekStage] = useState<"idle" | "dialog" | "loading" | "toast">("idle");
    const [kepsekStatus, setKepsekStatus] = useState<"success" | "error">("success");
    const [targetKepsek, setTargetKepsek] = useState<{id: string, name: string} | null>(null);

    const [infoToast, setInfoToast] = useState({ show: false, msg: "" });

    const formFieldClass = "w-full border border-slate-300 bg-white text-slate-900 rounded-xl px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const formFieldSelectClass = `${formFieldClass} cursor-pointer`;
    
    useEffect(() => {
        const loadData = async() => {
            const gurusData = await getGuruOnly();
            const kepsekData = await getKepsek();
            setTeachers(gurusData);
            setKepsek(kepsekData);
        };
        loadData();
    }, []);

    const showInfoToast = (msg: string) => {
        setInfoToast({ show: true, msg });
        setTimeout(() => setInfoToast({ show: false, msg: "" }), 3000);
    };

    const handleEdit = (teacher:any) => {
        setSelectedTeacher(teacher);
        setPhotoBase64(teacher.profilePicture || "");
        setFormStage("dialog");
    };

    const handleAddNew = () => {
        setSelectedTeacher(null);
        setPhotoBase64("");
        setFormStage("dialog");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStage("loading");
        try {
            const formDataToSubmit = new FormData(e.currentTarget);
            const result = await saveTeacher(formDataToSubmit);
            if(result.error) {
                setFormStatus("error");
                setFormErrorMsg(result.error);
            } else {
                setFormStatus("success");
                const freshTeacher = await getGuruOnly();
                const freshKepsek = await getKepsek();
                setTeachers(freshTeacher);
                setKepsek(freshKepsek);
            }
        } catch {
            setFormStatus("error");
            setFormErrorMsg("Terjadi kesalahan sistem atau jaringan.");
        }
        setTimeout(() => {
            setFormStage("toast");
            setTimeout(() => setFormStage("idle"), 3500);
        }, 1500); 
    };

    const handleDelete = (id: string, name: string) => {
        setTargetToDelete({ id, name, type: "guru" });
        setDeleteStage("dialog");
    };

    const handleDeleteKepsek = () => {
        setTargetToDelete({ id: "kepsek", name: "Kepala Sekolah", type: "kepsek" });
        setDeleteStage("dialog");
    };

    const confirmDelete = async () => {
        setDeleteStage("loading");
        try {
            let errorMsg = null;
            if (targetToDelete?.type === "guru") {
                const res = await deleteTeacher(targetToDelete.id);
                if (res.error) errorMsg = res.error;
            } else if (targetToDelete?.type === "kepsek") {
                await deleteKepsek();
            }

            if(errorMsg) {
                setDeleteStatus("error");
                setDeleteStage("toast");
            } else {
                const freshGuru = await getGuruOnly();
                const freshKepsek = await getKepsek();
                setTeachers(freshGuru);
                setKepsek(freshKepsek);
                
                setDeleteStatus("success");
                setDeleteStage("taking");
                setTimeout(() => setDeleteStage("toast"), 1500);
            }
        } catch {
            setDeleteStatus("error");
            setDeleteStage("toast");
        }
        setTimeout(() => {
            setDeleteStage("idle");
            setTargetToDelete(null);
        }, 4500);
    };

    const handleSetKepsek = (id: string, name: string) => {
        setTargetKepsek({ id, name });
        setKepsekStage("dialog");
    };

    const confirmSetKepsek = async () => {
        setKepsekStage("loading");
        try {
            if (targetKepsek) {
                await updateKepsek(targetKepsek.id);
                const freshKepsek = await getKepsek();
                const freshGuru = await getGuruOnly();
                setKepsek(freshKepsek);
                setTeachers(freshGuru);
                setKepsekStatus("success");
            }
        } catch {
            setKepsekStatus("error");
        }
        setTimeout(() => {
            setKepsekStage("toast");
            setTimeout(() => {
                setKepsekStage("idle");
                setTargetKepsek(null);
            }, 3000);
        }, 1500);
    };

    const handleProfileClick = (teacher: Teacher) => {
        if (teacher.profilePicture) {
            setViewingTeacher(teacher);
        } else {
            showInfoToast("Guru yang bersangkutan belum mengunggah foto profil.");
        }
    };

    const handleDetailPhotoClick = () => {
        if (viewingTeacher?.profilePicture) {
            setPreviewImage(viewingTeacher.profilePicture);
        } else {
            showInfoToast("Foto profil tidak tersedia.");
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const shapes = [
        <div key="1" className="w-5 h-5 bg-blue-500 rounded-sm shadow-sm" />,
        <div key="2" className="w-5 h-5 bg-rose-500 rounded-full shadow-sm" />,
        <div key="3" className="w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-b-18 border-b-amber-500" />,
        <div key="4" className="w-7 h-4 bg-emerald-500 rounded-full shadow-sm" />,
        <div key="5" className="w-5 h-5 bg-purple-500 rotate-45 shadow-sm" />,
    ];

    // Transisi kustom sederhana yang smooth
    const smoothTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
    const fadeScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="space-y-6 relative">
            <AnimatePresence>
                {infoToast.show && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-8 left-1/2 -translate-x-1/2 z-100 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-slate-700">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">{infoToast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h1 className="text-2xl font-bold text-foreground">Data Guru</h1>
                <p className="text-muted-foreground text-sm mt-1">Kelola akun dan profile guru yang terhormat</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 w-full">
                {userRole === "admin" && (
                    <div className="flex-1">
                        {kepsek ? (
                            <div className="bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {kepsek.profilePicture ? (
                                        <Image src={kepsek.profilePicture} alt={kepsek.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-amber-200 shrink-0" unoptimized/>
                                    ) : (
                                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-900 text-xs shrink-0">
                                            {getInitials(kepsek.name)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-amber-900 text-sm truncate">{kepsek.name}</p>
                                            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-800 rounded-md">Kepala Sekolah</span>
                                        </div>
                                        <p className="text-xs text-amber-700 truncate">{kepsek.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200/60">
                                    
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setViewingTeacher(kepsek)} title="Lihat detail kepala sekolah" className="p-1.5 hover:bg-amber-200 rounded-lg transition">
                                            <Eye className="w-4 h-4 text-amber-700"/>
                                        </button>
                                        <button onClick={() => handleEdit(kepsek)} title="edit data kepala sekolah" className="p-1.5 hover:bg-amber-200 rounded-lg transition">
                                            <Pencil className="w-4 h-4 text-amber-700"/>
                                        </button>
                                        <button onClick={handleDeleteKepsek} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg transition text-xs">
                                            Hapus Posisi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50/50 border border-dashed border-amber-300 rounded-xl p-3.5 text-xs text-amber-800 flex items-center gap-2">
                                <span>Belum ada kepala sekolah yang ditetapkan. Pilih salah satu guru dari daftar di bawah untuk menetapkan.</span>
                            </div>
                        )}
                    </div>
                )}
                <div></div>
                {userRole === "admin" && (
                    <button onClick={handleAddNew} className="flex items-center justify-center gap-2.5 bg-[#0f2bff] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:bg-[#1518c7] transition-all duration-200 ease-in-out active:scale-95">
                        <PlusCircle size={20} strokeWidth={2.5}/> Tambah Guru
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
                            {userRole === "admin" && <th className="px-6 py-4 text-center">Aksi</th>}
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
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            <button title="Jadikan Kepsek" onClick={() => handleSetKepsek(t._id, t.name)} className="p-2 text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition">
                                                <Crown className="w-4 h-4"></Crown>
                                            </button>
                                            <button title="Edit" onClick={() => handleEdit(t)} className="p-2 text-white bg-[#223cff] hover:bg-[#5e66ff] rounded-lg transition">
                                                <Pencil className="w-4 h-4"></Pencil>
                                            </button>
                                            <button title="Hapus" onClick={() => handleDelete(t._id, t.name)} className="p-2 text-white bg-[#ff2929] hover:bg-[#ff4b4b] rounded-lg transition">
                                                <Trash2 className="h-4 w-4"></Trash2>
                                            </button>
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 flex items-center justify-center gap-3">
                                    <button onClick={() => setViewingTeacher(t)} className="p-2 text-white bg-[#cd3fd0] hover:bg-[#d999d6] rounded-lg transition" title="Lihat Detail">
                                        <Eye className="w-5 h-5"></Eye>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">Belum ada guru</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AnimatePresence>
                {formStage !== "idle" && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0" onClick={() => formStage === "dialog" && setFormStage("idle")} />
                        
                        {/* MODE WAIT MENCEGAH TUMPANG TINDIH ANIMASI */}
                        <AnimatePresence mode="wait">
                            {formStage === "dialog" && (
                                <motion.div key="form-dialog" {...fadeScale} transition={smoothTransition} className="bg-card rounded-xl shadow-2xl max-w-3xl w-full p-6 border border-border max-h-[90vh] flex flex-col relative z-10 overflow-hidden">
                                    <div className="flex justify-between items-center mb-4 shrink-0">
                                        <h2 className="text-xl font-bold text-foreground">{selectedTeacher ? "Edit Pofile Guru" : "Tambah Akun Guru Baru"}</h2>
                                        <button onClick={() => setFormStage("idle")} className="text-muted-foreground hover:text-rose-500 rounded-full p-1 transition"><X className="w-6 h-6"/></button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                        <input type="hidden" name="id" value={selectedTeacher?._id || ""} />
                                        <input type="hidden" name="profilePicture" value={photoBase64 || ""} />
                                        
                                        <div className="overflow-y-auto pr-2 space-y-6 pb-2 custom-scrollbar">
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-600"></div>
                                                <h3 className="font-bold text-blue-700 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">Profile</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
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
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                                <label htmlFor="pp" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer transition">
                                                                    Pilih Foto
                                                                </label>
                                                                {photoBase64 && <span className="text-xs text-emerald-600 font-medium">✓ Foto terpilih</span>}
                                                            </div>
                                                            <input id="pp" name="pp" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                                                        <input type="text" name="name" defaultValue={selectedTeacher?.name || ""} required className={formFieldClass} placeholder="Contoh: Budi Santoso, S.Pd" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Id Guru</label>
                                                        <input type="text" name="idGuru" defaultValue={selectedTeacher?.idGuru || ""} required className={`${formFieldClass} font-mono`} placeholder="ID.2024..." />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                                        <input type="email" name="email" defaultValue={selectedTeacher?.email || ""} required className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                                        <input type="password" name="password" required={!selectedTeacher} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role Akun</label>
                                                        <select name="role" defaultValue={selectedTeacher?.role || "guru"} required className={formFieldSelectClass}>
                                                            <option value="guru">Guru</option>
                                                            <option value="kepsek">Kepala Sekolah</option>
                                                            <option value="tu">Tata Usaha</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
                                                <h3 className="font-bold text-amber-800 border-b border-amber-200 pb-2 mb-4">Data Pribadi</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempat Lahir</label>
                                                        <input type="text" name="tempatLahir" defaultValue={selectedTeacher?.tempatLahir || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Lahir</label>
                                                        <input type="date" name="tanggalLahir" defaultValue={selectedTeacher?.tanggalLahir || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                                        <select name="jenisKelamin" defaultValue={selectedTeacher?.jenisKelamin || ""} className={formFieldSelectClass}>
                                                            <option value="Laki-laki">Laki-laki</option>
                                                            <option value="Perempuan">Perempuan</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. WhatsApp</label>
                                                        <input type="text" name="noTelp" defaultValue={selectedTeacher?.noTelp || ""} className={formFieldClass} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500"></div>
                                                <h3 className="font-bold text-emerald-800 border-b border-emerald-200 pb-2 mb-4">Data Kedinasan</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Pegawai</label>
                                                        <select name="statusKepegawaian" defaultValue={selectedTeacher?.statusKepegawaian || "PNS"} className={formFieldSelectClass}>
                                                            {["PNS", "PPPK", "GTY", "Honorer"].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Golongan</label>
                                                        <select name="golongan" defaultValue={selectedTeacher?.golongan || ""} className={formFieldSelectClass}>
                                                            <option value="">-- Non PNS / Kosong --</option>
                                                            {["I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"].map(gol => (
                                                                <option value={gol} key={gol}>{gol}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jabatan Struktural</label>
                                                        <select name="jabatanStruktural" defaultValue={selectedTeacher?.jabatanStruktural || "Guru Kelas"} className={formFieldSelectClass}>
                                                            {["Guru Kelas", "Guru Mapel", "Guru Ekskul", "Tata Usaha", "Kepala Sekolah"].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jabatan Fungsional</label>
                                                        <select name="jabatanFungsional" defaultValue={selectedTeacher?.jabatanFungsional || "Guru Pertama"} className={formFieldSelectClass}>
                                                            {["Guru Pertama", "Guru Muda", "Guru Madya", "Guru Utama"].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                                                        <select name="mataPelajaran" defaultValue={selectedTeacher?.mataPelajaran || ""} className={formFieldSelectClass}>
                                                            <option value="">-- Guru Kelas (Kosongkan) --</option>
                                                            <option value="PAI">PAI</option>
                                                            <option value="PJOK">PJOK</option>
                                                            <option value="BTQ">BTQ</option>
                                                            <option value="TIK">TIK</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                                                            <select name="kelas" defaultValue={selectedTeacher?.kelas || ""} className={formFieldSelectClass}>
                                                                <option value="">--Pilih--</option>
                                                                {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rombel</label>
                                                            <select name="rombel" defaultValue={selectedTeacher?.rombel || ""} className={formFieldSelectClass}>
                                                                <option value="">--Pilih--</option>
                                                                {["A", "B", "C"].map(r => <option key={r} value={r}>Rombel {r}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TMT Mengajar</label>
                                                        <input type="date" name="tmtMengajar" defaultValue={selectedTeacher?.tmtMengajar || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIP</label>
                                                        <input type="text" name="nip" defaultValue={selectedTeacher?.nip || ""} className={`${formFieldClass} font-mono`} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NUPTK</label>
                                                        <input type="text" name="nuptk" defaultValue={selectedTeacher?.nuptk || ""} className={`${formFieldClass} font-mono`} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pendidikan</label>
                                                        <select name="pendidikan" defaultValue={selectedTeacher?.pendidikan || "S1"} className={formFieldSelectClass}>
                                                            {["SMA/SMK", "D3", "S1", "S2", "S3"].map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Status Mengajar</label>
                                                        <select name="status" defaultValue={selectedTeacher?.status || "aktif"} className={formFieldSelectClass}>
                                                            <option value="aktif">🟢 Aktif</option>
                                                            <option value="nonaktif">🔴 Nonaktif</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-purple-500"></div>
                                                <h3 className="font-bold text-purple-800 border-b border-purple-200 pb-2 mb-4">Alamat Domisili</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat Lengkap</label>
                                                        <input type="text" name="alamatLengkap" defaultValue={selectedTeacher?.alamatLengkap || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desa / Kelurahan</label>
                                                        <input type="text" name="desa" defaultValue={selectedTeacher?.desa || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kecamatan</label>
                                                        <input type="text" name="kecamatan" defaultValue={selectedTeacher?.kecamatan || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kabupaten / Kota</label>
                                                        <input type="text" name="kabupaten" defaultValue={selectedTeacher?.kabupaten || ""} className={formFieldClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provinsi</label>
                                                        <input type="text" name="provinsi" defaultValue={selectedTeacher?.provinsi || ""} className={formFieldClass} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-200 shrink-0 bg-card">
                                            <button type="button" onClick={() => setFormStage("idle")} className="px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition">Batal</button>
                                            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md">
                                                {selectedTeacher ? "Simpan Perubahan" : "Simpan Guru"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {formStage === "loading" && (
                                <motion.div key="form-loading" {...fadeScale} transition={smoothTransition} className="bg-white w-64 h-64 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-6 relative z-10">
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
                                    <span className="text-sm font-bold text-blue-600 tracking-wide animate-pulse">Menyimpan Data...</span>
                                </motion.div>
                            )}

                            {formStage === "toast" && (
                                <motion.div key="form-toast" {...fadeScale} transition={smoothTransition} className={`flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl shadow-2xl text-white relative z-10 w-80 text-center ${formStatus === "success" ? "bg-blue-600" : "bg-rose-600"}`}>
                                    {formStatus === "success" ? (
                                        <>
                                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "tween", duration: 0.3 }} className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner">
                                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <motion.path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Berhasil Disimpan</h3>
                                                <p className="text-blue-100 text-xs">Data profil telah diperbarui di sistem.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <AlertCircle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">Gagal Menyimpan</h3>
                                                <p className="text-rose-100 text-xs">{formErrorMsg}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {deleteStage !== "idle" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => deleteStage === "dialog" && setDeleteStage("idle")} />
                        
                        <AnimatePresence mode="wait">
                            {deleteStage === "dialog" && (
                                <motion.div key="delete-dialog" {...fadeScale} transition={smoothTransition} className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-3 w-80 relative z-10">
                                    <div className="flex items-center gap-3 text-rose-600 mb-2">
                                        <div className="p-3 bg-rose-50 rounded-full border border-rose-100"><Trash2 className="w-6 h-6" /></div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">Hapus Data <br/><span className="text-rose-600 truncate block max-w-37.5">{targetToDelete?.name}</span></h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {targetToDelete?.type === "kepsek" ? "Posisi ini akan dikosongkan. Lanjutkan?" : "Tindakan ini permanen. Yakin membuang profil ini?"}
                                    </p>
                                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
                                        <button onClick={() => setDeleteStage("idle")} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Batal</button>
                                        <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm">Ya, Hapus</button>
                                    </div>
                                </motion.div>
                            )}

                            {(deleteStage === "loading" || deleteStage === "taking") && (
                                <motion.div key="delete-anim" {...fadeScale} transition={smoothTransition} className="bg-white w-72 h-64 rounded-2xl shadow-2xl overflow-hidden relative flex items-center justify-center z-10 border border-slate-100">
                                    <motion.div className="relative flex flex-col items-center justify-end w-32 h-40" animate={deleteStage === "taking" ? { x: 300 } : { x: 0 }} transition={{ duration: 0.8, ease: "easeIn" }}>
                                        <motion.div className="w-24 h-3 bg-slate-700 rounded-t-md relative z-20 origin-bottom-left" animate={deleteStage === "taking" ? { rotate: 0, y: 0 } : { rotate: -65, y: -10, x: -10 }} transition={{ type: "tween", duration: 0.3 }}>
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-slate-600 rounded-t-sm" />
                                        </motion.div>
                                        <div className="w-20 h-24 bg-slate-800 rounded-b-xl relative z-20 flex justify-center gap-2 pt-3 shadow-inner">
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                        </div>
                                        {deleteStage === "loading" && (
                                            <div className="absolute inset-0 z-10 flex justify-center overflow-hidden">
                                                {shapes.map((Shape, index) => (
                                                    <motion.div key={index} className="absolute" initial={{ y: -100, opacity: 0, rotate: 0, scale: 0.5 }} animate={{ y: [ -80, 20, 80 ], opacity: [0, 1, 0], rotate: [0, 180, 360], scale: [0.5, 1, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: index * 0.2, ease: "linear" }}>
                                                        {Shape}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                        {deleteStage === "taking" && (
                                            <motion.div className="absolute top-10 flex items-center z-30" initial={{ x: -200 }} animate={{ x: -45 }} transition={{ type: "tween", duration: 0.4 }}>
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

                            {deleteStage === "toast" && (
                                <motion.div key="delete-toast" {...fadeScale} transition={smoothTransition} className="flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white relative z-10 w-80 bg-slate-800 border border-slate-700">
                                    {deleteStatus === "success" ? (
                                        <>
                                            <Trash2 className="w-8 h-8 text-rose-400" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Data Terhapus</span>
                                                <span className="text-slate-400 text-xs">Arsip telah dibersihkan.</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-8 h-8 text-rose-500" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Gagal Menghapus</span>
                                                <span className="text-slate-400 text-xs">Kendala pada server.</span>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================== */}
            {/* OVERLAY 3: SET KEPALA SEKOLAH (MODE: WAIT) */}
            {/* ========================================== */}
            <AnimatePresence>
                {kepsekStage !== "idle" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => kepsekStage === "dialog" && setKepsekStage("idle")} />
                        
                        <AnimatePresence mode="wait">
                            {kepsekStage === "dialog" && (
                                <motion.div key="kepsek-dialog" {...fadeScale} transition={smoothTransition} className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-3 w-80 relative z-10 text-center items-center">
                                    <div className="p-4 bg-amber-100 text-amber-600 rounded-full mb-2"><Crown className="w-8 h-8" /></div>
                                    <h3 className="font-bold text-gray-900 text-lg">Tetapkan Kepala Sekolah</h3>
                                    <p className="text-sm text-gray-500">
                                        Jadikan <strong className="text-amber-700">{targetKepsek?.name}</strong> sebagai pimpinan?
                                    </p>
                                    <div className="flex justify-center gap-3 mt-4 w-full">
                                        <button onClick={() => setKepsekStage("idle")} className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">Batal</button>
                                        <button onClick={confirmSetKepsek} className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm transition">Tetapkan</button>
                                    </div>
                                </motion.div>
                            )}
                            
                            {kepsekStage === "loading" && (
                                <motion.div key="kepsek-loading" {...fadeScale} transition={smoothTransition} className="bg-white p-8 rounded-2xl shadow-2xl relative z-10 text-center w-64 flex flex-col items-center justify-center">
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-amber-500 mb-4 drop-shadow-md">
                                        <Crown className="w-16 h-16" />
                                    </motion.div>
                                    <p className="font-bold text-amber-700">Mengesahkan...</p>
                                    <p className="text-xs text-slate-400 mt-1">Pembaruan struktur organisasi</p>
                                </motion.div>
                            )}

                            {kepsekStage === "toast" && (
                                <motion.div key="kepsek-toast" {...fadeScale} transition={smoothTransition} className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white relative z-10 w-80 ${kepsekStatus === "success" ? "bg-amber-500" : "bg-rose-600"}`}>
                                    {kepsekStatus === "success" ? (
                                        <>
                                            <CheckCircle2 className="w-8 h-8 text-amber-100" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Sah Menjabat!</span>
                                                <span className="text-amber-100 text-xs">Kepala Sekolah telah diperbarui.</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-8 h-8 text-white" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Gagal Update</span>
                                                <span className="text-rose-100 text-xs">Sistem gagal memproses.</span>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

            {/* OVERLAY BAWAAN: VIEW DETAIL & PREVIEW FOTO */}
            <AnimatePresence>
                {viewingTeacher && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <motion.div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden" {...fadeScale} transition={smoothTransition}>
                            <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={handleDetailPhotoClick} className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-card shadow-md flex items-center justify-center transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400">
                                        {viewingTeacher.profilePicture ? (
                                            <Image src={viewingTeacher.profilePicture} alt="Profile" width={64} height={64} className="w-16 h-16 rounded-full object-cover" unoptimized />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-card/50">
                                                {viewingTeacher.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-full"></span>
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold">{viewingTeacher.name}</h2>
                                        <p className="text-blue-100 text-sm font-medium">{viewingTeacher.jabatanStruktural || "Guru"} - {viewingTeacher.idGuru || "-"}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingTeacher(null)} className="p-2 hover:bg-white/20 rounded-full transition" title="Tutup"><X className="w-6 h-6"></X></button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm bg-white">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 border-b pb-2 text-base">Profile Guru</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-slate-500">TTL</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.tempatLahir || "-"}, {viewingTeacher.tanggalLahir}</span>
                                        <span className="text-slate-500">Gender</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.jenisKelamin || "-"}</span>
                                        <span className="text-slate-500">No. WhatsApp</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.noTelp || "-"}</span>
                                        <span className="text-slate-500">Pendidikan Terakhir</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher?.pendidikan || "-"}</span>
                                        <span className="text-slate-500">Email Akun</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.email || "-"}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 border-b pb-2 text-base">Data Kedinasan</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-slate-500">Status Pegawai</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">{viewingTeacher.statusKepegawaian || "-"}</span></span>
                                        <span className="text-slate-500">Golongan/Ruang</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.golongan || "-"}</span>
                                        <span className="text-slate-500">Jabatan Struktural</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.jabatanStruktural || "-"}</span>
                                        {viewingTeacher.jabatanStruktural === "Guru Kelas" && (
                                            <>
                                                <span className="text-slate-500">Mengampu kelas</span>
                                                <span className="col-span-2 font-semibold text-blue-600">: {viewingTeacher.kelas} {viewingTeacher.rombel}</span>
                                            </>
                                        )}
                                        {viewingTeacher.jabatanStruktural === "Guru Mapel" && (
                                            <>
                                                <span className="text-slate-500">Mata Pelajaran</span>
                                                <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.mataPelajaran || "-"}</span>
                                            </>
                                        )}
                                        <span className="text-slate-500">Jabatan Fungsional</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.jabatanFungsional || "-"}</span>
                                        <span className="text-slate-500">TMT Mengajar</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.tmtMengajar || "-"}</span>
                                        <span className="text-slate-500">NIP</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.nip || "-"}</span>
                                        <span className="text-slate-500">NUPTK</span>
                                        <span className="col-span-2 font-semibold text-slate-800">: {viewingTeacher.nuptk || "-"}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4 pt-2">
                                    <h3 className="font-bold text-slate-800 border-b pb-2 text-base">Alamat Domisili</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-1">Alamat Jalan</p>
                                            <p className="font-semibold text-slate-800">{viewingTeacher.alamatLengkap || "-"}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-slate-500 text-xs mb-1">Desa/Kelurahan</p>
                                                <p className="font-semibold text-slate-800">{viewingTeacher.desa || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs mb-1">Kecamatan</p>
                                                <p className="font-semibold text-slate-800">{viewingTeacher.kecamatan || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs mb-1">Kabupaten/Kota</p>
                                                <p className="font-semibold text-slate-800">{viewingTeacher.kabupaten || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs mb-1">Provinsi</p>
                                                <p className="font-semibold text-slate-800">{viewingTeacher.provinsi}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OVERLAY BAWAAN: PREVIEW GAMBAR BESAR */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <motion.div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl flex items-center justify-center" {...fadeScale} transition={smoothTransition}>
                            <button title="Tutup Preview" type="button" onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                                <X className="w-6 h-6" />
                            </button>
                            <Image src={previewImage} alt="Preview Foto Guru" width={800} height={600} className="w-full max-h-[85vh] object-contain" unoptimized/>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}