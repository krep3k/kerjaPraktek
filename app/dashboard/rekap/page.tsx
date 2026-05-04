"use client";

import React, { useState, useEffect } from "react";
import { getStudentsFiltered, getAbsensiRecord, getGNilaiRecord, getStudentAttendanceMonthlyRecap, getStudentNilaiMonthlyRecap } from "@/components/lib/actions";
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
    nilai?: number;
    nilaiEkskul?: string;
    tanggal?: string;
}

interface TableRow {
    no: number;
    nis: string;
    nama: string;
    status?: string;
    keterangan?: string;
    nilai?: string;
    hadir?: number;
    sakit?: number;
    izin?: number;
    alpha?: number;
}

export default function RekapDataPage() {
    const [activeTab, setActiveTab] = useState("absensi");
    const [kelas, setKelas] = useState<number>(1);
    const [rombel, setRombel] = useState<string>("A");
    const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
    const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
    const [reportPeriod, setReportPeriod] = useState<"daily" | "monthly">("daily");
    const [semester, setSemester] = useState("Ganjil");
    const [mapel, setMapel] = useState("Matematika");
    const [jenisNilai, setJenisNilai] = useState("Ulangan Harian");
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [loading, setLoading] = useState(false);
    const rombelOption = getRombelByKelas(kelas);
    const mataPelajaranOption = getMataPelajaranByKelas(kelas);
    const isEkskulMapel = mataPelajaranOption.ekskul.includes(mapel);
    const monthOptions = [
        { value: "01", label: "Januari" },
        { value: "02", label: "Februari" },
        { value: "03", label: "Maret" },
        { value: "04", label: "April" },
        { value: "05", label: "Mei" },
        { value: "06", label: "Juni" },
        { value: "07", label: "Juli" },
        { value: "08", label: "Agustus" },
        { value: "09", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" }
    ];
    const yearOptions = [
        new Date().getFullYear() - 1,
        new Date().getFullYear(),
        new Date().getFullYear() + 1
    ];

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const students: Student[] = await getStudentsFiltered(kelas, rombel);
                let mergedData: TableRow[] = [];
                if(activeTab === "absensi") {
                    if (reportPeriod === "daily") {
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
                        const records: AbsensiRecord[] = await getStudentAttendanceMonthlyRecap(kelas, rombel, monthYear);
                        const counts = records.reduce((acc: Record<string, { hadir: number; sakit: number; izin: number; alpha: number }>, record) => {
                            const studentId = String(record.studentId);
                            if (!acc[studentId]) {
                                acc[studentId] = { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
                            }
                            if (record.status === "Hadir") acc[studentId].hadir += 1;
                            else if (record.status === "Sakit") acc[studentId].sakit += 1;
                            else if (record.status === "Izin") acc[studentId].izin += 1;
                            else acc[studentId].alpha += 1;
                            return acc;
                        }, {} as Record<string, { hadir: number; sakit: number; izin: number; alpha: number }>);

                        mergedData = students.map((s: Student, index: number) => {
                            const studentCounts = counts[s._id] || { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
                            return {
                                no: index + 1,
                                nis: s.nis,
                                nama: s.name,
                                hadir: studentCounts.hadir,
                                sakit: studentCounts.sakit,
                                izin: studentCounts.izin,
                                alpha: studentCounts.alpha
                            };
                        });
                    }
                } else {
                    const jenisForQuery = isEkskulMapel ? "ekskul" : jenisNilai;
                    if (reportPeriod === "daily") {
                        const records: NilaiRecord[] = await getGNilaiRecord(kelas, rombel, semester, mapel, jenisForQuery, tanggal);
                        mergedData = students.map((s: Student, index: number) => {
                            const record = records.find((r: NilaiRecord) => r.studentId === s._id);
                            const nilaiDisplay = record ? (isEkskulMapel ? record.nilaiEkskul : record.nilai?.toString()) : "Belum Diisi";
                            return {
                                no: index + 1,
                                nis: s.nis,
                                nama: s.name,
                                nilai: nilaiDisplay
                            };
                        });
                    } else {
                        const records: NilaiRecord[] = await getStudentNilaiMonthlyRecap(kelas, rombel, semester, mapel, jenisForQuery, monthYear);
                        const grouped = records.reduce((acc: Record<string, NilaiRecord[]>, record) => {
                            const studentId = String(record.studentId);
                            acc[studentId] = acc[studentId] || [];
                            acc[studentId].push(record);
                            return acc;
                        }, {} as Record<string, NilaiRecord[]>);

                        mergedData = students.map((s: Student, index: number) => {
                            const studentRecords = grouped[s._id] || [];
                            let nilaiDisplay = "Belum Diisi";

                            if (studentRecords.length > 0) {
                                if (isEkskulMapel) {
                                    const latest = studentRecords.sort((a, b) => (a.tanggal || "").localeCompare(b.tanggal || ""))[studentRecords.length - 1];
                                    nilaiDisplay = latest.nilaiEkskul || "Belum Diisi";
                                } else {
                                    const numericRecords = studentRecords.filter(r => typeof r.nilai === "number");
                                    const average = numericRecords.reduce((sum, r) => sum + (r.nilai || 0), 0) / Math.max(numericRecords.length, 1);
                                    nilaiDisplay = numericRecords.length > 0 ? average.toFixed(1) : "Belum Diisi";
                                }
                            }

                            return {
                                no: index + 1,
                                nis: s.nis,
                                nama: s.name,
                                nilai: nilaiDisplay
                            };
                        });
                    }
                }
                setTableData(mergedData);
            } catch (error) {
                console.error("Gagal memuat data:", error);
            }
            setLoading(false);
        };
        loadData();
    }, [activeTab, kelas, rombel, tanggal, monthYear, reportPeriod, semester, mapel, jenisNilai, isEkskulMapel]);

    const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const kelasBaru = Number(e.target.value);
        setKelas(kelasBaru);
        const daftarMapelBaru = getMataPelajaranByKelas(kelasBaru).semuaMapel;
        if(!daftarMapelBaru.includes(mapel)) {
            setMapel(daftarMapelBaru[0] || "");
        }
        const daftarRombelBaru = getRombelByKelas(kelasBaru);
        if(!daftarRombelBaru.includes(rombel)) {
            setRombel(daftarRombelBaru[0] || "");
        }
    };

    const handleMapelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mapelBaru = e.target.value;
        setMapel(mapelBaru);

        const mataPelajaranBaru = getMataPelajaranByKelas(kelas);
        if (mataPelajaranBaru.ekskul.includes(mapelBaru)) {
            setJenisNilai("ekskul");
        } else if (jenisNilai === "ekskul") {
            setJenisNilai("Ulangan Harian");
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
            if (reportPeriod === "daily") {
                headers = ["NO", "NIS", "NAMA SISWA", "STATUS", "KETERANGAN"];
                rows = tableData.map(row => `${row.no},${row.nis},"${row.nama}",${row.status},"${row.keterangan}"`);
                filename = `Rekap_Absensi_Kelas_${kelas}${rombel}_${tanggal}.csv`;
            } else {
                headers = ["NO", "NIS", "NAMA SISWA", "HADIR", "SAKIT", "IZIN", "ALPHA"];
                rows = tableData.map(row => `${row.no},${row.nis},"${row.nama}",${row.hadir},${row.sakit},${row.izin},${row.alpha}`);
                filename = `Rekap_Absensi_Bulanan_Kelas_${kelas}${rombel}_${monthYear}.csv`;
            }
        } else {
            headers = ["NO", "NIS", "NAMA SISWA", "NILAI"];
            rows = tableData.map(row => `${row.no},${row.nis},"${row.nama}",${row.nilai}`);
            if (reportPeriod === "daily") {
                const jenisDisplay = isEkskulMapel ? `ekskul ${mapel}` : jenisNilai;
                filename = `Rekap_Nilai_${mapel}_${jenisDisplay}_Tanggal_${tanggal}_Kelas_${kelas}${rombel}_${semester}.csv`;
            } else {
                const jenisDisplay = isEkskulMapel ? `ekskul ${mapel}` : jenisNilai;
                filename = `Rekap_Nilai_Bulanan_${mapel}_${jenisDisplay}_Bulan_${monthYear}_Kelas_${kelas}${rombel}_${semester}.csv`;
            }
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
                    Rekapitulasi laporan siswa
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
                <div className="w-40">
                    <label className="block text-sm font-semibold text-blue-700 mb-1">Periode</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setReportPeriod("daily")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${reportPeriod === "daily" ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}>
                            Harian
                        </button>
                        <button type="button" onClick={() => setReportPeriod("monthly")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${reportPeriod === "monthly" ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}>
                            Bulanan
                        </button>
                    </div>
                </div>
                <div className="w-48">
                    <label htmlFor={reportPeriod === "daily" ? "date" : "month"} className="block text-sm font-semibold text-blue-700 mb-1">{reportPeriod === "daily" ? "Tanggal" : "Bulan"}</label>
                    {reportPeriod === "daily" ? (
                        <input id="date" title="Tanggal" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium" />
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                id="month"
                                title="Bulan"
                                value={monthYear.slice(5)}
                                onChange={e => setMonthYear(`${monthYear.slice(0, 4)}-${e.target.value}`)}
                                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium"
                            >
                                {monthOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <select
                                id="year"
                                title="Tahun"
                                value={monthYear.slice(0, 4)}
                                onChange={e => setMonthYear(`${e.target.value}-${monthYear.slice(5)}`)}
                                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}
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
                            <select name="mapel" id="mapel" value={mapel} onChange={handleMapelChange} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                                {mataPelajaranOption.mapelGuruKelas.map(m => (
                                    <option value={m} key={m}>{m}</option>
                                ))}
                                {mataPelajaranOption.mapelBidangStudi.map(m => (
                                    <option value={m} key={m}>{m}</option>
                                ))}
                                {mataPelajaranOption.ekskul.map(m => (
                                    <option value={m} key={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-48">
                            <label htmlFor="nilai" className="block text-sm font-semibold mb-1 text-gray-700">Jenis Nilai</label>
                            {isEkskulMapel ? (
                                <input
                                    id="jenisNilaiText"
                                    title="Jenis nilai ekskul"
                                    type="text"
                                    value="Ekstrakurikuler"
                                    disabled
                                    className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
                                />
                            ) : (
                                <select name="nilai" id="nilai" value={jenisNilai} onChange={e => setJenisNilai(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm text-gray-700 font-medium">
                                    <option value="Tugas">Tugas</option>
                                    <option value="Ulangan Harian">Ulangan Harian</option>
                                    <option value="UTS">UTS</option>
                                    <option value="UAS">UAS</option>
                                </select>
                            )}
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
                                    reportPeriod === "daily" ? (
                                        <>
                                            <th className="p-3 w-32 text-center">Status</th>
                                            <th className="p-3">Keterangan</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-3 w-24 text-center">Hadir</th>
                                            <th className="p-3 w-24 text-center">Sakit</th>
                                            <th className="p-3 w-24 text-center">Izin</th>
                                            <th className="p-3 w-24 text-center">Alpha</th>
                                        </>
                                    )
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
                                        reportPeriod === "daily" ? (
                                            <>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Hadir' ? 'bg-green-100 text-green-700' : row.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' : row.status === 'Izin' ? 'bg-blue-100 text-blue-700' : row.status === 'Alpha' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600 italic">{row.keterangan}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3 text-center font-semibold text-emerald-700">{row.hadir ?? 0}</td>
                                                <td className="p-3 text-center font-semibold text-amber-700">{row.sakit ?? 0}</td>
                                                <td className="p-3 text-center font-semibold text-blue-700">{row.izin ?? 0}</td>
                                                <td className="p-3 text-center font-semibold text-rose-700">{row.alpha ?? 0}</td>
                                            </>
                                        )
                                    ) : (
                                        <td className="p-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-md font-bold text-xs uppercase ${
                                                row.nilai === 'Belum Diisi' 
                                                  ? 'bg-gray-100 text-gray-500' 
                                                  : isEkskulMapel
                                                    ? row.nilai === 'A' 
                                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                      : row.nilai === 'B'
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    : parseInt(row.nilai as string) < 50
                                                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                      : parseInt(row.nilai as string) < 80
                                                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}>
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