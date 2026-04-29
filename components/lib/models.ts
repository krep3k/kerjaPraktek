import mongoose, {Schema, model, models} from "mongoose";
import { encrypt, decrypt } from "./encryption";

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["admin", "guru", "kepsek", "tu"], default: "guru"},
    profilePicture: {type: String, default: ""},
    idGuru: { type: String, default: "" },
    nip: { type: String, default: "", unique: true, set: encrypt, get: decrypt },
    nuptk: { type: String, default: "", unique: true, set: encrypt, get: decrypt },
    jenisKelamin: { type: String, enum: ["Laki-laki", "Perempuan"], default: "Laki-laki" },
    noTelp: { type: String, default: "" },
    pendidikan: { type: String, default: "" },
    statusKepegawaian: { type: String, default: "" },
    golongan: { type: String, default: "" },
    status: {type: String, enum: ["aktif", "nonaktif"], default: "aktif"},
    tempatLahir: {type: String, default: ""},
    tanggalLahir: { type: String, default: "" },
    tmtMengajar: { type: String, default: "" },
    mataPelajaran: { type: String, default: "" },
    jabatanStruktural: { type: String, default: "Guru Kelas" },
    jabatanFungsional: { type: String, default: "Guru Pertama"},
    kelas: { type: Number, default: null},
    rombel: { type: String, default: ""},
    alamatLengkap: { type: String, default: "" },
    desa: { type: String, default: "" },
    kecamatan: { type: String, default: "" },
    kabupaten: { type: String, default: "" },
    provinsi: { type: String, default: "" },
}, {timestamps: true, strict: false});

const StudentSchema = new Schema({
    nis: {type: String, required: true, unique: true, set: encrypt, get: decrypt},
    name: {type: String, required: true},
    class: {type: Number, required: true, min: 1, max: 6},
    gender: {type: String, enum: ["L", "P"], required: true},
    status: {type: String, enum: ["aktif", "lulus", "keluar"], default: "aktif"},
    profilePicture: {type: String, default: ""},
}, {timestamps: true});

const AttendanceSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    date: {type: Date, required: true},
    status: {type: String, enum: ["hadir", "izin", "sakit", "alpa"], required: true},
    notes: {type: String, default: ""},
}, {timestamps: true});

const NilaiSchema = new mongoose.Schema({
    studentId: {type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true},
    kelas: {type: Number, required: true},
    semester: {type: String, required: true},
    mataPelajaran: {type: String, required: true},
    score: {type: Number, required: true, min: 0, max: 100},
}, {timestamps: true});

const ClassRoomSchema = new Schema({
    kelas: {type: Number, required: true},
    rombel: {type: String, required: true},
    waliKelas: {type: Schema.Types.ObjectId, ref: "User"}
}, {timestamps: true});

const GudangDataSchema = new Schema({
    namaFile: {type: String, required: true},
    urlFile: {type: String, required: true, set: encrypt, get: decrypt},
    typeFile: {type: String, required: true},
    ukuranFile: {type: Number, required: true},
    pemilikId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true, toJSON: {getters: true}, toObject: {getters: true}});

if(mongoose.models.GudangData){
    delete mongoose.models.GudangData;
}

if(mongoose.models.User) {
    delete mongoose.models.User;
}
if(mongoose.models.ClassRoom) {
    delete mongoose.models.ClassRoom;
}

export const User = models.User || model("User", UserSchema);
export const Student = models.Student || model("Student", StudentSchema);
export const Attendance = models.Attendance || model("Attendance", AttendanceSchema);
export const Grade = mongoose.models.Grade || mongoose.model("Grade", NilaiSchema);
export const ClassRoom = models.ClassRoom || model("ClassRoom", ClassRoomSchema);
export const GudangData = models.GudangData || model("GudangData", GudangDataSchema);