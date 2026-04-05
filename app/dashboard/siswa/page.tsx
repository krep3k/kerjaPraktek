/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getStudentsFiltered, addStudents, updateStudents, deleteStudent } from "@/lib/actions";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function SiswaPage() {
    const {data: session} = useSession();
    const [students, setStudents] = useState<any[]>([]);
    const [filterKelas, setFilterKelas] = useState<number>(1);
    const [filterRombel, setFilterRombel] = useState<string>("A");
    const availableRombels = (filterKelas <= 4) ? ["A", "B", "C"] : ["A", "B"];
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nis: "", nisn: "", name: "", gender: "L", kelas: 1, rombel: "A", status: "aktif"
    });
    const [loading, setLoading] = useState(false);
    const userRole = session?.user ? (session?.user as any).role : null;
    const isAdmin = userRole === "admin";

    useEffect(() => {
        const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
        const loadStudents = async () => {
            setLoading(true);
            const data = await getStudentsFiltered(filterKelas, normalizedRombel);
            setStudents(data);
            setLoading(false);
        };
        loadStudents();
    }, [filterKelas, filterRombel]);

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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = editingId ? await updateStudents(editingId, formData) : await addStudents(formData);
        if(res.error) {
            alert("Error: " + res.error);
        } else {
            setShowModal(false);
            // Refresh the student list
            const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
            const data = await getStudentsFiltered(filterKelas, normalizedRombel);
            setStudents(data);
        }
    };
    const handleDelete = async (id: string, name: string) => {
        if(confirm(`Apakah anda yakin ingin menghapus data siswa "${name}"? tindakan ini tidak bisa dibatalkan!`)) {
            setLoading(true);
            const res = await deleteStudent(id);
            if(res.error) {
                alert("Error: " + res.error);
            } else {
                const normalizedRombel = filterKelas >= 5 && filterRombel === "C" ? "A" : filterRombel;
                const data = await getStudentsFiltered(filterKelas, normalizedRombel);
                setStudents(data);
            }
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data siswa di sekolah SDN 02 Serua</p>
                </div>
                {isAdmin && (
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" title="plus">
                        <Plus className="w-5 h-5">Tambah Siswa</Plus>
                    </button>
                )}
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4">
                <div className="flex-1 max-w-xs">
                    <label htmlFor="filterKelas" className="block text-sm font-semibold text-gray-700 mb-1">
                        Kelas
                    </label>
                    <select id="filterKelas" value={filterKelas} onChange={(e) => setFilterKelas(Number(e.target.value))}>
                        {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                </div>
                <div className="flex-1 max-w-xs">
                    <label htmlFor="filterRombel" className="block text-sm font-semibold text-gray-700 mb-1">Pilih Rombel</label>
                    <select name="rombel" id="filterRombel" value={filterRombel} onChange={(e) => setFilterRombel(e.target.value)} className="w-full border p-2 rounded-lg">
                        {availableRombels.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {loading ? <div className="p-10 text-center">Memuat data...</div> : (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4 w-16">No</th>
                                <th className="px-6 py-4">NIS</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">Nama Siswa</th>
                                <th className="px-6 py-4 text-center">Ket (L/P)</th>
                                <th className="px-6 py-4">Status</th>
                                {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr><td colSpan={7} className="p-6 text-center text-gray-400">Tidak ada data siswa</td></tr>
                            ) : students.map((siswa, index) => (
                                <tr key={siswa._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{siswa.nis}</td>
                                    <td className="px-6 py-4">{siswa.nisn || "-"}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{siswa.name}</td>
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
                )}
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingId ? "Edit" : "Tambah Siswa"}</h2>
                            <button title="cancel" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"></X></button>
                        </div>
                        <form action="" onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">NIS
                                        <input type="text" value={formData.nis} onChange={(e) => setFormData({...formData, nis: e.target.value})} required className="w-full border p-2 rounded-lg" />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">NISN
                                        <input type="text" value={formData.nisn} onChange={(e) => setFormData({...formData, nisn: e.target.value})} className="w-full border p-2 rounded-lg" />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full border p-2 rounded-lg" />
                                </label>
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
                    </div>
                </div>
            )}
        </div>
    );
}