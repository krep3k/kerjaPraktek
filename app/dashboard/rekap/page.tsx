"use client";

import React, { useState, useEffect } from "react";
import { getStudentsFiltered, getAbsensiRecord, getGNilaiRecord } from "@/components/lib/actions";
import { Download, CheckSquare, BookOpen } from "lucide-react";
import { getMataPelajaranByKelas, getRombelByKelas } from "@/components/lib/constants";

interface Student {
    _id: string;
    nis: string;
    name: string;
}

interface AbsensiRecord {
    studentId: string;
    status: string;
    keterangan?: string;
}

interface NilaiRecord {
    studentId: string;
    nilai: string;
}

interface TableRow {
    no: number;
    nis: string;
    nama: string;
    status?: string;
    keterangan?: string;
    nilai?: string;
}

export default function RekapDataPage() {
    const [activeTab, setActiveTab] = useState("absensi");
    const [kelas, setKelas] = useState<number>(1);
    const [rombel, setRombel] = useState<string>("A");
    const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
    const [semester, setSemester] = useState("Ganjil");
    const [mapel, setMapel] = useState("Matematika");
    const [jenisNilai, setJenisNilai] = useState("Ulangan Harian");
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [loading, setLoading] = useState(false);
    const rombelOption = getRombelByKelas(kelas);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const students: Student[] = await getStudentsFiltered(kelas, rombel);
                let mergedData: TableRow[] = [];
                if(activeTab === "absensi") {
                    const records: AbsensiRecord[] = await getAbsensiRecord(kelas, rombel, tanggal);
                    mergedData = students.map((s: Student, index: number) => {
                        const record = records.find((r: AbsensiRecord) => r.studentId === s._id );
                        return {
                            no: index + 1,
                            nis: s.nis,
                            nama: s.name,
                            status: record ? record.status : "Belum Diisi",
                            keterangan: record && record.keterangan ? record.keterangan : "-"
                        };
                    });
                } else {
                    const records: NilaiRecord[] = await getGNilaiRecord(kelas, rombel, semester, mapel, jenisNilai, tanggal);
                    mergedData = students.map((s: Student, index: number) => {
                        const record = records.find((r: NilaiRecord) => r.studentId === s._id);
                        return {
                            no: index + 1,
                            nis: s.nis,
                            nama: s.name,
                            nilai: record ? record.nilai : "Belum Diisi"
                        };
                    });
                }
                setTableData(mergedData);
            } catch (error) {
                console.error("Gagal memuat data:", error);
            }
            setLoading(false);
        };
        loadData();
    }, [activeTab, kelas, rombel, tanggal, semester, mapel, jenisNilai]);

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

    const downloadCSV = () => {
        if(tableData.length === 0) {
            alert("Tidak ada data untuk diunduh!");
            return;
        }

        let headers = [];
        let rows = [];
        let filename = "";

        if(activeTab === "absensi") {
            headers = ["NO", "NIS", "NAMA SISWA", "STATUS", "KETERANGAN"];
            rows = tableData.map(row => `${row.no},${row.nis},"${row.nama}",${row.status},"${row.keterangan}"`);
            filename = `Rekap_Absensi_Kelas_${kelas}${rombel}_${tanggal}.csv`;
        } else {
            headers = ["NO", "NIS", "NAMA SISWA", "NILAI"];
            rows = tableData.map(row => `${row.no},${row.nis},"${row.nama}",${row.nilai}`);
            filename = `Rekap_Nilai_${mapel}_${jenisNilai}_Tanggal_${tanggal}_Kelas_${kelas}${rombel}_${semester}.csv`;
        }

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Recap laporan siswa
                </h1>
                <button title="download" onClick={downloadCSV} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm">
                    <Download className="w-5 h-5"></Download>Download SpreadSheet (CSV)
                </button>
            </div>
            <div className="flex gap-4 border-b">
                <button title="absensi" onClick={() => setActiveTab("absensi")} className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === "absensi" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    <CheckSquare className="w-5 h-5 text-black"></CheckSquare>Data Absensi
                </button>
                <button title="nilai" onClick={() => setActiveTab("nilai")} className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === "nilai" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    <BookOpen className="w-5 h-5 text-black"></BookOpen>Data Nilai
                </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border flex flex-wrap gap-4 items-end">
                <div className="w-32">
                    <label htmlFor="kelas" className="block text-sm font-semibold text-blue-700 mb-1">
                        Kelas
                    </label>
                    <select name="kelas" id="kelas" value={kelas} onChange={handleKelasChange} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {[1, 2, 3, 4, 5, 6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                </div>
                <div className="w-32">
                    <label htmlFor="rombel" className="block text-sm font-semibold text-blue-700 mb-1">Rombel</label>
                    <select name="rombel" id="rombel" value={rombel} onChange={e => setRombel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                        {rombelOption.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="w-48">
                    <label htmlFor="date" className="block text-sm font-semibold text-blue-700 mb-1">Tanggal</label>
                    <input id="date" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium" />
                </div>
                {activeTab === "nilai" && (
                    <>
                        <div className="w-40">
                            <label htmlFor="semester" className="block text-sm font-semibold mb-1 text-gray-700">Semester</label>
                            <select name="semester" id="semester" value={semester} onChange={e => setSemester(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                        </div>
                        <div className="w-48">
                            <label htmlFor="mapel" className="block text-sm font-semibold mb-1 text-gray-700">Mata Pelajaran</label>
                            <select name="mapel" id="mapel" value={mapel} onChange={e => setMapel(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                                <option value="Matematika">Matematika</option>
                                <option value="BI">Bahasa Indonesia</option>
                                <option value="IPA">IPA</option>
                            </select>
                        </div>
                        <div className="w-48">
                            <label htmlFor="nilai" className="block text-sm font-semibold mb-1 text-gray-700">Jenis Nilai</label>
                            <select name="nilai" id="nilai" value={jenisNilai} onChange={e => setJenisNilai(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                                <option value="Tugas">Tugas</option>
                                <option value="UH">Ulangan Harian</option>
                                <option value="UTS">UTS</option>
                                <option value="UAS">UAS</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
            {loading ? (
                <div className="text-center p-10 text-gray-500 font-medium animate-pulse">Memuat data...</div>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3 w-16 text-center">No</th>
                                <th className="p-3 w-32">NIS</th>
                                <th className="p-3 ">Nama Siswa</th>
                                {activeTab === "absensi" ? (
                                    <>
                                        <th className="p-3 w-32 text-center">Status</th>
                                        <th className="p-3">Keterangan</th>
                                    </>
                                ) : (
                                    <th className="p-3 w-32 text-center">Nilai</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length > 0 ? tableData.map((row) => (
                                <tr key={row.nis} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-center">{row.no}</td>
                                    <td className="p-3 text-gray-600 tabular-nums">{row.nis}</td>
                                    <td className="p-3 font-medium">{row.nama}</td>
                                    {activeTab === "absensi" ? (
                                        <>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Hadir' ? 'bg-green-100 text-green-700' : row.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' : row.status === 'Izin' ? 'bg-blue-100 text-blue-700' : row.status === 'Alpha' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600 italic">{row.keterangan}</td>
                                        </>
                                    ) : (
                                        <td className="p-3 text-center">
                                            <span className={`font-bold ${row.nilai === 'Belum diisi' ? 'text-gray-400 text-xs' : 'text-blue-700 text-base'}`}>
                                                {row.nilai}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-500">Tidak ada data siswa ditemukan untuk kelas ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}