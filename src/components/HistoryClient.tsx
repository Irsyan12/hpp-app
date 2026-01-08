"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2, X, Check, Loader2, Plus, Minus, Coffee, Droplet } from "lucide-react";
import { deleteHistoryItem, editHistoryItem, type HistoryItem, type MenuItem } from "@/app/actions";
import toast from "react-hot-toast";

interface HistoryClientProps {
    history: HistoryItem[];
    menuItems: MenuItem[];
}

export default function HistoryClient({ history, menuItems }: HistoryClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editItem, setEditItem] = useState<HistoryItem | null>(null);
    const [editForm, setEditForm] = useState({
        description: "",
        amount: 0,
        qty: 1,
        category: "",
        note: "",
    });
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

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

    const handleDelete = (item: HistoryItem) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-800">
                    Hapus {item.type === "income" ? "pemasukan" : "pengeluaran"} ini?
                </p>
                <p className="text-sm text-gray-600">
                    {item.description} - {formatCurrency(item.amount)}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            confirmDelete(item);
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        ), {
            duration: 10000,
            style: {
                padding: "16px",
                maxWidth: "320px",
            },
        });
    };

    const confirmDelete = (item: HistoryItem) => {
        const toastId = toast.loading("Menghapus...");

        startTransition(async () => {
            const result = await deleteHistoryItem(item.rowIndex, item.source);
            if (result.success) {
                toast.success("Berhasil dihapus!", { id: toastId });
                router.refresh();
            } else {
                toast.error(result.error || "Gagal menghapus", { id: toastId });
            }
        });
    };

    const openEditModal = (item: HistoryItem) => {
        setEditItem(item);
        if (item.source === "sale") {
            // Find the menu item that matches
            const menu = menuItems.find(m => m.menu_name === item.description);
            setSelectedMenu(menu || null);
            setEditForm({
                description: item.description,
                amount: item.amount,
                qty: item.qty || 1,
                category: "",
                note: "",
            });
        } else {
            setSelectedMenu(null);
            setEditForm({
                description: item.description,
                amount: item.amount,
                qty: 1,
                category: item.category || "",
                note: item.note || "",
            });
        }
    };

    const selectMenuItem = (menu: MenuItem) => {
        setSelectedMenu(menu);
        const newQty = editForm.qty || 1;
        setEditForm({
            ...editForm,
            description: menu.menu_name,
            amount: menu.sell_price * newQty,
        });
    };

    const updateSaleQty = (delta: number) => {
        if (!selectedMenu) return;
        const newQty = Math.max(1, editForm.qty + delta);
        setEditForm({
            ...editForm,
            qty: newQty,
            amount: selectedMenu.sell_price * newQty,
        });
    };

    const handleEdit = () => {
        if (!editItem) return;

        const toastId = toast.loading("Menyimpan...");

        startTransition(async () => {
            const result = await editHistoryItem(editItem.rowIndex, editItem.source, {
                description: editForm.description,
                amount: editForm.amount,
                qty: editForm.qty,
                category: editForm.category,
                note: editForm.note,
            });

            if (result.success) {
                toast.success("Berhasil disimpan!", { id: toastId });
                setEditItem(null);
                setSelectedMenu(null);
                router.refresh();
            } else {
                toast.error(result.error || "Gagal menyimpan", { id: toastId });
            }
        });
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
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((item, idx) => (
                                    <tr key={`${item.source}-${item.rowIndex}-${idx}`} className="hover:bg-gray-50">
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
                                        <td className="px-4 py-3">
                                            {/* Only show edit/delete for expenses (pengeluaran) */}
                                            {item.type === "expense" ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        disabled={isPending}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        disabled={isPending}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => { setEditItem(null); setSelectedMenu(null); }}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
                        <button
                            onClick={() => { setEditItem(null); setSelectedMenu(null); }}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-gray-800">
                                Edit {editItem.type === "income" ? "Pemasukan" : "Pengeluaran"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {formatDate(editItem.date)}
                            </p>
                        </div>

                        {/* Edit Sale - Menu Selection */}
                        {editItem.source === "sale" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Menu
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {menuItems.map((menu) => (
                                            <button
                                                key={menu.menu_name}
                                                onClick={() => selectMenuItem(menu)}
                                                className={`p-3 rounded-xl text-left transition-all ${selectedMenu?.menu_name === menu.menu_name
                                                    ? "bg-amber-100 border-2 border-amber-500"
                                                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    {menu.category === "Coffee" ? (
                                                        <Coffee className="w-4 h-4 text-amber-600" />
                                                    ) : (
                                                        <Droplet className="w-4 h-4 text-blue-500" />
                                                    )}
                                                    <span className="font-medium text-gray-800 text-sm truncate">
                                                        {menu.menu_name}
                                                    </span>
                                                </div>
                                                <p className="text-amber-700 text-sm font-semibold">
                                                    {formatCurrency(menu.sell_price)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedMenu && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Jumlah
                                            </label>
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => updateSaleQty(-1)}
                                                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"
                                                >
                                                    <Minus className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <span className="text-2xl font-bold text-gray-800 w-16 text-center">
                                                    {editForm.qty}
                                                </span>
                                                <button
                                                    onClick={() => updateSaleQty(1)}
                                                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"
                                                >
                                                    <Plus className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 rounded-xl p-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total</span>
                                                <span className="text-xl font-bold text-amber-700">
                                                    {formatCurrency(editForm.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Edit Expense - Form */}
                        {editItem.source === "expense" && (
                            <div className="space-y-4">
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Keterangan
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nominal (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.amount}
                                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 bg-white"
                                    >
                                        <option value="Bahan Baku">Bahan Baku</option>
                                        <option value="Operasional">Operasional</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catatan
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.note}
                                        onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setEditItem(null); setSelectedMenu(null); }}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={isPending || (editItem.source === "sale" && !selectedMenu) || (editItem.source === "expense" && (!editForm.description || !editForm.amount))}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
