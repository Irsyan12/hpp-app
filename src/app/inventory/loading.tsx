"use client";

export default function InventoryLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 h-14" />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    {/* Title Skeleton */}
                    <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-5 w-56 bg-gray-200 rounded mb-6 animate-pulse" />

                    {/* Table Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-gray-50 px-4 py-3 flex gap-4">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                        {/* Table Rows */}
                        <div className="divide-y divide-gray-100">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="px-4 py-3 flex items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
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
