"use client";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 h-14" />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    {/* Title Skeleton */}
                    <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-5 w-64 bg-gray-200 rounded mb-6 animate-pulse" />

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-200 rounded-2xl h-32 animate-pulse"
                            />
                        ))}
                    </div>

                    {/* Low Stock Table Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Nav Skeleton - Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 md:hidden" />
        </div>
    );
}
