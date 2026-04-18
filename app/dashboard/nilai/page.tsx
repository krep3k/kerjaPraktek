/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { getGNilaiRecord, saveBulkNilai, getStudentsFiltered } from "@/components/lib/actions";
import { getMataPelajaranByKelas } from "@/components/lib/constants";
import { Save } from "lucide-react";
import { getRombelByKelas } from "@/components/lib/constants";

export default function RekapNilaiPage() {
    const [kelas, setKelas] = useState<number>(1);
    const [rombel, setRombel] = useState<string>("A");
    const [semester, setSemester] = useState<string>("Ganjil");
    const [mapel, setMapel] = useState<string>("Matematika");
    const [jenisNilai, setJenisNilai] = useState("Ulangan Harian");
    const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [nilaiData, setNilaiData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const mapelOption = getMataPelajaranByKelas(kelas).semuaMapel;
    const rombelOption = getRombelByKelas(kelas);
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const studentList = await getStudentsFiltered(kelas, rombel);
            setStudents(studentList);
            const records = await getGNilaiRecord(kelas, rombel, semester, mapel, jenisNilai, tanggal);
            const recordMap: any = {};
            studentList.forEach((s: any) => {recordMap[s._id] = 0;});
            records.forEach((r: any) => {recordMap[r.studentId] = r.nilai;});
            setNilaiData(recordMap);
            setLoading(false);
        };
        loadData();
    }, [kelas, rombel, semester, mapel, jenisNilai, tanggal]);

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
            nilai: Number(nilaiData[s._id]) || 0
        }));
        const res = await saveBulkNilai(dataToSave, kelas, rombel, semester, mapel, jenisNilai, tanggal);
        if(res.error){
            alert("Gagal menyimpan data:" + res.error);
        } else {
            alert(`Data nilai ${jenisNilai} tanggal ${tanggal} berhasil disimpan!`);
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Record input nilai</h1>
                <button title="save" onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Save className="w-5 h-5">Simpan Nilai</Save>
                </button>
            </div>
            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl border mb-6">
                <div className="block text-sm font-semibold text-blue-700 mb-1">Kelas
                    <label htmlFor="">
                        <select title="kelas" name="" id="" value={kelas} onChange={handleKelasChange} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                            {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">Rombel
                    <label htmlFor="">
                        <select title="rombel" name="" id="" value={rombel} onChange={e => setRombel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                            {rombelOption.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">Semester
                    <label htmlFor="">
                        <select title="semester" name="" id="" value={semester} onChange={e => setSemester(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </label>
                </div>
                <div className="block text-sm font-semibold text-blue-700 mb-1">Mata Pelajaran
                    <select title="mapel" name="mapel" id="mapel" value={mapel} onChange={e => setMapel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {mapelOption.map(m => (
                            <option value={m} key={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="" className="block text-sm font-semibold text-blue-700 mb-1">Jenis Penilaian
                        <select name="" id="" value={jenisNilai} onChange={e => setJenisNilai(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                            <option value="Tugas">Tugas</option>
                            <option value="UH">Ulangan Harian</option>
                            <option value="UTS">UTS</option>
                            <option value="UAS">UAS</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-blue-700 mb-1">Tanggal</label>
                    <input id="date" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium" />
                </div>
            </div>

            {loading ? <div className="text-center p-10">Memuat data...</div> : (
                <table className="w-full text-left text-sm border-collapse mt-4">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3 w-16">No</th>
                            <th className="p-3">Nama</th>
                            <th className="p-3 w-48 text-center">Input Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, idx) => (
                            <tr key={s._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-medium">{s.name}</td>
                                <td className="p-3 text-center">
                                    <label htmlFor="nilai"></label>
                                    <input id="nilai" type="number" min={0} max={100} value={nilaiData[s._id] || ""} onChange={e => setNilaiData({...nilaiData, [s._id]: e.target.value})} className="w-24 text-center border p-1 rounded-md font-bold text-blue-600 focus:ring-2 focus:ring-blue-500" placeholder="Nilai" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}