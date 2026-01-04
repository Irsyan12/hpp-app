"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticate, type AuthState } from "@/app/actions";
import { Coffee, User, Lock, Loader2 } from "lucide-react";

export default function LoginForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<AuthState, FormData>(
        authenticate,
        {}
    );

    useEffect(() => {
        if (state.success) {
            router.push("/");
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl shadow-xl mb-4">
                        <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-amber-900">Coffee Street</h1>
                    <p className="text-amber-700 mt-1">Warkop Modern Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        Login ke Cabang Anda
                    </h2>

                    <form action={formAction} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="Masukkan password"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {state.error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
                                {state.error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-amber-700 text-sm mt-6">
                    &copy; 2026 Coffee Street. All rights reserved.
                </p>
            </div>
        </div>
    );
}
