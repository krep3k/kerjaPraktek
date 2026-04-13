/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { getTeacher, saveTeacher, deleteTeacher } from "@/lib/actions";
import { User as UserIcon, Pencil, Trash2, X, PlusCircle } from "lucide-react";

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
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [photoBase64, setPhotoBase64] = useState("");
    const [loading, setLoading] = useState(false);
    
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
        if(confirm(`Apakah anda yakin ingin menghapus data guru "${name}"? Tindakan ini tidak dapat dibatalkan`)) {
            setLoading(true);
            const res = await deleteTeacher(id);
            if(res.error) alert(res.error);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Guru</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola akun dan profile guru yang terhormat</p>
                </div>
                <button title="modalOpen" onClick={handleAddNew} className="flex items-center justify-center gap-2.5 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 ease-in-out active:scale-95">
                    <PlusCircle color="#ffffff" size={22} strokeWidth={2.5}></PlusCircle>
                </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm w-full">
                <table className="w-full text-left text-sm text-gray-600 min-w-200">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Profil</th>
                            <th className="px-6 py-4">Id</th>
                            <th className="px-6 py-4">Nama Lengkap</th>
                            <th className="px-6 py-4 text-center">Gender</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">NIP</th>
                            <th className="px-6 py-4">NUPTK</th>
                            <th className="px-6 py-4">WhatsApp</th>
                            <th className="px-6 py-4 text-center">Pendidikan</th>
                            <th className="px-6 py-4 text-center">Status Pegawai</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    {t.profilePicture ? (
                                        <img src={t.profilePicture} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-gray-300" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                            <UserIcon className="w-5 h-5"></UserIcon>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-700">{t.idGuru ? t.idGuru : "-"}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{t.jenisKelamin === "Perempuan" ? "P" : "L"}</td>
                                <td className="px-6 py-4 text-gray-700">{t.email}</td>
                                <td className="px-6 py-4 text-gray-700 tabular-nums">{t.nip}</td>
                                <td className="px-6 py-4 text-gray-700 tabular-nums">{t.nuptk ? t.nuptk : "-"}</td>
                                <td className="px-6 py-4 text-gray-700">{t.noTelp}</td>
                                <td className="px-6 py-4 text-gray-700">{t.pendidikan}</td>
                                <td className="px-6 py-4 text-gray-700">{t.statusKepegawaian}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${t.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {t.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 justify-center">
                                        <button title="edit" onClick={() => handleEdit(t)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                            <Pencil className="wa-4 h-4"></Pencil>
                                        </button>
                                        <button title="delete" onClick={() => handleDelete(t._id, t.name)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 className="h-4 w-4"></Trash2>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr><td colSpan={11} className="text-center py-8 text-gray-500">Belum ada guru</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 border border-gray-100 max-h-[85vh] overflow-y-auto relative">
                        <button title="X" onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                            <X className="w-4 h-4"></X>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{selectedTeacher ? "Edit Pofile Guru" : "Tambah Akun Guru Baru"}</h2>
                        <form action="" onSubmit={handleSubmit} key={selectedTeacher?._id || "new"} className="space-y-6">
                            <label htmlFor="hidden"></label>
                            <input type="hidden" name="id" value={selectedTeacher?._id || ""} />
                            <input type="hidden" name="profilePicture" value={photoBase64 || ""} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden space-y-5">
                                    <div>
                                        <label htmlFor="pp" className="block text-sm font-semibold text-gray-700 mb-1">Photo profile</label>
                                        <input id="pp" type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        {photoBase64 && <img src={photoBase64} alt="Teacher profile preview" className="mt-3 w-16 h-16 rounded-full object-cover border" />}
                                    </div>
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                                        <input id="name" type="text" name="name" placeholder="..." required defaultValue={selectedTeacher?.name || ""} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label htmlFor="idGuru" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">id Guru</label>
                                        <input id="idGuru" type="text" name="idGuru" required placeholder="..." defaultValue={selectedTeacher?.idGuru || ""} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none tabular-nums" />
                                    </div>
                                    <div>
                                        <label htmlFor="jenisKelamin" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                                        <select name="jenisKelamin" id="jenisKelamin" defaultValue={selectedTeacher?.jenisKelamin || "Laki-laki"} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none cursor-pointer">
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                                        <input id="email" type="email" name="email" required placeholder="..." defaultValue={selectedTeacher?.email || ""} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none font-mono" />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Password {selectedTeacher && <span className="text-slate-400 font-normal normal-case tracking-normal">(Kosongkan jika tidak diubah)</span>}
                                        </label>
                                        <input id="password" type="password" name="password" placeholder="..." required={!selectedTeacher} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none tracking-widest placeholder:tracking-normal" />
                                    </div>
                                </div>
                                <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden space-y-5">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500"></div>
                                    <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-3 flex items-center gap-3 text-lg">
                                        <div className="w-9 h-9 bg-emerald-100 rounded-xl shadow-inner flex items-center justify-center text-emerald-600 font-serif font-black text-lg">D</div>
                                        Data Kedinasan
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="nip" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NIP</label>
                                            <input type="text" id="nip" name="nip" placeholder="..." defaultValue={selectedTeacher?.nip || ""} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none font-mono" />
                                        </div>
                                        <div>
                                            <label htmlFor="nuptk" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NUPTK</label>
                                            <input type="text" id="nuptk" name="nuptk" placeholder="..." defaultValue={selectedTeacher?.nuptk || ""} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none font-mono" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="noTelp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. WhatsApp</label>
                                        <input type="text" id="noTelp" name="noTelp" placeholder="..." defaultValue={selectedTeacher?.noTelp || ""} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="pendidikan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pendidikan</label>
                                            <select name="pendidikan" id="pendidikan" defaultValue={selectedTeacher?.pendidikan || "S1"} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none cursor-pointer">
                                                {["SMA/SMK", "D3", "S1", "S2", "S3"].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="statusKepegawaian" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status Pegawai</label>
                                            <select name="statusKepegawaian" id="statusKepegawaian" defaultValue={selectedTeacher?.statusKepegawaian || "PNS"} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none cursor-pointer">
                                                {["PNS", "PPPK", "GTY", "Honorer"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-1">
                                        <label htmlFor="status" className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Status Guru</label>
                                        <select name="status" id="status" defaultValue={selectedTeacher?.status} className="w-full border-2 border-emerald-200 text-emerald-800 font-bold bg-emerald-50/50 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-3 shadow-sm transition-all outline-none cursor-pointer hover:bg-emerald-100">
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Batal</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm">
                                    {loading ? "Memproses..." : (selectedTeacher ? "Simpan perubahan" : "Simpan Guru")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}