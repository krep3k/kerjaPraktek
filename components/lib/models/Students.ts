import mongoose from "mongoose";
import { encrypt, decrypt } from "../encryption";

const studentSchema = new mongoose.Schema({
    nis: { type: String, required: true, unique: true, set: encrypt, get: decrypt },
    nisn: { type: String, default: "", set: encrypt, get: decrypt },
    name: { type: String, required: true },
    gender: { type: String, enum: ['L', 'P'], required: true },
    kelas: { type: Number, required: true },
    rombel: { type: String, required: true },
    status: { type: String, default: 'aktif' },
    profilePicture: { type: String, default: '' },
}, {timestamps: true, toJSON: {getters: true}, toObject: {getters: true}});

export const Student = mongoose.models.DataSiswa || mongoose.model("DataSiswa", studentSchema);