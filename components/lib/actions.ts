/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import bcrypt from "bcryptjs";
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
        const data: any = {
            name: formData.get("name"),
            email: formData.get("email"),
            status: formData.get("status") || "aktif",
            profilePicture: formData.get("profilePicture"),
            idGuru: formData.get("idGuru"),
            role: formData.get("role"),
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
        console.log("=== DATA YANG MASUK KE SERVER ===", data);
        if(data.idGuru && data.idGuru.trim() !== "") {
            const existingGuru = await User.findOne({idGuru: data.idGuru});
            if(existingGuru && existingGuru._id.toString() !== id) {
                return{error: "Id sudah terpakai, silahkan gunakan id yang lain"};
            }
        }
        if(id) {
            const password = formData.get("password") as string;
            if (password) {
                data.password = await bcrypt.hash(password, 10);
            }
            if (data.email) {
                data.emailHash = hashEmail(data.email);
            }
            await User.findByIdAndUpdate(id, data);
            if(jabatanBaru !== "Guru Kelas"){
                await ClassRoom.updateMany(
                    {waliKelas: id},
                    {$set: {waliKelas: null}},
                );
            }
        } else {
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
        const newStudents = new Student(data);
        await newStudents.save();
        revalidatePath("dashboard/siswa");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
    }
}

export async function getStudents(search = "") {
    await connectToDatabase();
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const students = await Student.find(query).sort({ kelas: 1, name: 1 }).lean({ getters: true });
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
        await Student.findByIdAndUpdate(id, data);
        revalidatePath("dashboard/siswa");
        return {success: true};
    } catch (error: any) {
        return {error: error.message};
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
    const attendance = await Attendance.find(query).populate("userId", "name").sort({date: -1, createdAt: -1}).lean({ getters: true });
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
        }).populate("userId", "name jabatanStruktural idGuru").lean({ getters: true });

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
        const students = await Student.find({
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { nis: { $regex: searchQuery, $options: "i" } }
            ]
        }).sort({kelas: 1, rombel: 1, name: 1}).lean({ getters: true });
        return JSON.parse(JSON.stringify(students))
    } catch (error) {
        console.error(error);
        return[];
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
        await Attendance.findOneAndUpdate(
            {userId: item.userId, date: targetDate},
            {status: item.status, notes: item.notes},
            {upsert: true},
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