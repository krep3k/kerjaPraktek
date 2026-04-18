/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/components/lib/db";
import { User } from "@/components/lib/models";

export async function GET() {
    try {
        await connectToDatabase();
        const existingAdmin = await User.findOne({email: "admin@sdn02serua.com"});
        if (existingAdmin) {
            return NextResponse.json({
                message: "Akun admin sudah tersedia, silahkan login"
            });
        }
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Admin Utama",
            email: "admin@sdn02serua.com",
            password: hashedPassword,
            role: "admin",
            status: "aktif"
        });
        return NextResponse.json({
            success: true,
            message: "BERHASIL! akun admin pertama telah dibuat",
            credentials: {
                email: "admin@sdn02serua.com",
                password: "admin123"
            }
        });
    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status:500});
    }
}