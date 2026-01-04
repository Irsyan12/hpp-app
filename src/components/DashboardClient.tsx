"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Coffee, ArrowUpRight, ArrowDownRight, Calendar, Filter } from "lucide-react";
import { format, startOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import type { DashboardStats } from "@/app/actions";

interface DashboardClientProps {
    stats: DashboardStats;
}

const COLORS = {
    income: "#22c55e",
    expense: "#ef4444",
};

type FilterPreset = "today" | "week" | "month" | "custom";

export default function DashboardClient({ stats }: DashboardClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState(stats.startDate);
    const [customEnd, setCustomEnd] = useState(stats.endDate);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatShortCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}jt`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}rb`;
        }
        return amount.toString();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
    };

    const getCurrentPreset = (): FilterPreset => {
        const now = new Date();
        const todayStr = format(now, "yyyy-MM-dd");
        const weekStartStr = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const monthStartStr = format(startOfMonth(now), "yyyy-MM-dd");

        if (stats.startDate === todayStr && stats.endDate === todayStr) {
            return "today";
        } else if (stats.startDate === weekStartStr && stats.endDate === todayStr) {
            return "week";
        } else if (stats.startDate === monthStartStr) {
            return "month";
        }
        return "custom";
    };

    const handlePresetChange = (preset: FilterPreset) => {
        const now = new Date();
        let start: string;
        let end: string = format(now, "yyyy-MM-dd");

        switch (preset) {
            case "today":
                start = end;
                break;
            case "week":
                start = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
                break;
            case "month":
                start = format(startOfMonth(now), "yyyy-MM-dd");
                break;
            default:
                setShowCustom(true);
                return;
        }

        setShowCustom(false);
        router.push(`/dashboard?start=${start}&end=${end}`);
    };

    const handleCustomFilter = () => {
        if (customStart && customEnd) {
            router.push(`/dashboard?start=${customStart}&end=${customEnd}`);
        }
    };

    const isPositive = stats.netCashFlow >= 0;
    const currentPreset = getCurrentPreset();

    const formatDisplayDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "d MMM yyyy", { locale: id });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Date Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Filter Waktu</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    <button
                        onClick={() => handlePresetChange("today")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${currentPreset === "today"
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        Hari Ini
                    </button>
                    <button
                        onClick={() => handlePresetChange("week")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${currentPreset === "week"
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        Minggu Ini
                    </button>
                    <button
                        onClick={() => handlePresetChange("month")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${currentPreset === "month"
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        Bulan Ini
                    </button>
                    <button
                        onClick={() => setShowCustom(!showCustom)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${currentPreset === "custom" || showCustom
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Custom
                    </button>
                </div>

                {showCustom && (
                    <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <button
                            onClick={handleCustomFilter}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                        >
                            Terapkan
                        </button>
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-3">
                    Menampilkan data: <span className="font-medium text-gray-700">{formatDisplayDate(stats.startDate)}</span> - <span className="font-medium text-gray-700">{formatDisplayDate(stats.endDate)}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Income */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                        <span className="text-green-100 text-sm">Total Pemasukan</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">
                        {formatCurrency(stats.totalIncome)}
                    </p>
                </div>

                {/* Total Expenses */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                        <span className="text-red-100 text-sm">Total Pengeluaran</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">
                        {formatCurrency(stats.totalExpenses)}
                    </p>
                </div>

                {/* Net Cash Flow */}
                <div
                    className={`bg-gradient-to-br ${isPositive
                            ? "from-blue-500 to-blue-600"
                            : "from-amber-500 to-amber-600"
                        } rounded-2xl p-5 text-white shadow-lg`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            {isPositive ? (
                                <TrendingUp className="w-6 h-6" />
                            ) : (
                                <TrendingDown className="w-6 h-6" />
                            )}
                        </div>
                        <span className={`${isPositive ? "text-blue-100" : "text-amber-100"} text-sm`}>
                            Net Cash Flow
                        </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">
                        {isPositive ? "+" : ""}{formatCurrency(stats.netCashFlow)}
                    </p>
                </div>
            </div>

            {/* Cups Sold Info */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                    <Coffee className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Total Cup Terjual</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {stats.totalCups} <span className="text-base font-normal text-gray-500">cup</span>
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart - Income vs Expenses */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <Wallet className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="font-semibold text-gray-800">Pemasukan vs Pengeluaran</h2>
                    </div>
                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.monthlyComparison} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    tickFormatter={formatShortCurrency}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 12 }}
                                    width={90}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value as number)}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                    {stats.monthlyComparison.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === "Pemasukan" ? COLORS.income : COLORS.expense}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart - Daily Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="font-semibold text-gray-800">Tren Penjualan Harian</h2>
                    </div>
                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats.dailySales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    tickFormatter={formatShortCurrency}
                                    tick={{ fontSize: 12 }}
                                    width={60}
                                />
                                <Tooltip
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        return date.toLocaleDateString("id-ID", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                        });
                                    }}
                                    formatter={(value) => [formatCurrency(value as number), "Pendapatan"]}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
