import mongoose, {Schema, model, models} from "mongoose";
import { encrypt, decrypt } from "./encryption";

const UserSchema = new Schema({
    name: {type: String, required: true, set: encrypt, get: decrypt},
    email: {type: String, required: true, unique: true, set: encrypt, get: decrypt},
    emailHash: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["admin", "guru", "kepsek", "tu"], default: "guru"},
    profilePicture: {type: String, default: ""},
    idGuru: { type: String, default: "", set: encrypt, get: decrypt },
    nip: { type: String, default: "", unique: true, set: encrypt, get: decrypt },
    nuptk: { type: String, default: "", unique: true, set: encrypt, get: decrypt },
    jenisKelamin: { type: String, enum: ["Laki-laki", "Perempuan"], default: "Laki-laki" },
    noTelp: { type: String, default: "", set: encrypt, get: decrypt },
    pendidikan: { type: String, default: "" },
    statusKepegawaian: { type: String, default: "" },
    golongan: { type: String, default: "" },
    status: {type: String, enum: ["aktif", "nonaktif"], default: "aktif"},
    tempatLahir: {type: String, default: "", set: encrypt, get: decrypt},
    tanggalLahir: { type: String, default: "", set: encrypt, get: decrypt },
    tmtMengajar: { type: String, default: "" },
    mataPelajaran: { type: String, default: "" },
    jabatanStruktural: { type: String, default: "Guru Kelas" },
    jabatanFungsional: { type: String, default: "Guru Pertama"},
    kelas: { type: Number, default: null},
    rombel: { type: String, default: ""},
    alamatLengkap: { type: String, default: "", set: encrypt, get: decrypt },
    desa: { type: String, default: "", set: encrypt, get: decrypt },
    kecamatan: { type: String, default: "", set: encrypt, get: decrypt },
    kabupaten: { type: String, default: "", set: encrypt, get: decrypt },
    provinsi: { type: String, default: "", set: encrypt, get: decrypt },
}, {timestamps: true, strict: false, toJSON: {getters: true}, toObject: {getters: true}});

const StudentSchema = new Schema({
    nis: {type: String, required: true, unique: true, set: encrypt, get: decrypt},
    nisn: {type: String, default: "", set: encrypt, get: decrypt},
    name: {type: String, required: true},
    class: {type: Number, required: true, min: 1, max: 6},
    gender: {type: String, enum: ["L", "P"], required: true},
    status: {type: String, enum: ["aktif", "lulus", "keluar"], default: "aktif"},
    profilePicture: {type: String, default: ""},
}, {timestamps: true, toJSON: {getters: true}, toObject: {getters: true}});

const AttendanceSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true, set: encrypt, get: decrypt},
    date: {type: Date, required: true},
    status: {type: String, enum: ["hadir", "izin", "sakit", "alpa"], required: true},
    notes: {type: String, default: ""},
}, {timestamps: true});

const NilaiSchema = new mongoose.Schema({
    studentId: {type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, set: encrypt, get: decrypt},
    kelas: {type: Number, required: true},
    semester: {type: String, required: true},
    mataPelajaran: {type: String, required: true},
    akademik: {
        bahasaIndonesia: {type: Number, default: 0},
        matematika: {type: Number, default: 0},
        pendidikanPancasila: {type: Number, default: 0},
        ipas: {type: Number, default: 0},
        seniBudaya: {type: Number, default: 0},
        bahasaInggris: {type: Number, default: 0},
        pai: {type: Number, default: 0},
        pjok: {type: Number, default: 0},
        btq: {type: Number, default: 0},
        tik: {type: Number, default: 0},
        mulok: {type: Number, default: 0},
    },
    ekskul: {
        pramuka: { type: String, enum: ['A', 'B', 'C', '-'], default: '-' },
        tari: { type: String, enum: ['A', 'B', 'C', '-'], default: '-' },
        futsal: { type: String, enum: ['A', 'B', 'C', '-'], default: '-' },
    }
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