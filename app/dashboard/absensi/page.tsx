/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getAbsensiRecord, saveBulkAbsensi, getStudentsFiltered } from "@/components/lib/actions";
import { Save } from "lucide-react";
import { getRombelByKelas } from "@/components/lib/constants";
import { getMataPelajaranByKelas } from "@/components/lib/constants";
import { motion } from "motion/react";
import Swal from "sweetalert2";

export default function AbsensiPage() {
    const [kelas, setKelas] = useState<number>(1);
    const [rombel, setRombel] = useState<string>("A");
    const today = new Date().toISOString().split("T")[0];
    const [tanggal, setTanggal] = useState<string>(today);
    const [students, setStudents] = useState<any[]>([]);
    const [absensiData, setAbsensiData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [mapel, setMapel] = useState("Matematika");
    const rombelOption = getRombelByKelas(kelas);

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

    const handleSave = async () => {
        setLoading(true);
        Swal.fire({
            title: "Menyimpan absensi siswa...",
            text: "Mohon tunggu sebentar",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        const dataToSave = students.map(s => ({
            studentId: s._id,
            status: absensiData[s._id].status,
            keterangan: absensiData[s._id].keterangan
        }));
        const res = await saveBulkAbsensi(dataToSave, kelas, rombel, tanggal);
        if(res.error) {
            await Swal.fire({
                title: "Gagal menyimpan!",
                text: "Gagal menyimpan data: " + res.error,
                icon: "error",
                confirmButtonColor: "#3b82f6",
                showClass: {
                    popup: 'animate__animated animate__shakeX',
                }
            });
        } else {
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data absensi berhasil disimpan!',
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                timer: 2000, // Menutup otomatis setelah 2 detik
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__bounceIn' // Efek bounce masuk yang mulus
                }
            });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Record Absensi Siswa</h1>
                <div className="flex gap-3">
                    <button title="save" onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <Save className="w-5 h-5">Simpan</Save>
                    </button>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="block text-sm font-semibold text-blue-700 mb-1"><label htmlFor="" className="block text-sm font-semibold text-blue-700 mb-1">Kelas
                    <select name="" id="" value={kelas} onChange={handleKelasChange} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {[1, 2, 3, 4, 5, 6].map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </label></div>
                <div className="block text-sm font-semibold text-blue-700 mb-1"><label htmlFor="" className="block text-sm font-semibold text-blue-700 mb-1">Rombel
                    <select name="" id="" value={rombel} onChange={e => setRombel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {rombelOption.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </label></div>
                <div className="block text-sm font-semibold text-blue-700 mb-1"><label htmlFor="date" className="block text-sm font-semibold text-blue-700 mb-1">Tanggal
                    <input id="date" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium" />
                </label></div>
            
            </div>
            {loading ? <div className="text-center p-10">Memuat data...</div> : (
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
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-170 w-full table-auto text-left text-sm border-collapse">
                        <thead className="bg-[#2c25ff] border-b text-white">
                            <tr>
                                <th className="p-3 w-16">No</th>
                                <th className="p-3">Nama Siswa</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, idx) => (
                                <tr key={s._id} className="border-b hover:bg-gray-50 last:border-b-0">
                                    <td className="p-3 align-top">{idx + 1}</td>
                                    <td className="p-3 font-medium align-top max-w-55 wrap-break-word">{s.name}</td>
                                    <td className="p-3 text-center align-top">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {[
                                                { id: "Hadir", label: "Hadir", activeClass: "bg-emerald-500 text-white border-emerald-600 shadow-sm" },
                                                { id: "Izin", label: "Izin", activeClass: "bg-blue-500 text-white border-blue-600 shadow-sm" },
                                                { id: "Sakit", label: "Sakit", activeClass: "bg-amber-500 text-white border-amber-600 shadow-sm" },
                                                { id: "Alpha", label: "Alpha", activeClass: "bg-rose-500 text-white border-rose-600 shadow-sm" },
                                            ].map(st => {
                                                const isActive = absensiData[s._id]?.status === st.id;
                                                return (
                                                    <button key={st.id} type="button" onClick={() => handleStatusSelect(s._id, st.id)} className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all border ${isActive ? st.activeClass : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                                                        {st.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-3 align-top max-w-65">
                                        <label htmlFor={`ket-${s._id}`} className="sr-only">Keterangan</label>
                                        <input id={`ket-${s._id}`} type="text" placeholder={absensiData[s._id]?.status === "Hadir" ? "Tidak perlu catatan" : "Tulis alasan..."} value={absensiData[s._id]?.keterangan || ""} onChange={e => handleAbsenChange(s._id, "keterangan", e.target.value)} disabled={absensiData[s._id]?.status === "Hadir"} className={`w-full min-w-0 border rounded-lg outline-none text-xs p-2.5 transition-colors ${absensiData[s._id]?.status === "Hadir" ? "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed font-medium" : "bg-white border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"}`} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </motion.div>
            )}
        </div>
    );
}