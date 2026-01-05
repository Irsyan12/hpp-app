"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Coffee, AlertCircle, CheckCircle, X, ChevronUp } from "lucide-react";
import { processSale, type MenuItem, type CartItem, type SaleResult } from "@/app/actions";
import toast from "react-hot-toast";

interface POSClientProps {
    initialMenu: MenuItem[];
}

export default function POSClient({ initialMenu }: POSClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<SaleResult | null>(null);

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.menu_name === item.menu_name);
            if (existing) {
                return prev.map((c) =>
                    c.menu_name === item.menu_name ? { ...c, qty: c.qty + 1 } : c
                );
            }
            return [
                ...prev,
                {
                    menu_name: item.menu_name,
                    qty: 1,
                    sell_price: item.sell_price,
                },
            ];
        });
    };

    const updateQty = (menuName: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((c) => {
                    if (c.menu_name === menuName) {
                        const newQty = c.qty + delta;
                        if (newQty <= 0) return null;
                        return { ...c, qty: newQty };
                    }
                    return c;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (menuName: string) => {
        setCart((prev) => prev.filter((c) => c.menu_name !== menuName));
    };

    const clearCart = () => {
        setCart([]);
        setResult(null);
    };

    const totalPrice = cart.reduce((sum, c) => sum + c.sell_price * c.qty, 0);
    const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        const toastId = toast.loading("Memproses pembayaran...");

        startTransition(async () => {
            const saleResult = await processSale(cart);
            setResult(saleResult);

            if (saleResult.success) {
                toast.success(
                    `Transaksi berhasil! Total: ${formatCurrency(saleResult.totalPrice || 0)}`,
                    { id: toastId }
                );
                setCart([]);
                setShowCart(false);
                router.refresh();
            } else {
                toast.error(saleResult.error || "Terjadi kesalahan", { id: toastId });
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
            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-24 md:pb-20">
                {initialMenu.map((item) => (
                    <button
                        key={item.menu_name}
                        onClick={() => addToCart(item)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
                    >
                        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-3">
                            <Coffee className="w-6 h-6 text-amber-700" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                            {item.menu_name}
                        </h3>
                        <p className="text-amber-700 font-bold mt-1">
                            {formatCurrency(item.sell_price)}
                        </p>
                    </button>
                ))}
            </div>

            {/* Fixed Bottom Cart Bar - Both Mobile & Desktop */}
            {cart.length > 0 && (
                <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-20 z-50 bg-white border-t border-gray-200 shadow-lg">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6 text-amber-600" />
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500">{totalItems} item</p>
                                <p className="font-bold text-amber-700">{formatCurrency(totalPrice)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-xl font-semibold">
                            <span>Lihat Keranjang</span>
                            <ChevronUp className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            )}

            {/* Cart Modal - Both Mobile & Desktop */}
            {showCart && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowCart(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 md:left-20 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                            <h2 className="font-bold text-lg text-gray-800">Keranjang</h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <CartContent
                            cart={cart}
                            totalPrice={totalPrice}
                            totalItems={totalItems}
                            isPending={isPending}
                            result={result}
                            updateQty={updateQty}
                            removeFromCart={removeFromCart}
                            clearCart={clearCart}
                            handleCheckout={handleCheckout}
                            formatCurrency={formatCurrency}
                            setResult={setResult}
                            onClose={() => setShowCart(false)}
                        />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
}

interface CartContentProps {
    cart: CartItem[];
    totalPrice: number;
    totalItems: number;
    isPending: boolean;
    result: SaleResult | null;
    updateQty: (menuName: string, delta: number) => void;
    removeFromCart: (menuName: string) => void;
    clearCart: () => void;
    handleCheckout: () => void;
    formatCurrency: (amount: number) => string;
    setResult: (result: SaleResult | null) => void;
    onClose?: () => void;
}

function CartContent({
    cart,
    totalPrice,
    totalItems,
    isPending,
    result,
    updateQty,
    removeFromCart,
    clearCart,
    handleCheckout,
    formatCurrency,
    setResult,
    onClose,
}: CartContentProps) {
    return (
        <div className="p-4">
            {/* Result Alert */}
            {result && (
                <div
                    className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${result.success
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                        }`}
                >
                    {result.success ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        {result.success ? (
                            <>
                                <p className="font-semibold">Transaksi Berhasil!</p>
                                <p className="text-sm mt-1">
                                    Total: {formatCurrency(result.totalPrice || 0)}
                                </p>
                            </>
                        ) : (
                            <p>{result.error}</p>
                        )}
                    </div>
                    <button
                        onClick={() => setResult(null)}
                        className="p-1 hover:bg-white/50 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Empty Cart */}
            {cart.length === 0 && !result && (
                <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Keranjang kosong</p>
                    <p className="text-sm">Pilih menu untuk memulai</p>
                </div>
            )}

            {/* Cart Items */}
            {cart.length > 0 && (
                <div className="space-y-3">
                    {cart.map((item) => (
                        <div
                            key={item.menu_name}
                            className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 truncate">
                                    {item.menu_name}
                                </h4>
                                <p className="text-amber-700 font-semibold text-sm">
                                    {formatCurrency(item.sell_price * item.qty)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQty(item.menu_name, -1)}
                                    className="p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                                >
                                    <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="w-8 text-center font-semibold text-gray-800">
                                    {item.qty}
                                </span>
                                <button
                                    onClick={() => updateQty(item.menu_name, 1)}
                                    className="p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                                >
                                    <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => removeFromCart(item.menu_name)}
                                    className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cart Footer */}
            {cart.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total ({totalItems} item)</span>
                        <span className="text-xl font-bold text-amber-700">
                            {formatCurrency(totalPrice)}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={clearCart}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => {
                                handleCheckout();
                                if (onClose) onClose();
                            }}
                            disabled={isPending}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Proses...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Bayar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
