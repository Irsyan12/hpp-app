import { getCurrentSession, getInventory } from "../actions";
import Navbar from "@/components/Navbar";
import InventoryClient from "@/components/InventoryClient";

export default async function InventoryPage() {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const inventory = await getInventory();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar branchName={session.branch_name} username={session.username} />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Manajemen Stok
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Kelola stok bahan baku cabang {session.branch_name}
                    </p>

                    <InventoryClient initialInventory={inventory} />
                </div>
            </main>
        </div>
    );
}
