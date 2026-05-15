"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogOutButton({isCollapsed} : {isCollapsed: boolean}) {
    return (
            <button onClick={() => signOut({callbackUrl: "/login"})} className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white w-full hover:bg-red-700 active:bg-red-800 rounded-lg transition font-medium shadow-md hover:shadow-lg">
            <LogOut className="w-5 h-5" />
            {!isCollapsed && "Keluar"}
        </button>
    )
}