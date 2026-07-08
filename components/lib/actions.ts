/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User, Grade, ClassRoom } from "./models";
import { connectToDatabase } from "./db";
import { Student } from "./models/Students";
import { AbsensiSiswa } from "./models/AbsensiSiswa";
import { revalidatePath } from "next/cache";
import { Attendance } from "./models";
import { NilaiSiswa } from "./models/NilaiSiswa";
import { hashEmail } from "./encryption";
import { GudangData } from "./models";
import { decrypt } from "./encryption";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

type KepsekSnapshot = {
    role?: string;
    jabatan?: string;
    jabatanStruktural?: string;
    jabatanFungsional?: string;
    mataPelajaran?: string;
    kelas?: number | null;
    rombel?: string;
};

function buildKepsekSnapshot(user: any): KepsekSnapshot {
    return {
        role: user?.role || "guru",
        jabatan: user?.jabatan || "Guru Kelas",
        jabatanStruktural: user?.jabatanStruktural || "Guru Kelas",
        jabatanFungsional: user?.jabatanFungsional || "Guru Pertama",
        mataPelajaran: user?.mataPelajaran || "",
        kelas: typeof user?.kelas === "number" ? user.kelas : null,
        rombel: user?.rombel || "",
    };
}

async function restoreTeacherFromKepsekSnapshot(userId: string, snapshot?: KepsekSnapshot | null) {
    const previousState = snapshot || {
        role: "guru",
        jabatan: "Guru Kelas",
        jabatanStruktural: "Guru Kelas",
        jabatanFungsional: "Guru Pertama",
        mataPelajaran: "",
        kelas: null,
        rombel: "",
    };

    await User.findByIdAndUpdate(userId, {
        $set: {
            role: previousState.role || "guru",
            jabatan: previousState.jabatan || "Guru Kelas",
            jabatanStruktural: previousState.jabatanStruktural || "Guru Kelas",
            jabatanFungsional: previousState.jabatanFungsional || "Guru Pertama",
            mataPelajaran: previousState.mataPelajaran || "",
            kelas: typeof previousState.kelas === "number" ? previousState.kelas : null,
            rombel: previousState.rombel || "",
            kepsekSnapshot: null,
        },
    });
}

async function applyKepsekTransition(targetUser: any, nextRole: string) {
    if (nextRole === "kepsek") {
        const currentKepsek = await User.findOne({ role: "kepsek" });
        if (currentKepsek && currentKepsek._id.toString() !== targetUser._id.toString()) {
            await restoreTeacherFromKepsekSnapshot(currentKepsek._id.toString(), currentKepsek.kepsekSnapshot || null);
        }

        const snapshot = buildKepsekSnapshot(targetUser);
        await User.findByIdAndUpdate(targetUser._id, {
            $set: {
                role: "kepsek",
                jabatan: "Kepala Sekolah",
                jabatanStruktural: "Kepala Sekolah",
                mataPelajaran: "",
                kelas: null,
                rombel: "",
                kepsekSnapshot: snapshot,
            },
        });
        return;
    }

    if (targetUser?.role === "kepsek") {
        await restoreTeacherFromKepsekSnapshot(targetUser._id.toString(), targetUser.kepsekSnapshot || null);
    }
}

export async function getTeacher() {
    await connectToDatabase();
    const teachers = await User.find({ role: { $ne: "admin" } }).sort({ name: 1 });
    return teachers.map((teacher) => JSON.parse(JSON.stringify(teacher.toObject({ getters: true }))));
}

export async function saveTeacher(formData: FormData) {
    try {
        await connectToDatabase();
        const id = formData.get("id") as string;
        const jabatanBaru = formData.get("jabatan") as string;
        const roleValue = (formData.get("role") as string) || "guru";
        const data: any = {
            name: formData.get("name"),
            email: formData.get("email"),
            status: formData.get("status") || "aktif",
            profilePicture: formData.get("profilePicture"),
            idGuru: formData.get("idGuru"),
            role: roleValue,
            nip: formData.get("nip"),
            nuptk: formData.get("nuptk"),
            golongan: formData.get("golongan"),
            jenisKelamin: formData.get("jenisKelamin"),
            noTelp: formData.get("noTelp"),
            pendidikan: formData.get("pendidikan"),
            statusKepegawaian: formData.get("statusKepegawaian"),
            tempatLahir: formData.get("tempatLahir"),
            tanggalLahir: formData.get("tanggalLahir"),
            tmtMengajar: formData.get("tmtMengajar"),
            mataPelajaran: formData.get("mataPelajaran"),
            jabatan: jabatanBaru,
            jabatanStruktural: formData.get("jabatanStruktural"),
            jabatanFungsional: formData.get("jabatanFungsional"),
            kelas: formData.get("kelas") ? Number(formData.get("kelas")) : null,
            rombel: formData.get("rombel") || "",
            alamatLengkap: formData.get("alamatLengkap"),
            desa: formData.get("desa"),
            kecamatan: formData.get("kecamatan"),
            kabupaten: formData.get("kabupaten"),
            provinsi: formData.get("provinsi"),
        };

        if(data.idGuru && data.idGuru.trim() !== "") {
            const existingGuru = await User.findOne({idGuru: data.idGuru});
            if(existingGuru && existingGuru._id.toString() !== id) {
                return{error: "Id sudah terpakai, silahkan gunakan id yang lain"};
            }
        }

        if(id) {
            const existingTeacher = await User.findById(id);
            if (existingTeacher) {
                if (roleValue === "kepsek") {
                    const snapshot = buildKepsekSnapshot(existingTeacher);
                    data.role = "kepsek";
                    data.jabatan = "Kepala Sekolah";
                    data.jabatanStruktural = "Kepala Sekolah";
                    data.mataPelajaran = "";
                    data.kelas = null;
                    data.rombel = "";
                    data.kepsekSnapshot = snapshot;

                    const currentKepsek = await User.findOne({ role: "kepsek" });
                    if (currentKepsek && currentKepsek._id.toString() !== id) {
                        await restoreTeacherFromKepsekSnapshot(currentKepsek._id.toString(), currentKepsek.kepsekSnapshot || null);
                    }
                } else if (existingTeacher.role === "kepsek" && roleValue !== "kepsek") {
                    const snapshot = existingTeacher.kepsekSnapshot || {
                        role: "guru",
                        jabatan: "Guru Kelas",
                        jabatanStruktural: "Guru Kelas",
                        jabatanFungsional: "Guru Pertama",
                        mataPelajaran: "",
                        kelas: null,
                        rombel: "",
                    };
                    data.role = snapshot.role || "guru";
                    data.jabatan = snapshot.jabatan || "Guru Kelas";
                    data.jabatanStruktural = snapshot.jabatanStruktural || "Guru Kelas";
                    data.jabatanFungsional = snapshot.jabatanFungsional || "Guru Pertama";
                    data.mataPelajaran = snapshot.mataPelajaran || "";
                    data.kelas = typeof snapshot.kelas === "number" ? snapshot.kelas : null;
                    data.rombel = snapshot.rombel || "";
                    data.kepsekSnapshot = null;
                }
            }

            const password = formData.get("password") as string;
            if (password) {
                data.password = await bcrypt.hash(password, 10);
            }
            if (data.email) {
                data.emailHash = hashEmail(data.email);
            }
            await User.findByIdAndUpdate(id, data);
            if(jabatanBaru !== "Guru Kelas") {
                await ClassRoom.updateMany(
                    {waliKelas: id},
                    {$set: {waliKelas: null}},
                );
            }
        } else {
            if (roleValue === "kepsek") {
                const currentKepsek = await User.findOne({ role: "kepsek" });
                if (currentKepsek) {
                    await restoreTeacherFromKepsekSnapshot(currentKepsek._id.toString(), currentKepsek.kepsekSnapshot || null);
                }
                data.role = "kepsek";
                data.jabatan = "Kepala Sekolah";
                data.jabatanStruktural = "Kepala Sekolah";
                data.mataPelajaran = "";
                data.kelas = null;
                data.rombel = "";
                data.kepsekSnapshot = {
                    role: "guru",
                    jabatan: jabatanBaru || "Guru Kelas",
                    jabatanStruktural: formData.get("jabatanStruktural") || "Guru Kelas",
                    jabatanFungsional: formData.get("jabatanFungsional") || "Guru Pertama",
                    mataPelajaran: formData.get("mataPelajaran") || "",
                    kelas: formData.get("kelas") ? Number(formData.get("kelas")) : null,
                    rombel: formData.get("rombel") || "",
                };
            }
            const password = formData.get("password") as string;
            data.password = await bcrypt.hash(password, 10);
            data.emailHash = hashEmail(data.email);
            await User.create(data);
        }
        revalidatePath("/dashboard/guru");
        revalidatePath("/dashboard/absensi-guru");
        revalidatePath("/dashboard/siswa");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function getWaliKelas(kelas: number, rombel: string) {
    try {
        await connectToDatabase();
        const room = await ClassRoom.findOne({kelas, rombel}).populate("waliKelas", "name _id");
        return room && room.waliKelas ? JSON.parse(JSON.stringify(room.waliKelas)) : null;
    } catch(error) {
        console.error(error);
        return null;
    }
}

export async function setWaliKelas(kelas: number, rombel: string, teacherId: string) {
    try {
        await connectToDatabase();
        if(!teacherId || teacherId === "") {
            await ClassRoom.findOneAndDelete({kelas, rombel});
        } else {
            await ClassRoom.findOneAndUpdate(
                {kelas, rombel},
                {waliKelas: teacherId},
                {upsert: true, new: true}
            )
        };
        revalidatePath("/dashboard/siswa");
        return {success: true};
    } catch(error: any) {
        return{error: error.message};
    }
}

export async function saveGrade(formData: FormData) {
    try {
        await connectToDatabase()
        await Grade.create({
            studentId: formData.get("studentId"),
            subject: formData.get("subject"),
            semester: formData.get("semester"),
            academicYear: formData.get("academicYear"),
            score: parseInt(formData.get("score") as string),
            notes: formData.get("notes")
        });
        revalidatePath("/dashboard/nilai");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function addStudents(data: any) {
    try {
        await connectToDatabase();
        const allStudent = await Student.find();
        const decryptedStudent = JSON.parse(JSON.stringify(allStudent));
        const duplicateStudent = decryptedStudent.find((s: any) => {
            const isNisMatch = String(s.nis) === String(data.nis);
            const isNisnMatch = data.nisn && String(data.nisn).trim() !== "" && String(s.nisn) === String(data.nisn);
            return isNisMatch || isNisnMatch;
        });
        if(duplicateStudent) {
            const lokasiKelas = duplicateStudent.rombel ? `kelas ${duplicateStudent.kelas || duplicateStudent.class}-${duplicateStudent.rombel}` : `kelas ${duplicateStudent.kelas || duplicateStudent.class}`;
            return {
                error: `NIS atau NISN sudah digunakan oleh siswa bernama "${duplicateStudent.name}" dari ${lokasiKelas}.`
            };
        }
        const newStudents = new Student(data);
        await newStudents.save();
        revalidatePath("dashboard/siswa");
        return {success: true};
    } catch (error: any) {
        if (error.code === 11000) {
            return { error: "Gagal menyimpan: Terdeteksi bentrok data unik NIS/NISN di dalam database." };
        }
        return { error: error.message || "Terjadi kesalahan sistem saat menyimpan data." };
    }
}

export async function getStudents(search = "") {
    await connectToDatabase();
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const students = await Student.find(query).sort({ kelas: 1, name: 1 });
    return JSON.parse(JSON.stringify(students));
}

export async function getStudentsFiltered(kelas: number, rombel: string) {
    try {
        await connectToDatabase();
        const students = await Student.find({kelas, rombel}).sort({name: 1});
        return JSON.parse(JSON.stringify(students));
    } catch (error) {
        console.error(error);
        return[];
    }
}

export async function saveStudent(formData: FormData) {
    try {
        await connectToDatabase();
        const id = formData.get("id") as string;
        const data = {
            nis: formData.get("nis"),
            nisn: formData.get("nisn"),
            name: formData.get("name"),
            kelas: Number(formData.get("class") as string),
            rombel: formData.get("rombel"),
            gender: formData.get("gender"),
            status: formData.get("status"),
            profilePicture: formData.get("profilePicture")
        };
        if(id) {
            await Student.findByIdAndUpdate(id, data);
        } else {
            await Student.create(data);
        }
        revalidatePath("/dashboard/siswa");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateStudents(id: string, data: any) {
    try {
        await connectToDatabase();
        const allStudents = await Student.find();
        const decryptedStudents = JSON.parse(JSON.stringify(allStudents));

        // Cari duplikat tapi abaikan data milik siswa yang sedang di-update itu sendiri
        const duplicateStudent = decryptedStudents.find((s: any) => {
            const isNotSelf = s._id.toString() !== id;
            
            const isNisMatch = String(s.nis) === String(data.nis);
            const isNisnMatch = data.nisn && String(data.nisn).trim() !== "" && String(s.nisn) === String(data.nisn);
            
            return isNotSelf && (isNisMatch || isNisnMatch);
        });

        if (duplicateStudent) {
            const lokasiKelas = duplicateStudent.rombel ? `kelas ${duplicateStudent.kelas || duplicateStudent.class}-${duplicateStudent.rombel}` : `kelas ${duplicateStudent.kelas || duplicateStudent.class}`;
            return {
                error: `NIS atau NISN sudah digunakan oleh siswa bernama "${duplicateStudent.name}" dari ${lokasiKelas}.` 
            };
        }
        await Student.findByIdAndUpdate(id, data);
        revalidatePath("dashboard/siswa");
        return {success: true};
    } catch (error: any) {
        if (error.code === 11000) {
            return { error: "Gagal memperbarui: Terdeteksi bentrok data unik NIS/NISN di dalam database." };
        }
        return { error: error.message || "Terjadi kesalahan sistem saat memperbarui data." };
    }
}

export async function getDashboardStats() {
    await connectToDatabase();
    const totalGuru = await User.countDocuments({role: "guru", status: "aktif"});
    const totalSiswa = await Student.countDocuments({status: "aktif"});
    const totalLulus = await Student.countDocuments({status: "lulus"});
    const hariIni = new Date().toISOString().split("T")[0];

    const absensiHariIni = await Attendance.countDocuments({
        date: {
            $gte: new Date(`${hariIni}T00:00:00.000Z`),
            $lt: new Date(`${hariIni}T23:59:59.999Z`)
        }
    });
    return {totalGuru, totalSiswa, totalLulus, absensiHariIni};
}

export async function getAttendance(userId?: string){
    await connectToDatabase();
    const query = userId ? {userId}:{};
    const attendance = await Attendance.find(query).populate("userId", "name").sort({date: -1, createdAt: -1});
    return JSON.parse(JSON.stringify(attendance));
}

export async function saveAttendance(formData: FormData) {
    try {
        await connectToDatabase();
        const userId = formData.get("userId") as string;
        const dateInput = formData.get("date") as string;
        const startOfDay = new Date(`${dateInput}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateInput}T23:59:59.999Z`);
        const existing = await Attendance.findOne({
            userId,
            date: {$gte: startOfDay, $lt: endOfDay}
        });
        if (existing) return {error: "anda sudah mengisi absensi hari ini"};
        await Attendance.create({
            userId,
            date: startOfDay,
            status: formData.get("status"),
            notes: formData.get("notes")
        });
        revalidatePath("/dashboard/absensi");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function getStudentByClass(kelas: number) {
    try {
        await connectToDatabase();
        const students = await Student.find({kelas: kelas, status: "aktif"}).sort({name: 1});
        return JSON.parse(JSON.stringify(students));
    } catch (error) {
        console.error(error);
        return[];
    }
}

export async function getStudentByRombel(kelas: number) {
    try {
        await connectToDatabase();
        const students = await Student.find({kelas: kelas, status: "aktif"}).sort({name: 1});
        return JSON.parse(JSON.stringify(students));
    } catch (error) {
        console.error(error);
        return[];
    }
}

export async function getAbsensiRecord(kelas: number, rombel: string, tanggal: string) {
    try {
        await connectToDatabase();
        const records = await AbsensiSiswa.find({kelas, rombel, tanggal}).lean();
        return JSON.parse(JSON.stringify(records));
    } catch (error) {
        console.error(error);
        return[];
    }
}

export async function saveBulkAbsensi(data: any[], kelas: number, rombel: string, tanggal: string) {
    try {
        await connectToDatabase();
        for(const item of data) {
            await AbsensiSiswa.findOneAndUpdate(
                {studentId: item.studentId, kelas, rombel, tanggal},
                {status: item.status, keterangan: item.keterangan},
                {upsert: true, new: true}
            );
        }
        revalidatePath("dashboard/absensi");
        return {success: true}
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function getGNilaiRecord(kelas: number, rombel: string, semester: string, mapel: string, jenisNilai: string, tanggal: string) {
    try {
        await connectToDatabase();
        const isEkskul = jenisNilai === "ekskul";
        const query = {
            kelas,
            rombel,
            semester,
            mataPelajaran: mapel,
            jenisNilai: isEkskul ? "ekskul" : jenisNilai,
            tanggal,
            isEkskul: isEkskul
        } as any;

        const records = await NilaiSiswa.find(query).lean();
        return JSON.parse(JSON.stringify(records));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function saveBulkNilai(data: any[], kelas: number, rombel: string, semester: string, mapel: string, jenisNilai: string, tanggal: string) {
    try {
        await connectToDatabase();
        const isEkskul = jenisNilai === "ekskul";

        for (const item of data) {
            const updateData: any = {
                studentId: item.studentId,
                kelas,
                rombel,
                semester,
                mataPelajaran: mapel,
                jenisNilai: isEkskul ? "ekskul" : jenisNilai,
                tanggal,
                isEkskul
            };

            if (isEkskul) {
                updateData.nilaiEkskul = item.nilaiEkskul || "-";
                updateData.nilai = null;
            } else {
                updateData.nilai = Number(item.nilai) || 0;
                updateData.nilaiEkskul = null;
            }

            await NilaiSiswa.findOneAndUpdate(
                {
                    studentId: item.studentId,
                    kelas,
                    rombel,
                    semester,
                    mataPelajaran: mapel,
                    jenisNilai: isEkskul ? "ekskul" : jenisNilai,
                    tanggal,
                    isEkskul
                },
                updateData,
                { upsert: true, new: true }
            );
        }
        revalidatePath("dashboard/nilai");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getStudentAttendanceMonthlyRecap(kelas: number, rombel: string, monthYear: string) {
    try {
        await connectToDatabase();
        const records = await AbsensiSiswa.find({
            kelas,
            rombel,
            tanggal: new RegExp(`^${monthYear}`)
        }).lean();
        return JSON.parse(JSON.stringify(records));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getStudentNilaiMonthlyRecap(kelas: number, rombel: string, semester: string, mapel: string, jenisNilai: string, monthYear: string) {
    try {
        await connectToDatabase();
        const isEkskul = jenisNilai === "ekskul";
        const query: any = {
            kelas,
            rombel,
            semester,
            mataPelajaran: mapel,
            jenisNilai: isEkskul ? "ekskul" : jenisNilai,
            isEkskul,
            tanggal: new RegExp(`^${monthYear}`)
        };
        const records = await NilaiSiswa.find(query).lean();
        return JSON.parse(JSON.stringify(records));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTeacherAttendanceMonthlySummary(monthYear: string) {
    try {
        await connectToDatabase();
        const start = new Date(`${monthYear}-01`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const rawData = await Attendance.find({
            date: { $gte: start, $lt: end }
        }).populate("userId", "name jabatanStruktural idGuru");

        const summary: Record<string, any> = {};
        rawData.forEach((item: any) => {
            const userId = item.userId?._id?.toString();
            if(!userId) return;
            if(!summary[userId]) {
                summary[userId] = {
                    userId,
                    name: item.userId.name || "-",
                    idGuru: item.userId.idGuru || "-",
                    jabatanStruktural: item.userId.jabatanStruktural || "-",
                    hadir: 0,
                    sakit: 0,
                    izin: 0,
                    alpa: 0,
                    total: 0
                };
            }
            const status = String(item.status).toLowerCase();
            if(status === "hadir") summary[userId].hadir += 1;
            else if(status === "sakit") summary[userId].sakit += 1;
            else if(status === "izin") summary[userId].izin += 1;
            else summary[userId].alpa += 1;
            summary[userId].total += 1;
        });

        return JSON.parse(JSON.stringify(Object.values(summary)));
    } catch (error) {
        console.error("gagal mengambil rekap absensi guru bulanan:", error);
        return [];
    }
}

export async function deleteTeacher(id: string) {
    try {
        await connectToDatabase();
        await User.findByIdAndDelete(id);
        revalidatePath("/dashboard/guru");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function deleteStudent(id:string) {
    try {
        await connectToDatabase();
        await Student.findByIdAndDelete(id);
        revalidatePath("/dashboard/siswa");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function searchStudents(searchQuery: string) {
    try {
        await connectToDatabase();
        const students = await Student.find().sort({kelas: 1, rombel: 1, name: 1});
        const decryptedStudents = JSON.parse(JSON.stringify(students));
        const queryLower = searchQuery.trim().toLowerCase();

        return decryptedStudents.filter((student: any) => {
            const name = (student.name || "").toString().toLowerCase();
            const nis = (student.nis || "").toString().toLowerCase();
            const nisn = (student.nisn || "").toString().toLowerCase();
            return name.includes(queryLower) || nis.includes(queryLower) || nisn.includes(queryLower);
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTeacherWithClass() {
    await connectToDatabase();
    const teacherDocs = await User.find({ role: "guru", status: "aktif" });
    const teachers = teacherDocs.map((teacher) => JSON.parse(JSON.stringify(teacher.toObject({ getters: true }))));
    const rooms = await ClassRoom.find().lean();
    return teachers.map((t: any) => {
        const assignedClass = rooms.find((r: any) => r.waliKelas?.toString() === t._id.toString());
        let jabatanLengkap = t.jabatan || "Guru";
        if(t.jabatan === "Guru Kelas" || t.jabatan === "Wali Kelas") {
            if(assignedClass){
                jabatanLengkap = `Guru Kelas ${assignedClass.kelas}${assignedClass.rombel}`;
            } else {
                jabatanLengkap = "Guru Kelas (belum diatur)";
            }
        }
        else if(t.jabatan === "Guru Mapel" && t.mataPelajaran) {
            jabatanLengkap = `Guru ${t.mataPelajaran}`
        }
        return {...t, _id: t._id.toString(), jabatanLengkap};
    });
}

export async function saveTeacherAttendance(attendanceData: any[], date: string) {
    await connectToDatabase();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    for(const item of attendanceData) {
        const userId = mongoose.Types.ObjectId.isValid(item.userId)
            ? new mongoose.Types.ObjectId(item.userId)
            : item.userId;
        await Attendance.findOneAndUpdate(
            {userId, date: targetDate},
            {userId, date: targetDate, status: item.status, notes: item.notes},
            {upsert: true, new: true, setDefaultsOnInsert: true},
        );
    }
    revalidatePath("/dashboard/rekap-absensi-guru")
    return{success: true};
}

export async function getTeacherAttendanceRecap(startDate: string, endDate: string) {
    try {
        await connectToDatabase();
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() + 2);
        const rawData = await Attendance.find({
            date: {$gte: start, $lte: end}
        }).populate("userId", "name jabatanStruktural idGuru").sort({date: -1});
        const filteredData = rawData.filter((item: any) => {
            const dateObj = new Date(item.date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            const itemDateStr = `${year}-${month}-${day}`;
            return itemDateStr >= startDate && itemDateStr <= endDate;
        });
        return JSON.parse(JSON.stringify(filteredData));
    } catch (error) {
        console.error("gagal mengambil rekap absensi guru:", error);
        return[];
    }
}

export async function getAvailableAttendanceDates() {
    try {
        await connectToDatabase();
        const dates: (string | null)[] = await Attendance.distinct("date");
        const validDates = dates.filter((d): d is string => d != null).map((d) => {
            const dateObj = new Date(d);
            if(isNaN(dateObj.getTime())) return null;
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }).filter((d): d is string => d != null);
        const uniqueDates = Array.from(new Set(validDates));
        return uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    } catch (error) {
        console.error("Gagal mengambil tanggal absensi:", error);
        return [];
    }
}

export async function simpanDataGudang(data: {namaFile: string, urlFile: string, typeFile: string, ukuranFile: number, pemilikId: string}) {
    await connectToDatabase();
    await GudangData.create(data);
    revalidatePath("/dashboard/gudang");
}

export async function getGudangDataGuru(pemilikId: string) {
    await connectToDatabase();
    const rawFiles = await GudangData.find({pemilikId}).sort({createdAt: -1}).lean();
    const files = rawFiles.map((file: any) => ({
        ...file, urlFile: decrypt(file.urlFile)
    }));
    return JSON.parse(JSON.stringify(files));
}

export async function deleteDataGudang(id: string) {
    await connectToDatabase();
    try {
        const fileData = await GudangData.findByIdAndDelete(id).lean();
        if(fileData) {
            const decryptedUrl = decrypt(fileData.urlFile as string);
            const fileKey = decryptedUrl.substring(decryptedUrl.lastIndexOf("/") + 1);
            if(fileKey) {
                await utapi.deleteFiles(fileKey);
                console.log(`File ${fileKey} berhasil dihapus dari UploadThing`);
            }
        }
        await GudangData.findByIdAndDelete(id);
        revalidatePath("/dashboard/gudang");
    } catch (error) {
        console.error("Terjadi kesalahan saat menghapus data: ", error);
    }
}

export async function getStorageStats() {
    await connectToDatabase();
    const result = await GudangData.aggregate([
        {$group: {_id: null, totalSize: {$sum: "$ukuranFile"}}}
    ]);
    return result.length > 0 ? result[0].totalSize: 0;
}

export async function getTeacherAndKepsekForTu() {
    await connectToDatabase();
    const users = await User.find({ 
        role: { $in: ["guru", "kepsek"] },
        status: "aktif" 
    }).sort({ name: 1 });
    return users.map((user) => JSON.parse(JSON.stringify(user.toObject({ getters: true }))));
}

export async function getKepsek() {
    await connectToDatabase();
    const kepsek = await User.findOne({ role: "kepsek" });
    if (!kepsek) return null;
    return JSON.parse(JSON.stringify(kepsek.toObject({ getters: true })));
}

export async function getGuruOnly() {
    await connectToDatabase();
    const gurus = await User.find({ role: "guru" }).sort({ name: 1 });
    return gurus.map((guru) => JSON.parse(JSON.stringify(guru.toObject({ getters: true }))));
}

export async function updateKepsek(userId: string) {
    try {
        await connectToDatabase();
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            throw new Error("Guru tidak ditemukan");
        }

        await applyKepsekTransition(targetUser, "kepsek");

        const result = await User.findById(userId);
        return result ? JSON.parse(JSON.stringify(result.toObject({ getters: true }))) : null;
    } catch (error) {
        console.error("Error updating kepsek:", error);
        throw new Error("Gagal mengubah kepala sekolah");
    }
}

export async function deleteKepsek() {
    try {
        await connectToDatabase();
        const currentKepsek = await User.findOne({ role: "kepsek" });
        if (!currentKepsek) {
            return { success: true };
        }

        await restoreTeacherFromKepsekSnapshot(currentKepsek._id.toString(), currentKepsek.kepsekSnapshot || null);
        return { success: true };
    } catch (error) {
        console.error("Error deleting kepsek:", error);
        throw new Error("Gagal menghapus kepala sekolah");
    }
}