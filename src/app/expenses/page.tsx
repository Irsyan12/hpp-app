import { getCurrentSession, getExpensesWithDateRange } from "../actions";
import Navbar from "@/components/Navbar";
import ExpensesClient from "@/components/ExpensesClient";

interface ExpensesPageProps {
    searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const params = await searchParams;
    const { expenses, startDate, endDate } = await getExpensesWithDateRange(
        params.start,
        params.end
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar branchName={session.branch_name} username={session.username} />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Pengeluaran
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Catat pengeluaran harian cabang {session.branch_name}
                    </p>

                    <ExpensesClient
                        initialExpenses={expenses}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>
            </main>
        </div>
    );
}
