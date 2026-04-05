import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    nis: { type: String, required: true, unique: true },
    nisn: { type: String, default: "" },
    name: { type: String, required: true },
    gender: { type: String, enum: ['L', 'P'], required: true },
    kelas: { type: Number, required: true },
    rombel: { type: String, required: true },
    status: { type: String, default: 'aktif' },
    photo: { type: String, default: '' },
}, {timestamps: true});

export const Student = mongoose.models.DataSiswa || mongoose.model("DataSiswa", studentSchema);