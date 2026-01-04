import { getCurrentSession, getExpenses } from "../actions";
import Navbar from "@/components/Navbar";
import ExpensesClient from "@/components/ExpensesClient";

export default async function ExpensesPage() {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const expenses = await getExpenses();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar branchName={session.branch_name} username={session.username} />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Pengeluaran
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Catat pengeluaran harian cabang {session.branch_name}
                    </p>

                    <ExpensesClient initialExpenses={expenses} />
                </div>
            </main>
        </div>
    );
}
