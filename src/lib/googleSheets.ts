"use server";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let docInstance: GoogleSpreadsheet | null = null;

async function getDoc(): Promise<GoogleSpreadsheet> {
  if (docInstance) return docInstance;

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID!,
    serviceAccountAuth
  );
  await doc.loadInfo();
  docInstance = doc;
  return doc;
}

// Sheet Names
const SHEET_USERS = "users";
const SHEET_INVENTORY = "inventory";
const SHEET_RECIPES = "recipes";
const SHEET_SALES = "sales";

// Types
export interface User {
  username: string;
  password: string;
  branch_id: string;
  branch_name: string;
  role: string;
}

export interface InventoryItem {
  branch_id: string;
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  stock: number;
  rowIndex?: number;
}

export interface Recipe {
  menu_name: string;
  sell_price: number;
  ingredients: string; // "item_id:qty, item_id:qty"
}

export interface Sale {
  branch_id: string;
  date: string;
  menu_name: string;
  qty: number;
  total_price: number;
  cogs_total: number;
  profit: number;
}

// Fetch User by Username
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_USERS];
  if (!sheet) throw new Error("Sheet 'users' not found");

  const rows = await sheet.getRows();
  for (const row of rows) {
    if (row.get("username") === username) {
      return {
        username: row.get("username"),
        password: row.get("password"),
        branch_id: row.get("branch_id"),
        branch_name: row.get("branch_name"),
        role: row.get("role"),
      };
    }
  }
  return null;
}

// Fetch Inventory by Branch ID
export async function getInventoryByBranch(
  branchId: string
): Promise<InventoryItem[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_INVENTORY];
  if (!sheet) throw new Error("Sheet 'inventory' not found");

  const rows = await sheet.getRows();
  const items: InventoryItem[] = [];

  for (const row of rows) {
    if (row.get("branch_id") === branchId) {
      items.push({
        branch_id: row.get("branch_id"),
        id: row.get("id"),
        name: row.get("name"),
        unit: row.get("unit"),
        cost_per_unit: parseFloat(row.get("cost_per_unit")) || 0,
        stock: parseFloat(row.get("stock")) || 0,
        rowIndex: row.rowNumber,
      });
    }
  }
  return items;
}

// Fetch All Recipes (Global)
export async function getAllRecipes(): Promise<Recipe[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_RECIPES];
  if (!sheet) throw new Error("Sheet 'recipes' not found");

  const rows = await sheet.getRows();
  return rows.map((row) => ({
    menu_name: row.get("menu_name"),
    sell_price: parseFloat(row.get("sell_price")) || 0,
    ingredients: row.get("ingredients") || "",
  }));
}

// Update Inventory Stock (by rowIndex)
export async function updateInventoryStock(
  rowNumber: number,
  newStock: number
): Promise<void> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_INVENTORY];
  if (!sheet) throw new Error("Sheet 'inventory' not found");

  const rows = await sheet.getRows();
  const row = rows.find((r) => r.rowNumber === rowNumber);
  if (row) {
    row.set("stock", newStock.toString());
    await row.save();
  }
}

// Add Sale Record
export async function addSaleRecord(sale: Sale): Promise<void> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  await sheet.addRow({
    branch_id: sale.branch_id,
    date: sale.date,
    menu_name: sale.menu_name,
    qty: sale.qty.toString(),
    total_price: sale.total_price.toString(),
    cogs_total: sale.cogs_total.toString(),
    profit: sale.profit.toString(),
  });
}

// Get Sales by Branch and Date
export async function getSalesByBranchAndDate(
  branchId: string,
  dateStr: string
): Promise<Sale[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  const rows = await sheet.getRows();
  const sales: Sale[] = [];

  for (const row of rows) {
    if (row.get("branch_id") === branchId && row.get("date") === dateStr) {
      sales.push({
        branch_id: row.get("branch_id"),
        date: row.get("date"),
        menu_name: row.get("menu_name"),
        qty: parseInt(row.get("qty")) || 0,
        total_price: parseFloat(row.get("total_price")) || 0,
        cogs_total: parseFloat(row.get("cogs_total")) || 0,
        profit: parseFloat(row.get("profit")) || 0,
      });
    }
  }
  return sales;
}

// ================= EXPENSE FUNCTIONS =================

export interface Expense {
  branch_id: string;
  date: string;
  item_name: string;
  amount: number;
  category: string;
  note: string;
  rowIndex?: number;
}

const SHEET_EXPENSES = "expenses";

// Add Expense Record
export async function addExpenseRecord(expense: Omit<Expense, "rowIndex">): Promise<void> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_EXPENSES];
  if (!sheet) throw new Error("Sheet 'expenses' not found");

  await sheet.addRow({
    branch_id: expense.branch_id,
    date: expense.date,
    item_name: expense.item_name,
    amount: expense.amount.toString(),
    category: expense.category,
    note: expense.note,
  });
}

// Get Expenses by Branch (optionally filter by date)
export async function getExpensesByBranch(
  branchId: string,
  dateStr?: string
): Promise<Expense[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_EXPENSES];
  if (!sheet) throw new Error("Sheet 'expenses' not found");

  const rows = await sheet.getRows();
  const expenses: Expense[] = [];

  for (const row of rows) {
    if (row.get("branch_id") === branchId) {
      if (dateStr && row.get("date") !== dateStr) continue;
      expenses.push({
        branch_id: row.get("branch_id"),
        date: row.get("date"),
        item_name: row.get("item_name"),
        amount: parseFloat(row.get("amount")) || 0,
        category: row.get("category") || "",
        note: row.get("note") || "",
        rowIndex: row.rowNumber,
      });
    }
  }
  return expenses;
}

// Get Total Sales for a Branch in Current Month
export async function getSalesByBranchForMonth(
  branchId: string,
  year: number,
  month: number
): Promise<{ totalIncome: number; totalCups: number }> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  const rows = await sheet.getRows();
  let totalIncome = 0;
  let totalCups = 0;

  const monthStr = String(month).padStart(2, "0");
  const yearStr = String(year);

  for (const row of rows) {
    if (row.get("branch_id") !== branchId) continue;
    const dateStr = row.get("date") || "";
    // Expected format: YYYY-MM-DD
    if (dateStr.startsWith(`${yearStr}-${monthStr}`)) {
      totalIncome += parseFloat(row.get("total_price")) || 0;
      totalCups += parseInt(row.get("qty")) || 0;
    }
  }

  return { totalIncome, totalCups };
}

// Get Total Expenses for a Branch in Current Month
export async function getExpensesByBranchForMonth(
  branchId: string,
  year: number,
  month: number
): Promise<number> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_EXPENSES];
  if (!sheet) throw new Error("Sheet 'expenses' not found");

  const rows = await sheet.getRows();
  let totalExpenses = 0;

  const monthStr = String(month).padStart(2, "0");
  const yearStr = String(year);

  for (const row of rows) {
    if (row.get("branch_id") !== branchId) continue;
    const dateStr = row.get("date") || "";
    if (dateStr.startsWith(`${yearStr}-${monthStr}`)) {
      totalExpenses += parseFloat(row.get("amount")) || 0;
    }
  }

  return totalExpenses;
}

// Get Daily Sales for Last 7 Days
export async function getDailySalesForWeek(
  branchId: string
): Promise<{ date: string; income: number }[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  const rows = await sheet.getRows();

  // Generate last 7 days
  const dailyData: Map<string, number> = new Map();
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dailyData.set(dateStr, 0);
  }

  for (const row of rows) {
    if (row.get("branch_id") !== branchId) continue;
    const dateStr = row.get("date");
    if (dailyData.has(dateStr)) {
      const currentAmount = dailyData.get(dateStr) || 0;
      dailyData.set(dateStr, currentAmount + (parseFloat(row.get("total_price")) || 0));
    }
  }

  return Array.from(dailyData.entries()).map(([date, income]) => ({
    date,
    income,
  }));
}

// ================= HISTORY & DATE RANGE FUNCTIONS =================

// Get All Sales by Branch (for history)
export async function getAllSalesByBranch(branchId: string): Promise<Sale[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  const rows = await sheet.getRows();
  const sales: Sale[] = [];

  for (const row of rows) {
    if (row.get("branch_id") === branchId) {
      sales.push({
        branch_id: row.get("branch_id"),
        date: row.get("date"),
        menu_name: row.get("menu_name"),
        qty: parseInt(row.get("qty")) || 0,
        total_price: parseFloat(row.get("total_price")) || 0,
        cogs_total: parseFloat(row.get("cogs_total")) || 0,
        profit: parseFloat(row.get("profit")) || 0,
      });
    }
  }
  return sales;
}

// Get Sales by Branch within Date Range
export async function getSalesByBranchDateRange(
  branchId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<{ totalIncome: number; totalCups: number; sales: Sale[] }> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  const rows = await sheet.getRows();
  let totalIncome = 0;
  let totalCups = 0;
  const sales: Sale[] = [];

  for (const row of rows) {
    if (row.get("branch_id") !== branchId) continue;
    const dateStr = (row.get("date") || "").split(" ")[0]; // Get just the date part (without time)

    if (dateStr >= startDate && dateStr <= endDate) {
      const sale: Sale = {
        branch_id: row.get("branch_id"),
        date: row.get("date"),
        menu_name: row.get("menu_name"),
        qty: parseInt(row.get("qty")) || 0,
        total_price: parseFloat(row.get("total_price")) || 0,
        cogs_total: parseFloat(row.get("cogs_total")) || 0,
        profit: parseFloat(row.get("profit")) || 0,
      };
      sales.push(sale);
      totalIncome += sale.total_price;
      totalCups += sale.qty;
    }
  }

  return { totalIncome, totalCups, sales };
}

// Get Expenses by Branch within Date Range
export async function getExpensesByBranchDateRange(
  branchId: string,
  startDate: string,
  endDate: string
): Promise<{ totalExpenses: number; expenses: Expense[] }> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_EXPENSES];
  if (!sheet) throw new Error("Sheet 'expenses' not found");

  const rows = await sheet.getRows();
  let totalExpenses = 0;
  const expenses: Expense[] = [];

  for (const row of rows) {
    if (row.get("branch_id") !== branchId) continue;
    const dateStr = (row.get("date") || "").split(" ")[0];

    if (dateStr >= startDate && dateStr <= endDate) {
      const expense: Expense = {
        branch_id: row.get("branch_id"),
        date: row.get("date"),
        item_name: row.get("item_name"),
        amount: parseFloat(row.get("amount")) || 0,
        category: row.get("category") || "",
        note: row.get("note") || "",
        rowIndex: row.rowNumber,
      };
      expenses.push(expense);
      totalExpenses += expense.amount;
    }
  }

  return { totalExpenses, expenses };
}

// Get Daily Sales for a specific date range (for charts)
export async function getDailySalesForRange(
  branchId: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; income: number }[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[SHEET_SALES];
  if (!sheet) throw new Error("Sheet 'sales' not found");

  const rows = await sheet.getRows();

  // Generate dates in range
  const dailyData: Map<string, number> = new Map();
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dailyData.set(dateStr, 0);
  }

  for (const row of rows) {
    if (row.get("branch_id") !== branchId) continue;
    const dateStr = (row.get("date") || "").split(" ")[0];
    if (dailyData.has(dateStr)) {
      const currentAmount = dailyData.get(dateStr) || 0;
      dailyData.set(dateStr, currentAmount + (parseFloat(row.get("total_price")) || 0));
    }
  }

  return Array.from(dailyData.entries()).map(([date, income]) => ({
    date,
    income,
  }));
}
