"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, Receipt } from "lucide-react";
import { addExpense, type Expense } from "@/app/actions";
import toast from "react-hot-toast";

interface ExpensesClientProps {
    initialExpenses: Expense[];
}

const CATEGORIES = ["Bahan Baku", "Operasional", "Lainnya"];

export default function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

                // Add to local state
                const newExpense: Expense = {
                    branch_id: "",
                    date: new Date().toISOString().split("T")[0],
                    item_name: itemName.trim(),
                    amount: amountRaw,
                    category,
                    note: note.trim(),
                };
                setExpenses([newExpense, ...expenses]);

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

    const totalToday = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-red-100 text-sm mb-1">Total Pengeluaran Hari Ini</p>
                <p className="text-3xl font-bold">{formatCurrency(totalToday)}</p>
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
                    <h2 className="font-semibold text-gray-800">Riwayat Hari Ini</h2>
                    <span className="ml-auto bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                        {expenses.length} item
                    </span>
                </div>

                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>Belum ada pengeluaran hari ini</p>
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
