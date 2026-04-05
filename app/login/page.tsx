"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, AlertCircle } from "lucide-react";

export default function LoginPage(){
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res= await signIn("credentials", {
                email,
                password,
                redirect: false
            });
            if(res?.error) {
                setError(res.error);
                setLoading(false);
            } else if (res?.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("terjadi kesalahan");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-50 p-3 rounded-full mb-3">
                        <GraduationCap className="h-8 w-8 text-blue-600"></GraduationCap>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Login System</h1>
                    <p className="text-gray-500 text-sm mt-1">SDN 02 Serua</p>
                </div>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 shrink-0"></AlertCircle>
                        <p>{error}</p>
                    </div>
                )}
                <form action="" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">Email/Username <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Email" /></label>
                    </div>
                    <div>
                        <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">Password <input type="password" name="password" required placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" /></label>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? "Memeriksa Kredensial..." : "Masuk ke Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
