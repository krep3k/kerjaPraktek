/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UploadDropZone } from "@/components/lib/uploadthing";
import { simpanDataGudang, getGudangDataGuru, deleteDataGudang, getTeacher, getStorageStats, getTeacherAndKepsekForTu } from "@/components/lib/actions";
import { FileText, Image as ImageIcon, Trash2, Download, CloudUpload, X, Folder, ChevronLeft, Search, AlertTriangle, HardDrive, PlusCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_STORAGE = 2 * 1024 * 1024 * 1024;

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
    const [totalUsedStorage, setTotalUsedStorage] = useState(0);

    // --- STATE ANIMASI HAPUS FILE (Tong Sampah) ---
    const [deleteStage, setDeleteStage] = useState<"idle" | "dialog" | "loading" | "taking" | "toast">("idle");
    const [deleteStatus, setDeleteStatus] = useState<"success" | "error">("success");
    const [targetToDelete, setTargetToDelete] = useState<string | null>(null);

    // --- STATE ANIMASI OVERLAY KUSTOM (Upload & Peringatan) ---
    const [overlayStage, setOverlayStage] = useState<"idle" | "loading" | "toast">("idle");
    const [overlayStatus, setOverlayStatus] = useState<"success" | "warning" | "error">("success");
    const [overlayTitle, setOverlayTitle] = useState("");
    const [overlayMsg, setOverlayMsg] = useState("");

    // --- TRANSISI KUSTOM BEZIER CURVE ---
    const smoothTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };
    const fadeScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const formatBytes = (bytes: number) => {
        if(bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    useEffect(() => {
        if(userRole === "admin") {
            const loadTeacher = async () => {
                const data = await getTeacher();
                setTeachers(data);
            };
            loadTeacher();
        } else if(userRole === "tu") {
            const loadTeacherAndKepsek = async () => {
                const data = await getTeacherAndKepsekForTu();
                setTeachers(data);
            };
            loadTeacherAndKepsek();
        }
    }, [userRole]);

    useEffect (() => {
        const fetchFile = async () => {
            const usedBytes = await getStorageStats();
            setTotalUsedStorage(usedBytes);
            let idToFetch = null;
            if(userRole === "admin" || userRole === "tu") {
                idToFetch = selectedTeacher?._id || userId;
            } else {
                idToFetch = userId;
            }
            if(idToFetch) {
                setLoading(true);
                const data = await getGudangDataGuru(idToFetch);
                setFiles(data || []);
                setLoading(false);
            } else {
                setFiles([]);
            }
        };
        fetchFile();
    }, [userRole, userId, selectedTeacher, refreshKey]);

    // --- HELPER TOAST ---
    const showToast = (status: "success" | "warning" | "error", title: string, msg: string) => {
        setOverlayStatus(status);
        setOverlayTitle(title);
        setOverlayMsg(msg);
        setOverlayStage("toast");
        setTimeout(() => setOverlayStage("idle"), 3500);
    };

    // --- HANDLER HAPUS DATA ---
    const handleDeleteClick = (fileId: string) => {
        setTargetToDelete(fileId);
        setDeleteStage("dialog");
    };

    const confirmDelete = async () => {
        if (!targetToDelete) return;
        setDeleteStage("loading"); // Tong sampah muncul

        try {
            await deleteDataGudang(targetToDelete);
            setRefreshKey(prev => prev + 1);
            setDeleteStatus("success");
            setDeleteStage("taking"); // Tong sampah diambil
            setTimeout(() => setDeleteStage("toast"), 1500);
        } catch(error) {
            console.error("Gagal menghapus file: ", error);
            setDeleteStatus("error");
            setDeleteStage("toast");
        }

        setTimeout(() => {
            setDeleteStage("idle");
            setTargetToDelete(null);
        }, 4500);
    };

    const filteredTeachers = teachers.filter(t => t.name.toLowerCase(). includes(searchQuery.toLowerCase()));
    const percentUsed = Math.min((totalUsedStorage / MAX_STORAGE) * 100, 100);
    
    let barColor = "bg-emerald-500";
    let textColor = "text-emerald-700";
    if(percentUsed > 90) {
        barColor = "bg-red-500";
        textColor = "text-red-700";
    } else if (percentUsed > 70) {
        barColor = "bg-amber-500";
        textColor = "text-amber-700";
    }

    const shapes = [
        <div key="1" className="w-5 h-5 bg-blue-500 rounded-sm shadow-sm" />,
        <div key="2" className="w-5 h-5 bg-rose-500 rounded-full shadow-sm" />,
        <div key="3" className="w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-b-18 border-b-amber-500" />,
        <div key="4" className="w-7 h-4 bg-emerald-500 rounded-full shadow-sm" />,
        <div key="5" className="w-5 h-5 bg-purple-500 rotate-45 shadow-sm" />,
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="bg-white border border-slate-200 rounded-4xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                <div className={`p-4 rounded-2xl shrink-0 ${percentUsed > 90 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                    <HardDrive size={32}/>
                </div>
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg">Kapasitas Penyimpanan</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Bank Penyimpanan Data</p>
                        </div>
                        <div className="text-right">
                            <span className={`font-black text-xl ${textColor}`}>
                                {formatBytes(totalUsedStorage)}
                            </span>
                            <span className="text-slate-400 font-medium text-sm"> / 2 GB</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} style={{ width: `${percentUsed}%` }}></div>
                    </div>
                </div>
            </div>
            
            {percentUsed > 90 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={24}/>
                    <div>
                        <h4 className="font-bold text-red-800">Peringatan! Penyimpanan hampir penuh!</h4>
                        <p className="text-sm text-red-600 mt-1">Bank data sudah terisi <b>{percentUsed.toFixed(1)}%. Harap hubungi TU untuk mengosongkan ruang</b></p>
                    </div>
                </div>
            )}

            {(userRole === "admin" || userRole === "tu") && !selectedTeacher ? (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{userRole === "admin" ? "Bank Data Sekolah" : "Pilih User untuk Upload"}</h1>
                        </div>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <label htmlFor="search"></label>
                            <input type="text" id="search" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredTeachers.map((teacher) => (
                            <button key={teacher._id} onClick={() => setSelectedTeacher(teacher)} className="group flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10 transition-all active:scale-95">
                                <div className="relative mb-4">
                                    <Folder className="text-blue-100 fill-blue-50 group-hover:text-blue-500 group-hover:fill-blue-500/10 transition-colors"/>
                                </div>
                                <p className="text-sm font-bold text-slate-700 text-center line-clamp-2">{teacher?.name || "Tanpa Nama"}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{teacher?.role || "guru"}</p>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {(userRole === "admin" || userRole === "tu") && (
                                <button title="back" onClick={() => setSelectedTeacher(null)} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                    <ChevronLeft size={24}/>
                                </button>
                            )}
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                                    {selectedTeacher?.name ? `Folder: ${selectedTeacher?.name}` : "Bank Data"}
                                </h1>
                            </div>
                        </div>
                        <button title="upload" onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                            <PlusCircle size={20}/>
                        </button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm min-h-100">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-bold text-slate-400">Menarik data dari brankas</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-4xl bg-slate-50/50">
                                <CloudUpload className="mx-auto h-16 w-16 text-slate-200 mb-4"/>
                                <p className="text-slate-500 font-bold">Belum ada file yang diupload</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {files.map((file) => {
                                    const typeFile = file.typeFile || "unknow";
                                    const isImage = ["png", "jpg", "jpeg"].includes(typeFile.toLowerCase());

                                    return (
                                        <div key={file._id} className="flex items-center p-5 bg-white border border-slate-100 rounded-3xl group hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mr-4 shrink-0">
                                                {isImage ? <ImageIcon size={28}/> : <FileText size={28}/>}
                                            </div>
                                            <div className="flex-1 min-w-0 mr-4">
                                                <p className="font-black text-slate-800 truncate" title={file?.namaFile}>{file?.namaFile}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                                    {formatBytes(file?.ukuranFile)} {typeFile}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <a title="download" href={file?.urlFile} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100">
                                                    <Download size={18}/>
                                                </a>
                                                <button title="delete" onClick={() => handleDeleteClick(file._id)} className="p-2.5 bg-slate-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-slate-100">
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL UPLOAD DROPZONE BAWAAN */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={smoothTransition} className="bg-white rounded-[3rem] p-8 w-full max-w-md relative shadow-2xl">
                            <button title="X" onClick={() => setIsUploadModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><X size={24}/></button>
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Upload File</h3>
                                <p className="text-slate-500 font-medium">Sisa Ruang: <span className="text-blue-600 font-bold">{formatBytes(MAX_STORAGE - totalUsedStorage)}</span></p>
                            </div>
                            
                            <UploadDropZone 
                                endpoint="guruUploader" 
                                onBeforeUploadBegin={(selectedFiles) => {
                                    const fileDipilih = selectedFiles[0];
                                    const remainStorage = MAX_STORAGE - totalUsedStorage;
                                    if(fileDipilih.size > remainStorage) {
                                        setIsUploadModalOpen(false);
                                        showToast("error", "Kapasitas Penuh!", `Ruang tersisa hanya ${formatBytes(remainStorage)}.`);
                                        return [];
                                    }
                                    return selectedFiles;
                                }}
                                onClientUploadComplete={async (res) => {
                                    if(res && res.length > 0) {
                                        setIsUploadModalOpen(false);
                                        setOverlayStage("loading");
                                        setOverlayTitle("Menyimpan Informasi File...");
                                        setOverlayMsg("Mengamankan rekaman di database sekolah");

                                        try {
                                            const uploadedFile = res[0];
                                            const ext = uploadedFile.name.split(".").pop() || "unknown";
                                            await simpanDataGudang({
                                                namaFile: uploadedFile.name,
                                                urlFile: uploadedFile.url,
                                                typeFile: ext,
                                                ukuranFile: uploadedFile.size,
                                                pemilikId: selectedTeacher?._id || userId
                                            });
                                            setRefreshKey(prev => prev + 1);
                                            
                                            setOverlayStatus("success");
                                            setOverlayTitle("Berhasil Diunggah!");
                                            setOverlayMsg("File telah sukses tersimpan di brankas.");
                                        } catch(error) {
                                            console.error(error);
                                            setOverlayStatus("error");
                                            setOverlayTitle("Gagal Menyimpan!");
                                            setOverlayMsg("Gagal dicatat ke database lokal.");
                                        }

                                        setTimeout(() => {
                                            setOverlayStage("toast");
                                            setTimeout(() => setOverlayStage("idle"), 3500);
                                        }, 1500);
                                    }
                                }}
                                onUploadError={(error) => {
                                    setIsUploadModalOpen(false);
                                    showToast("error", "Gagal Mengunggah", `Kendala: ${error.message}`);
                                }}
                                appearance={{
                                    container: "w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 rounded-[2rem] py-12 px-6 transition-all cursor-pointer group relative",
                                    uploadIcon: "text-blue-500 w-16 h-16 mb-4 pointer-events-none group-hover:scale-110 transition-transform duration-300",
                                    label: "text-blue-700 font-black text-lg cursor-pointer hover:text-blue-800 z-10",
                                    allowedContent: "text-slate-500 text-xs font-medium mt-2 pointer-events-none",
                                    button: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl mt-6 w-full max-w-xs transition-colors relative z-50",
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================= */}
            {/* OVERLAY ANIMASI 1: HAPUS FILE (Tong Sampah, MODE: WAIT) */}
            {/* ======================================================= */}
            <AnimatePresence>
                {deleteStage !== "idle" && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={smoothTransition} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => deleteStage === "dialog" && setDeleteStage("idle")} />
                        
                        <AnimatePresence mode="wait">
                            {deleteStage === "dialog" && (
                                <motion.div key="delete-dialog" {...fadeScale} transition={smoothTransition} className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-3 w-80 relative z-10">
                                    <div className="flex items-center gap-3 text-rose-600 mb-2">
                                        <div className="p-3 bg-rose-50 rounded-full border border-rose-100"><Trash2 className="w-6 h-6" /></div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">Hapus File?</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Tindakan ini tidak dapat dibatalkan. Yakin ingin membuang file ini permanen?
                                    </p>
                                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
                                        <button onClick={() => setDeleteStage("idle")} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Batal</button>
                                        <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">Ya, Hapus</button>
                                    </div>
                                </motion.div>
                            )}

                            {(deleteStage === "loading" || deleteStage === "taking") && (
                                <motion.div key="delete-anim" {...fadeScale} transition={smoothTransition} className="bg-white w-72 h-64 rounded-2xl shadow-2xl overflow-hidden relative flex items-center justify-center z-10 border border-slate-100">
                                    <motion.div className="relative flex flex-col items-center justify-end w-32 h-40" animate={deleteStage === "taking" ? { x: 300 } : { x: 0 }} transition={{ duration: 0.8, ease: "easeIn" }}>
                                        <motion.div className="w-24 h-3 bg-slate-700 rounded-t-md relative z-20 origin-bottom-left" animate={deleteStage === "taking" ? { rotate: 0, y: 0 } : { rotate: -65, y: -10, x: -10 }} transition={{ type: "tween", duration: 0.3 }}>
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-slate-600 rounded-t-sm" />
                                        </motion.div>
                                        <div className="w-20 h-24 bg-slate-800 rounded-b-xl relative z-20 flex justify-center gap-2 pt-3 shadow-inner">
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                            <div className="w-1.5 h-16 bg-slate-600 rounded-full opacity-50" />
                                        </div>
                                        {deleteStage === "loading" && (
                                            <div className="absolute inset-0 z-10 flex justify-center overflow-hidden">
                                                {shapes.map((Shape, index) => (
                                                    <motion.div key={index} className="absolute" initial={{ y: -100, opacity: 0, rotate: 0, scale: 0.5 }} animate={{ y: [ -80, 20, 80 ], opacity: [0, 1, 0], rotate: [0, 180, 360], scale: [0.5, 1, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: index * 0.2, ease: "linear" }}>
                                                        {Shape}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                        {deleteStage === "taking" && (
                                            <motion.div className="absolute top-10 flex items-center z-30" initial={{ x: -200 }} animate={{ x: -45 }} transition={{ type: "tween", duration: 0.4 }}>
                                                <div className="w-48 h-8 bg-amber-200 rounded-l-full shadow-sm" />
                                                <div className="w-10 h-14 bg-amber-300 rounded-full -ml-4 border-r-4 border-amber-400/50" />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                    <motion.div className="absolute bottom-6 text-xs font-bold tracking-widest text-slate-400 uppercase" animate={deleteStage === "taking" ? { opacity: 0 } : { opacity: 1 }}>
                                        {deleteStage === "loading" ? "Membuang File..." : ""}
                                    </motion.div>
                                </motion.div>
                            )}

                            {deleteStage === "toast" && (
                                <motion.div key="delete-toast" {...fadeScale} transition={smoothTransition} className="flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white relative z-10 w-80 bg-slate-800 border border-slate-700">
                                    {deleteStatus === "success" ? (
                                        <>
                                            <Trash2 className="w-8 h-8 text-rose-400 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">File Terhapus</span>
                                                <span className="text-slate-400 text-xs">Arsip telah dibersihkan.</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-8 h-8 text-rose-500 shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">Gagal Menghapus</span>
                                                <span className="text-slate-400 text-xs">Kendala pada server.</span>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================= */}
            {/* OVERLAY ANIMASI 2: UPLOAD & TOAST LAIN (MODE: WAIT)     */}
            {/* ======================================================= */}
            <AnimatePresence>
                {overlayStage !== "idle" && (
                    <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={smoothTransition} className="absolute inset-0" />
                        
                        <AnimatePresence mode="wait">
                            {/* STAGE A: LOADING UPLOAD (Cloud Processing) */}
                            {overlayStage === "loading" && (
                                <motion.div key="loading-upload" {...fadeScale} transition={smoothTransition} className="bg-white w-64 h-64 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-6 relative z-10 border border-slate-100">
                                    <div className="w-24 h-28 bg-blue-50 border-2 border-blue-200 rounded-lg relative flex flex-col items-center justify-center mb-4 overflow-hidden shadow-inner">
                                        <motion.div animate={{ y: [25, -25], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: [0.22, 1, 0.36, 1] as const }} className="text-blue-500 absolute">
                                            <CloudUpload className="w-10 h-10" strokeWidth={2.5} />
                                        </motion.div>
                                        <div className="absolute bottom-3 flex flex-col gap-1.5 w-12 items-center">
                                            <div className="h-1.5 bg-blue-200 rounded-full w-full" />
                                            <div className="h-1.5 bg-blue-200 rounded-full w-4/5" />
                                            <div className="h-1.5 bg-blue-200 rounded-full w-full" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 tracking-wide animate-pulse">{overlayTitle}</span>
                                    <span className="text-xs text-slate-400 mt-1 font-medium text-center">{overlayMsg}</span>
                                </motion.div>
                            )}

                            {/* STAGE B: TOAST OVERLAY */}
                            {overlayStage === "toast" && (
                                <motion.div key="toast-overlay" {...fadeScale} transition={smoothTransition} className={`flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-2xl shadow-2xl text-white relative z-10 w-80 text-center ${overlayStatus === "success" ? "bg-blue-600 border border-blue-500" : overlayStatus === "warning" ? "bg-amber-500 border border-amber-400" : "bg-rose-600 border border-rose-500"}`}>
                                    {overlayStatus === "success" && (
                                        <>
                                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={smoothTransition} className="bg-white/20 p-4 rounded-full border border-white/30 shadow-inner">
                                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                    <motion.path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }} />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{overlayTitle}</h3>
                                                <p className="text-blue-100 text-xs font-medium">{overlayMsg}</p>
                                            </div>
                                        </>
                                    )}
                                    {overlayStatus === "warning" && (
                                        <>
                                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <AlertTriangle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{overlayTitle}</h3>
                                                <p className="text-amber-100 text-xs font-medium">{overlayMsg}</p>
                                            </div>
                                        </>
                                    )}
                                    {overlayStatus === "error" && (
                                        <>
                                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <AlertCircle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{overlayTitle}</h3>
                                                <p className="text-rose-100 text-xs font-medium">{overlayMsg}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}