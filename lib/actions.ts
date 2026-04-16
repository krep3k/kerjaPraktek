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

export async function getTeacher() {
    await connectToDatabase();
    const teacher = await User.find({role: "guru"}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(teacher));
}

export async function saveTeacher(formData: FormData) {
    try {
        await connectToDatabase();
        const id = formData.get("id") as string;
        const data: any = {
            name: formData.get("name"),
            email: formData.get("email"),
            gmail: formData.get("gmail"),
            status: formData.get("status") || "aktif",
            profilePicture: formData.get("profilePicture"),
            idGuru: formData.get("idGuru"),
            nip: formData.get("nip"),
            nuptk: formData.get("nuptk"),
            jenisKelamin: formData.get("jenisKelamin"),
            noTelp: formData.get("noTelp"),
            pendidikan: formData.get("pendidikan"),
            statusKepegawaian: formData.get("statusKepegawaian"),
            tempatLahir: formData.get("tempatLahir"),
            tanggalLahir: formData.get("tanggalLahir"),
            tmtMengajar: formData.get("tmtMengajar"),
            mataPelajaran: formData.get("mataPelajaran"),
            jabatanStruktural: formData.get("jabatanStruktural"),
            jabatanFungsional: formData.get("jabatanFungsional"),
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
            await User.findByIdAndUpdate(id, data);
        } else {
            const password = formData.get("password") as string;
            data.password = await bcrypt.hash(password, 10);
            data.role = "guru";
            await User.create(data);
        }
        revalidatePath("/dashboard/guru");
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
    const students = await Student.find(query).sort({ kelas: 1, name: 1 }).lean();
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
            name: formData.get("name"),
            kelas: Number(formData.get("class") as string),
            gender: formData.get("gender"),
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
    const attendance = await Attendance.find(query).populate("userId", "name").sort({date: -1, createdAt: -1}).lean();
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
        const records = await NilaiSiswa.find({kelas, rombel, semester, mataPelajaran: mapel, jenisNilai, tanggal}).lean();
        return JSON.parse(JSON.stringify(records));
    } catch (error) {
        console.error(error);
        return[];
    }
}

export async function saveBulkNilai(data: any[], kelas: number, rombel: string, semester: string, mapel: string, jenisNilai: string, tanggal: string) {
    try {
        await connectToDatabase();
        for(const item of data) {
            await NilaiSiswa.findOneAndUpdate(
                {studentId: item.studentId, kelas, rombel, semester, mataPelajaran: mapel, jenisNilai, tanggal},
                {nilai: item.nilai},
                {upsert: true, new: true}
            );
        }
        revalidatePath("dashboard/nilai");
        return {success: true};
    } catch(error: any) {
        return {error: error.message};
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
        }).sort({kelas: 1, rombel: 1, name: 1}).lean();
        return JSON.parse(JSON.stringify(students))
    } catch (error) {
        console.error(error);
        return[];
    }
}