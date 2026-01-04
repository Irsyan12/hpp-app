import { getCurrentSession, getHistory } from "../actions";
import Navbar from "@/components/Navbar";
import HistoryClient from "@/components/HistoryClient";

export default async function HistoryPage() {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const history = await getHistory();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar branchName={session.branch_name} username={session.username} />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Riwayat
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Riwayat pemasukan dan pengeluaran cabang {session.branch_name}
                    </p>

                    <HistoryClient history={history} />
                </div>
            </main>
        </div>
    );
}
