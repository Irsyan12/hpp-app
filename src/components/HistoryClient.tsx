"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { HistoryItem } from "@/app/actions";

interface HistoryClientProps {
    history: HistoryItem[];
}

export default function HistoryClient({ history }: HistoryClientProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        // Handle both "YYYY-MM-DD" and "YYYY-MM-DD HH:mm" formats
        const parts = dateStr.split(" ");
        const datePart = parts[0];
        const timePart = parts[1] || "";

        try {
            const date = new Date(datePart);
            const formattedDate = date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
            return timePart ? `${formattedDate} ${timePart}` : formattedDate;
        } catch {
            return dateStr;
        }
    };

    const totalIncome = history
        .filter((h) => h.type === "income")
        .reduce((sum, h) => sum + h.amount, 0);

    const totalExpense = history
        .filter((h) => h.type === "expense")
        .reduce((sum, h) => sum + h.amount, 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className="w-5 h-5" />
                        <span className="text-green-100 text-sm">Total Masuk</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowDownRight className="w-5 h-5" />
                        <span className="text-red-100 text-sm">Total Keluar</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalExpense)}</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Riwayat Transaksi</h2>
                    <p className="text-sm text-gray-500">{history.length} transaksi</p>
                </div>

                {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>Belum ada riwayat transaksi</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                        Tanggal
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                        Tipe
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                        Keterangan
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${item.type === "income"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.type === "income" ? (
                                                    <>
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        Masuk
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowDownRight className="w-3 h-3" />
                                                        Keluar
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">
                                                {item.description}
                                            </p>
                                            {item.category && (
                                                <p className="text-xs text-gray-500">{item.category}</p>
                                            )}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-semibold ${item.type === "income"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {item.type === "income" ? "+" : "-"}
                                            {formatCurrency(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
