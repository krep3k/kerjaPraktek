/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getAbsensiRecord, saveBulkAbsensi, getStudentsFiltered } from "@/components/lib/actions";
import { Save } from "lucide-react";
import { getRombelByKelas } from "@/components/lib/constants";
import { getMataPelajaranByKelas } from "@/components/lib/constants";

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
        setAbsensiData({...absensiData, [id]: {...absensiData[id], [field]: value}});
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
        const dataToSave = students.map(s => ({
            studentId: s._id,
            status: absensiData[s._id].status,
            keterangan: absensiData[s._id].keterangan
        }));
        const res = await saveBulkAbsensi(dataToSave, kelas, rombel, tanggal);
        if(res.error) {
            alert("Gagal menyimpan data:" + res.error);
        } else {
            alert("Data absensi berhasil disimpan!");
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
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3 w-16">No</th>
                            <th className="p-3">Nama Siswa</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, idx) => (
                            <tr key={s._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-medium">{s.name}</td>
                                <td className="p-3 text-center">
                                    <select title="absensi" name="" id="" value={absensiData[s._id]?.status || "Hadir"} onChange={e => handleAbsenChange(s._id, "status", e.target.value)} className={`border px-2.5 py-1.5 rounded-md font-semibold text-xs uppercase ${ absensiData[s._id]?.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : absensiData[s._id]?.status === 'Sakit' ? 'bg-amber-100 text-amber-700 border-amber-200' : absensiData[s._id]?.status === 'Izin' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                        <option value="Hadir">Hadir</option>
                                        <option value="Sakit">Sakit</option>
                                        <option value="Izin">Izin</option>
                                        <option value="Alpha">Alpha</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <label htmlFor="ket"></label>
                                    <input id="ket" type="text" placeholder="Isi alasan jika tidak hadir..." value={absensiData[s._id]?.keterangan || ""} onChange={e => handleAbsenChange(s._id, "keterangan", e.target.value)} disabled={absensiData[s._id]?.status === "Hadir"} className="w-full border p-1 rounded-md disabled:bg-gray-100 disabled:placeholder-transparent" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}