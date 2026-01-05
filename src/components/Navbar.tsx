"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Wallet, ClipboardList, LogOut, Coffee } from "lucide-react";
import { logout } from "@/app/actions";
import toast from "react-hot-toast";

interface NavbarProps {
    branchName: string;
    username: string;
}

export default function Navbar({ branchName, username }: NavbarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "POS", icon: Home },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/expenses", label: "Pengeluaran", icon: Wallet },
        { href: "/history", label: "Riwayat", icon: ClipboardList },
    ];

    const handleLogout = () => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-800">Apakah Anda yakin ingin keluar?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            toast.loading("Logging out...", { id: "logout" });
                            await logout();
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                    >
                        Ya, Keluar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: {
                maxWidth: '320px',
            },
        });
    };

    return (
        <>
            {/* Top Header - Mobile & Desktop */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-lg">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Coffee className="w-6 h-6" />
                        <span className="font-bold text-lg">Coffee Street</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-amber-200">Halo, {username}</p>
                            <p className="text-sm font-semibold">{branchName}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full bg-amber-700/50 hover:bg-amber-700 hover:cursor-pointer transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Bottom Navigation - Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
                <div className="flex justify-around py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${isActive
                                    ? "text-amber-700 bg-amber-50"
                                    : "text-gray-500 hover:text-amber-600"
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Side Navigation - Desktop */}
            <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-20 bg-white border-r border-gray-200 flex-col items-center py-4 gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center py-3 px-2 rounded-xl transition-colors w-16 ${isActive
                                ? "text-amber-700 bg-amber-50"
                                : "text-gray-500 hover:text-amber-600 hover:bg-gray-50"
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </aside>
        </>
    );
}
