import { getCurrentSession, getMenu, processSale, type MenuItem, type CartItem, type SaleResult } from "./actions";
import Navbar from "@/components/Navbar";
import POSClient from "@/components/POSClient";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const menuItems = await getMenu();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar branchName={session.branch_name} username={session.username} />

      {/* Main Content */}
      <main className="pt-16 pb-4 md:pl-20 px-4">
        <div className="max-w-6xl mx-auto py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Point of Sale
          </h1>

          <POSClient initialMenu={menuItems} />
        </div>
      </main>
    </div>
  );
}
