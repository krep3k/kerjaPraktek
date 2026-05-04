import mongoose from "mongoose";
const NilaiSiswaSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DataSiswa",
        required: true
    },
    kelas: {type: Number, required: true},
    rombel: {type: String, required: true},
    semester: {type: String, required: true},
    mataPelajaran: {type: String, required: true},
    jenisNilai: {type: String, enum: ['Tugas', 'Ulangan Harian', 'UTS', 'UAS', 'ekskul'], required: true},
    tanggal: {type: String, required: true},
    nilai: {type: Number, required: false, min: 0, max: 100, default: null},
    isEkskul: {type: Boolean, default: false},
    nilaiEkskul: {type: String, enum: ["A", "B", "C", "-"], default: null},
}, {timestamps:true});

NilaiSiswaSchema.index({ studentId: 1, kelas: 1, rombel: 1, semester: 1, mataPelajaran: 1, jenisNilai: 1, tanggal: 1 });

export const NilaiSiswa = mongoose.models.DataNilaiSiswaV2 || mongoose.model("DataNilaiSiswaV2", NilaiSiswaSchema);