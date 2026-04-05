import mongoose from "mongoose";

const AbsensiSiswaSchema = new mongoose.Schema({
    studentId: {type: mongoose.Schema.Types.ObjectId, ref: "DataSiswa", required: true},
    kelas: {type: Number, required: true},
    rombel: {type: String, required: true},
    tanggal: {type: String, required: true},
    status: {type: String, enum: ["Hadir", "Sakit", "Izin", "Alpha"], required: true},
    keterangan: {type: String, default: ""}
}, {timestamps: true});

export const AbsensiSiswa = mongoose.models.DataAbsensiSiswa || mongoose.model("DataAbsensiSiswa", AbsensiSiswaSchema);