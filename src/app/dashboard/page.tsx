import { getCurrentSession, getDashboardStats } from "../actions";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";

interface DashboardPageProps {
    searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const params = await searchParams;
    const stats = await getDashboardStats(params.start, params.end);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar branchName={session.branch_name} username={session.username} />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-5xl mx-auto py-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Ringkasan arus kas • {session.branch_name}
                    </p>

                    <DashboardClient stats={stats} />
                </div>
            </main>
        </div>
    );
}
