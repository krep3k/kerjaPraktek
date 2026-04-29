/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {useState, useEffect} from "react";
import { useSession } from "next-auth/react";
import { UploadDropZone } from "@/components/lib/uploadthing";
import { simpanDataGudang, getGudangDataGuru, deleteDataGudang, getTeacher } from "@/components/lib/actions";
import { FileText, Image as ImageIcon, Trash2, Download, CloudUpload, UploadCloud, X, Folder, ChevronLeft, Search } from "lucide-react";

export default function GudangDataPage() {
    const {data: session} = useSession();

    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;
    const [files, setFiles] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if(userRole === "admin") {
            const loadTeacher = async () => {
                const data = await getTeacher();
                setTeachers(data);
            };
            loadTeacher();
        }
    }, [userRole]);

    useEffect (() => {
        const fetchFile = async () => {
            let idToFetch = null;
            if(userRole === "admin") {
                idToFetch = selectedTeacher?._id;
            } else {
                idToFetch = userId;
            }
            if(idToFetch) {
                setLoading(true);
                const data = await getGudangDataGuru(idToFetch);
                setFiles(data);
                setLoading(false);
            } else {
                setFiles([]);
            }
        };
        fetchFile();
    }, [userRole, userId, selectedTeacher, refreshKey]);

    const handleDelete = async (fileId: string) => {
        if(confirm("Yakin ingin menghapus file ini?")) {
            await deleteDataGudang(fileId);
            setRefreshKey(prev => prev + 1);
        }
    };

    const filteredTeachers = teachers.filter(t => t.name.toLowerCase(). includes(searchQuery.toLowerCase()));

    if(userRole === "admin" && !selectedTeacher) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gudang Data</h1>
                </div>
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <label htmlFor="search"></label>
                    <input type="text" id="search" placeholder="Cari nama guru" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <button key={teacher._id} onClick={() => setSelectedTeacher(teacher)} className="group flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10 transition-all active:scale-95">
                            <div className="relative mb-4">
                                <Folder size={64} className="text-blue-100 fill-blue-50 group-hover:text-blue-500 group-hover:fill-blue-500/10 transition-colors"/>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter group-hover:text-blue-600">
                                        Open
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-700 text-center line-clamp-2">{teacher.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{teacher.role}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {userRole === "admin" && (
                        <button title="back" onClick={() => setSelectedTeacher(null)} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
                            <ChevronLeft size={24}/>
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            {userRole === "admin" ? `Folder: ${selectedTeacher.name}` : `Gudang Data Pribadi`}
                        </h1>
                    </div>
                </div>
                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <UploadCloud size={20}/>
                    <span>Upload ke {userRole === "admin" ? "Sini" : "Gudang"}</span>
                </button>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-400">Menarik data dari brangkas...</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                        <CloudUpload className="mx-auto h-16 w-16 text-slate-200 mb-4"/>
                        <p className="text-slate-500 font-bold">Belum ada file di folder ini</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files.map((file) => (
                            <div key={file._id} className="flex items-center p-5 bg-white border border-slate-100 rounded-3xl group hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mr-4 shrink-0">
                                    {["png", "jpg", "jpeg"].includes(file.typeFile?.toLowerCase()) ? <ImageIcon size={28}/> : <FileText size={28} />}
                                </div>
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="font-black text-slate-800 truncate" title={file.namaFile}>{file.namaFile}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                        {(file.ukuranFile / 1024 / 1024).toFixed(2)} MB • {file.typeFile}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a title="download" href={file.urlFile} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                        <Download size={18}/>
                                    </a>
                                    <button title="delete" onClick={() => handleDelete(file._id)} className="p-2.5 bg-slate-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-md p-4">
                    <div className="bg-white rounded-[3rem] p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button title="close" onClick={() => setIsUploadModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={24}/>
                        </button>
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Upload File</h3>
                            <p className="text-slate-500 font-medium">
                                Mengunggah ke folder: <span className="text-blue-600 font-bold">{selectedTeacher.name}</span>
                            </p>
                        </div>
                        <UploadDropZone endpoint="guruUploader" onClientUploadComplete={async (res) => {
                            if(res && res.length > 0){
                                const uploadedFile = res[0];
                                await simpanDataGudang({
                                    namaFile: uploadedFile.name,
                                    urlFile: uploadedFile.url,
                                    typeFile: uploadedFile.name.split(".").pop() || "unknow",
                                    ukuranFile: uploadedFile.size,
                                    pemilikId: selectedTeacher?._id || userId
                                });
                                setIsUploadModalOpen(false);
                                setRefreshKey(prev => prev + 1);
                            }
                        }}
                        appearance={{
                            button: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl mt-6 w-full max-w-xs transition-colors relative z-50",
                            container: "w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 rounded-[2rem] py-12 px-6 transition-all cursor-pointer group relative",
                            allowedContent: "text-slate-500 text-xs font-medium mt-2 pointer-events-none",
                            label: "text-blue-700 font-black text-lg cursor-pointer hover:text-blue-800 z-10",
                            uploadIcon: "text-blue-500 w-16 h-16 mb-4 pointer-events-none group-hover:scale-110 transition-transform duration-300",
                        }}/>
                    </div>
                </div>
            )}
        </div>
    );
}