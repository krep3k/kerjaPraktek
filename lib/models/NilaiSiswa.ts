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
    jenisNilai: {type: String, enum: ['Tugas', 'Ulangan Harian', 'UTS', 'UAS'], required: true},
    tanggal: {type: String, required: true},
    nilai: {type: Number, required: true, min: 0, max: 100}
}, {timestamps:true});

export const NilaiSiswa = mongoose.models.DataNilaiSiswaV2 || mongoose.model("DataNilaiSiswaV2", NilaiSiswaSchema);