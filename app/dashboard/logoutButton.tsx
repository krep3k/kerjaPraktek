"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogOutButton({isCollapsed} : {isCollapsed: boolean}) {
    return (
            <button onClick={() => signOut({callbackUrl: "/login"})} className="flex items-center gap-3 px-4 py-3 text-destructive w-full hover:bg-destructive/10 rounded-lg transition font-medium">
            <LogOut className="w-5 h-5" />
            {!isCollapsed && "Keluar"}
        </button>
    )
}