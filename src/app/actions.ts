"use server";

import { createSession, deleteSession, getSession } from "@/lib/auth";
import {
    getUserByUsername,
    getAllRecipes,
    getInventoryByBranch,
    updateInventoryStock,
    addSaleRecord,
    getSalesByBranchAndDate,
    addExpenseRecord,
    getExpensesByBranch,
    getSalesByBranchForMonth,
    getExpensesByBranchForMonth,
    getDailySalesForWeek,
    getAllSalesByBranch,
    getSalesByBranchDateRange,
    getExpensesByBranchDateRange,
    getDailySalesForRange,
    type InventoryItem as InventoryItemType,
    type Recipe,
    type Expense as ExpenseType,
    type Sale as SaleType,
} from "@/lib/googleSheets";
import { redirect } from "next/navigation";

// Re-export InventoryItem type for use in other files
export type InventoryItem = InventoryItemType;

// ================= AUTH ACTIONS =================

export interface AuthState {
    error?: string;
    success?: boolean;
}

export async function authenticate(
    prevState: AuthState,
    formData: FormData
): Promise<AuthState> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Username dan password harus diisi" };
    }

    try {
        const user = await getUserByUsername(username);

        if (!user) {
            return { error: "Username tidak ditemukan" };
        }

        if (user.password !== password) {
            return { error: "Password salah" };
        }

        await createSession({
            username: user.username,
            branch_id: user.branch_id,
            branch_name: user.branch_name,
            role: user.role,
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { error: "Terjadi kesalahan saat login" };
    }
}

export async function logout(): Promise<void> {
    await deleteSession();
    redirect("/login");
}

// ================= MENU ACTIONS =================

export interface MenuItem {
    menu_name: string;
    sell_price: number;
    ingredients: string;
    available_stock: number;
    cogs: number;
}

export async function getMenu(): Promise<MenuItem[]> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const recipes = await getAllRecipes();
    const inventory = await getInventoryByBranch(session.branch_id);

    // Create inventory map for quick lookup
    const inventoryMap = new Map<string, InventoryItemType>();
    for (const item of inventory) {
        inventoryMap.set(item.id, item);
    }

    const menuItems: MenuItem[] = [];

    for (const recipe of recipes) {
        const parsedIngredients = parseIngredients(recipe.ingredients);

        // Calculate available stock (minimum servings possible)
        let availableStock = Infinity;
        let totalCogs = 0;

        for (const ing of parsedIngredients) {
            const invItem = inventoryMap.get(ing.itemId);
            if (!invItem) {
                availableStock = 0;
                break;
            }
            const possibleServings = Math.floor(invItem.stock / ing.qty);
            availableStock = Math.min(availableStock, possibleServings);
            totalCogs += invItem.cost_per_unit * ing.qty;
        }

        if (availableStock === Infinity) availableStock = 0;

        menuItems.push({
            menu_name: recipe.menu_name,
            sell_price: recipe.sell_price,
            ingredients: recipe.ingredients,
            available_stock: availableStock,
            cogs: totalCogs,
        });
    }

    return menuItems;
}

// ================= SALES ACTIONS =================

export interface CartItem {
    menu_name: string;
    qty: number;
    sell_price: number;
    cogs: number;
    ingredients: string;
}

export interface SaleResult {
    success: boolean;
    error?: string;
    totalPrice?: number;
    totalProfit?: number;
}

export async function processSale(cart: CartItem[]): Promise<SaleResult> {
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Sesi tidak valid" };
    }

    try {
        const inventory = await getInventoryByBranch(session.branch_id);
        const inventoryMap = new Map<string, InventoryItemType>();
        for (const item of inventory) {
            inventoryMap.set(item.id, item);
        }

        // First pass: validate stock availability
        const stockChanges: Map<string, { rowNumber: number; newStock: number }> = new Map();

        for (const cartItem of cart) {
            const parsedIngredients = parseIngredients(cartItem.ingredients);

            for (const ing of parsedIngredients) {
                const invItem = inventoryMap.get(ing.itemId);
                if (!invItem || !invItem.rowIndex) {
                    return { success: false, error: `Bahan ${ing.itemId} tidak ditemukan` };
                }

                const requiredQty = ing.qty * cartItem.qty;
                const existing = stockChanges.get(ing.itemId);
                const currentStock = existing ? existing.newStock : invItem.stock;

                if (currentStock < requiredQty) {
                    return {
                        success: false,
                        error: `Stok ${invItem.name} tidak cukup (tersedia: ${currentStock}, dibutuhkan: ${requiredQty})`,
                    };
                }

                stockChanges.set(ing.itemId, {
                    rowNumber: invItem.rowIndex,
                    newStock: currentStock - requiredQty,
                });
            }
        }

        // Second pass: update inventory
        for (const [, change] of stockChanges) {
            await updateInventoryStock(change.rowNumber, change.newStock);
        }

        // Third pass: record sales
        const now = new Date();
        const dateWithTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        let totalPrice = 0;
        let totalProfit = 0;

        for (const cartItem of cart) {
            const itemTotalPrice = cartItem.sell_price * cartItem.qty;
            const itemTotalCogs = cartItem.cogs * cartItem.qty;
            const itemProfit = itemTotalPrice - itemTotalCogs;

            await addSaleRecord({
                branch_id: session.branch_id,
                date: dateWithTime,
                menu_name: cartItem.menu_name,
                qty: cartItem.qty,
                total_price: itemTotalPrice,
                cogs_total: itemTotalCogs,
                profit: itemProfit,
            });

            totalPrice += itemTotalPrice;
            totalProfit += itemProfit;
        }

        return { success: true, totalPrice, totalProfit };
    } catch (error) {
        console.error("Process sale error:", error);
        return { success: false, error: "Terjadi kesalahan saat memproses penjualan" };
    }
}

// ================= INVENTORY ACTIONS =================

export async function getInventory(): Promise<InventoryItem[]> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    return await getInventoryByBranch(session.branch_id);
}

export interface UpdateInventoryResult {
    success: boolean;
    error?: string;
}

export async function updateInventory(
    rowNumber: number,
    addStock: number
): Promise<UpdateInventoryResult> {
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Sesi tidak valid" };
    }

    try {
        const inventory = await getInventoryByBranch(session.branch_id);
        const item = inventory.find((i) => i.rowIndex === rowNumber);

        if (!item) {
            return { success: false, error: "Item tidak ditemukan" };
        }

        const newStock = item.stock + addStock;
        await updateInventoryStock(rowNumber, newStock);

        return { success: true };
    } catch (error) {
        console.error("Update inventory error:", error);
        return { success: false, error: "Terjadi kesalahan saat update stok" };
    }
}

// ================= DASHBOARD ACTIONS =================

export interface DashboardStats {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    totalCups: number;
    dailySales: { date: string; income: number }[];
    monthlyComparison: { name: string; value: number }[];
    startDate: string;
    endDate: string;
}

export async function getDashboardStats(
    startDate?: string,
    endDate?: string
): Promise<DashboardStats> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Default to current month if no dates provided
    const now = new Date();
    const defaultStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const defaultEndDate = now.toISOString().split("T")[0];

    const start = startDate || defaultStartDate;
    const end = endDate || defaultEndDate;

    // Get sales data within date range
    const { totalIncome, totalCups } = await getSalesByBranchDateRange(
        session.branch_id,
        start,
        end
    );

    // Get expenses data within date range
    const { totalExpenses } = await getExpensesByBranchDateRange(
        session.branch_id,
        start,
        end
    );

    // Get daily sales for chart within range
    const dailySales = await getDailySalesForRange(session.branch_id, start, end);

    // Comparison for bar chart
    const monthlyComparison = [
        { name: "Pemasukan", value: totalIncome },
        { name: "Pengeluaran", value: totalExpenses },
    ];

    return {
        totalIncome,
        totalExpenses,
        netCashFlow: totalIncome - totalExpenses,
        totalCups,
        dailySales,
        monthlyComparison,
        startDate: start,
        endDate: end,
    };
}

// ================= HELPER FUNCTIONS =================

interface ParsedIngredient {
    itemId: string;
    qty: number;
}

function parseIngredients(ingredientsStr: string): ParsedIngredient[] {
    if (!ingredientsStr) return [];

    return ingredientsStr.split(",").map((pair) => {
        const [itemId, qty] = pair.trim().split(":");
        return {
            itemId: itemId.trim(),
            qty: parseFloat(qty) || 0,
        };
    });
}

// ================= SESSION HELPER =================

export async function getCurrentSession() {
    return await getSession();
}

// ================= EXPENSE ACTIONS =================

export type Expense = ExpenseType;

export interface AddExpenseResult {
    success: boolean;
    error?: string;
}

export async function addExpense(formData: {
    item_name: string;
    amount: number;
    category: string;
    note: string;
}): Promise<AddExpenseResult> {
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Sesi tidak valid" };
    }

    try {
        const today = new Date().toISOString().split("T")[0];
        await addExpenseRecord({
            branch_id: session.branch_id,
            date: today,
            item_name: formData.item_name,
            amount: formData.amount,
            category: formData.category,
            note: formData.note,
        });
        return { success: true };
    } catch (error) {
        console.error("Add expense error:", error);
        return { success: false, error: "Terjadi kesalahan saat menyimpan pengeluaran" };
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const today = new Date().toISOString().split("T")[0];
    return await getExpensesByBranch(session.branch_id, today);
}

export async function getAllExpenses(): Promise<Expense[]> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    return await getExpensesByBranch(session.branch_id);
}

// ================= HISTORY ACTIONS =================

export type Sale = SaleType;

export interface HistoryItem {
    date: string;
    type: "income" | "expense";
    description: string;
    amount: number;
    category?: string;
}

export async function getHistory(): Promise<HistoryItem[]> {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Get all sales
    const sales = await getAllSalesByBranch(session.branch_id);

    // Get all expenses
    const expenses = await getExpensesByBranch(session.branch_id);

    // Combine into history items
    const historyItems: HistoryItem[] = [];

    for (const sale of sales) {
        historyItems.push({
            date: sale.date,
            type: "income",
            description: sale.menu_name,
            amount: sale.total_price,
        });
    }

    for (const expense of expenses) {
        historyItems.push({
            date: expense.date,
            type: "expense",
            description: expense.item_name,
            amount: expense.amount,
            category: expense.category,
        });
    }

    // Sort by date descending (newest first)
    historyItems.sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        return dateB.localeCompare(dateA);
    });

    return historyItems;
}

