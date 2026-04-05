"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogOutButton() {
    return (
        <button onClick={() => signOut({callbackUrl: "/login"})} className="flex items-center gap-3 px-4 py-3 text-red-600 w-full hover:bg-red-50 rounded-lg transition font-medium bg-red-200">
            <LogOut className="w-5 h-5"></LogOut>Keluar
        </button>
    )
}