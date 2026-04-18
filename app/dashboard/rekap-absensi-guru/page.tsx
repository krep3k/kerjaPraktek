/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { getTeacherAttendanceRecap } from "@/components/lib/actions";
import { Download, Search } from "lucide-react";

export default function RekapAbsensiGuru() {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [data, setData] = useState<any[]>([]);

    const handleSearch = async () => {
        if(!start || !end) {
            return alert("Pilih rentan tanggal!");
        }
        const res = await getTeacherAttendanceRecap(start, end);
        setData(res);
    }

    const exportToCSV = () => {
        if(data.length === 0) return;
        const headers = ["Tanggal,ID Guru,Nama,Jabatan,Status,Catatan\n"];
        const rows = data.map(i => {
            const date = new Date(i.date).toLocaleDateString();
            return `${date},${i.userId?.idGuru},${i.userId?.name},${i.userId?.jabatan},${i.status},${i.notes}\n`;
        });
        const blob = new Blob([headers + rows.join("")], {type: "text/csv"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Rekap_Absensi_Guru_${start}_ke_${end}.csv`;
        a.click();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Rekap Absensi Guru</h1>
            <div className="flex flex-wrap gap-4 bg-white p-6 rounded-2xl border mb-6 shadow-sm items-end">
                <div>
                    <label htmlFor="tanggalAwal" className="block text-xs font-bold mb-1 text-slate-500 uppercase">Dari Tanggal</label>
                    <input type="date" id="tanggalAwal" value={start} onChange={e => setStart(e.target.value)} className="border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="tanggalAkhir" className="block text-xs font-bold mb-1 text-slate-500 uppercase">Sampai Tanggal</label>
                    <input type="date" id="tanggalAkhir" value={end} onChange={e => setEnd(e.target.value)} className="border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700"><Search className="w-4 h-4"/>Cari</button>
                <button onClick={exportToCSV} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 ml-auto"><Download className="w-4 h-4"/>Download CSV</button>
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b font-bold text-slate-600">
                        <tr>
                            <td className="px-6 py-4">Tanggal</td>
                            <td className="px-6 py-4">Nama Guru</td>
                            <td className="px-6 py-4 text-center">Status</td>
                            <td className="px-6 py-4">Keterangan</td>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.length === 0 ? <tr><td colSpan={4} className="p-10 text-center text-slate-400">Belum ada data, silahkan cari berdasarkan tanggal</td></tr> : data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                <td className="px-6 py-4 font-bold">{item.userId?.name} <span className="block text-[10px] font-normal text-slate-400">{item.userId?.jabatan}</span></td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 italic text-slate-500">{item.notes || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}