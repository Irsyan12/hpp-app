"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, RefreshCw, X, Check, AlertCircle } from "lucide-react";
import { updateInventory, type UpdateInventoryResult } from "@/app/actions";

interface InventoryItem {
    branch_id: string;
    id: string;
    name: string;
    unit: string;
    cost_per_unit: number;
    stock: number;
    rowIndex?: number;
}

interface InventoryClientProps {
    initialInventory: InventoryItem[];
}

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryClient({ initialInventory }: InventoryClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
    const [restockAmount, setRestockAmount] = useState("");
    const [result, setResult] = useState<UpdateInventoryResult | null>(null);

    const handleRestock = () => {
        if (!restockItem || !restockItem.rowIndex || !restockAmount) return;

        const amount = parseFloat(restockAmount);
        if (isNaN(amount) || amount <= 0) return;

        startTransition(async () => {
            const res = await updateInventory(restockItem.rowIndex!, amount);
            setResult(res);
            if (res.success) {
                setRestockItem(null);
                setRestockAmount("");
                router.refresh();
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            {/* Result Alert */}
            {result && (
                <div
                    className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${result.success
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                >
                    {result.success ? (
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="flex-1">
                        {result.success ? "Stok berhasil diupdate!" : result.error}
                    </p>
                    <button
                        onClick={() => setResult(null)}
                        className="p-1 hover:bg-white/50 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                    Bahan
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                                    Unit
                                </th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                                    Harga/Unit
                                </th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                                    Stok
                                </th>
                                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Package className="w-4 h-4 text-amber-700" />
                                            </div>
                                            <span className="font-medium text-gray-800">
                                                {item.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {formatCurrency(item.cost_per_unit)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${item.stock < LOW_STOCK_THRESHOLD
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setRestockItem(item);
                                                setRestockAmount("");
                                                setResult(null);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Restock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {initialInventory.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Belum ada data inventory</p>
                    </div>
                )}
            </div>

            {/* Restock Modal */}
            {restockItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setRestockItem(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <button
                            onClick={() => setRestockItem(null)}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <RefreshCw className="w-6 h-6 text-amber-700" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Restock</h3>
                                <p className="text-gray-600 text-sm">{restockItem.name}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Stok saat ini:{" "}
                                <span className="font-semibold text-gray-800">
                                    {restockItem.stock} {restockItem.unit}
                                </span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="restock-amount"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Jumlah Tambahan ({restockItem.unit})
                            </label>
                            <input
                                type="number"
                                id="restock-amount"
                                value={restockAmount}
                                onChange={(e) => setRestockAmount(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900"
                                placeholder="Masukkan jumlah"
                                min="0"
                                step="any"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRestockItem(null)}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRestock}
                                disabled={isPending || !restockAmount}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Proses...
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
        </>
    );
}
