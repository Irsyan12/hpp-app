"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Receipt, Filter, Calendar } from "lucide-react";
import { addExpense, type Expense } from "@/app/actions";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";
import toast from "react-hot-toast";

interface ExpensesClientProps {
    initialExpenses: Expense[];
    startDate: string;
    endDate: string;
}

const CATEGORIES = ["Bahan Baku", "Operasional", "Lainnya"];

type FilterPreset = "today" | "week" | "month" | "custom";

export default function ExpensesClient({ initialExpenses, startDate, endDate }: ExpensesClientProps) {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState(startDate);
    const [customEnd, setCustomEnd] = useState(endDate);

    // Sync state when props change (when filter is applied and page refetches)
    useEffect(() => {
        setExpenses(initialExpenses);
        setCustomStart(startDate);
        setCustomEnd(endDate);
    }, [initialExpenses, startDate, endDate]);

    // Form state
    const [itemName, setItemName] = useState("");
    const [amountRaw, setAmountRaw] = useState<number>(0); // Raw integer value
    const [amountDisplay, setAmountDisplay] = useState(""); // Formatted display value
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [note, setNote] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format number with thousand separators (dots)
    const formatThousands = (value: number) => {
        return new Intl.NumberFormat("id-ID").format(value);
    };

    // Handle amount input with auto-formatting
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Remove all non-digit characters
        const digits = inputValue.replace(/\D/g, "");
        const numericValue = parseInt(digits, 10) || 0;

        setAmountRaw(numericValue);
        setAmountDisplay(numericValue > 0 ? formatThousands(numericValue) : "");
    };

    const getCurrentPreset = (): FilterPreset => {
        const now = new Date();
        const todayStr = format(now, "yyyy-MM-dd");
        const weekStartStr = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const monthStartStr = format(startOfMonth(now), "yyyy-MM-dd");

        if (startDate === todayStr && endDate === todayStr) {
            return "today";
        } else if (startDate === weekStartStr && endDate === todayStr) {
            return "week";
        } else if (startDate === monthStartStr) {
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
        router.push(`/expenses?start=${start}&end=${end}`);
    };

    const handleCustomFilter = () => {
        if (customStart && customEnd) {
            router.push(`/expenses?start=${customStart}&end=${customEnd}`);
        }
    };

    const formatDisplayDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "d MMM yyyy", { locale: localeId });
        } catch {
            return dateStr;
        }
    };

    const currentPreset = getCurrentPreset();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!itemName.trim()) {
            setError("Nama item harus diisi");
            return;
        }

        if (amountRaw <= 0) {
            setError("Jumlah harus berupa angka positif");
            return;
        }

        const toastId = toast.loading("Menyimpan pengeluaran...");

        startTransition(async () => {
            const result = await addExpense({
                item_name: itemName.trim(),
                amount: amountRaw,
                category,
                note: note.trim(),
            });

            if (result.success) {
                toast.success(
                    `Berhasil mencatat pengeluaran ${formatCurrency(amountRaw)}`,
                    { id: toastId }
                );

                // Get today's date in YYYY-MM-DD format
                const now = new Date();
                const todayStr = format(now, "yyyy-MM-dd");

                // Only add to local state if today is within the filter range
                if (todayStr >= startDate && todayStr <= endDate) {
                    const newExpense: Expense = {
                        branch_id: "",
                        date: todayStr,
                        item_name: itemName.trim(),
                        amount: amountRaw,
                        category,
                        note: note.trim(),
                    };
                    setExpenses([newExpense, ...expenses]);
                }

                // Reset form
                setItemName("");
                setAmountRaw(0);
                setAmountDisplay("");
                setCategory(CATEGORIES[0]);
                setNote("");
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                toast.error(result.error || "Terjadi kesalahan", { id: toastId });
                setError(result.error || "Terjadi kesalahan");
            }
        });
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
                    Menampilkan data: <span className="font-medium text-gray-700">{formatDisplayDate(startDate)}</span> - <span className="font-medium text-gray-700">{formatDisplayDate(endDate)}</span>
                </p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-red-100 text-sm mb-1">Total Pengeluaran</p>
                <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>

            {/* Add Expense Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                    <div className="p-2 bg-amber-100 rounded-xl">
                        <Plus className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800">Catat Pengeluaran</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
                            Pengeluaran berhasil dicatat!
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Item
                            </label>
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="Contoh: Kopi Arabica 1kg"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jumlah (Rp)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={amountDisplay}
                                onChange={handleAmountChange}
                                placeholder="50.000"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                                disabled={isPending}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Opsional"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 hover:cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Simpan Pengeluaran
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Expense History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800">Riwayat Pengeluaran</h2>
                    <span className="ml-auto bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                        {expenses.length} item
                    </span>
                </div>

                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>Belum ada pengeluaran pada periode ini</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                        Item
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                        Kategori
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                                        Jumlah
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map((expense, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">
                                                {expense.item_name}
                                            </p>
                                            {expense.note && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {expense.note}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${expense.category === "Bahan Baku"
                                                    ? "bg-green-100 text-green-700"
                                                    : expense.category === "Operasional"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">
                                            {formatCurrency(expense.amount)}
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
