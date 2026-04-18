/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { getTeacherWithClass, saveTeacherAttendance } from "@/components/lib/actions";
import { Save } from "lucide-react";

export default function AbsensiGuruPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await getTeacherWithClass();
            setTeachers(data);
            const initial: any = {};
            data.forEach((t: any) => {initial[t._id] = {status: "hadir", notes: ""};});
            setAttendance(initial);
        };
        load();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        const payload = Object.keys(attendance).map(id => ({
            userId: id,
            status: attendance(id).status,
            notes: attendance(id).notes,
        }));
        await saveTeacherAttendance(payload, date);
        setLoading(false);
        alert("Absensi Berhasil Disimpan");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Absensi Guru</h1>
                <div className="flex items-center gap-3">
                    <label htmlFor="date">Tanggal</label>
                    <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded-xl text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                        <Save className="w-4 h-4">{loading ? "Menyimpan..." : "Simpan Absensi"}</Save>
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b text-slate-600 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">ID Guru</th>
                            <th className="px-6 py-4">Nama Guru</th>
                            <th className="px-6 py-4 text-center">Status Kehadiran</th>
                            <th className="px-6 py-4">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {teachers.map(t => (
                            <tr key={t._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-slate-500">{t.idGuru || ""}</td>
                                <td className="px-6 py-4 font-bold text-slate-800">{t.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-1.5">
                                        {[
                                            { id: "hadir", label: "Hadir", activeClass: "bg-emerald-500 text-white border-emerald-600 shadow-sm" },
                                            { id: "izin", label: "Izin", activeClass: "bg-blue-500 text-white border-blue-600 shadow-sm" },
                                            { id: "sakit", label: "Sakit", activeClass: "bg-amber-500 text-white border-amber-600 shadow-sm" },
                                            { id: "alpa", label: "Alpa", activeClass: "bg-rose-500 text-white border-rose-600 shadow-sm" },
                                        ].map(s => {
                                            const isActive = attendance[t._id]?.status === s.id;
                                            return (
                                                <button key={s.id} onClick={() => {
                                                    const newNotes = s.id === "hadir" ? "" : attendance[t._id]?.notes;
                                                        setAttendance({...attendance, [t._id]: {...attendance[t._id], status: s.id, notes: newNotes}});
                                                }} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${isActive ? s.activeClass : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                                                    {s.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <label htmlFor="notes"></label>
                                    <input type="text" id="notes" name="notes" placeholder={attendance[t._id]?.status === "hadir" ? "Tidak perlu catatan" : "Tulis alasan..."} value={attendance[t._id]?.notes || ""} onChange={e => setAttendance({...attendance, [t._id]: {...attendance[t._id], notes: e.target.value}})} disabled={attendance[t._id]?.status === "hadir"} className={`w-full border rounded-lg outline-none text-xs p-2.5 transition-colors ${attendance[t._id]?.status === "hadir" ? "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed font-medium" : "bg-white border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"}`} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}