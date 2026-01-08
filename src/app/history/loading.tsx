"use client";

export default function HistoryLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 h-14" />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    {/* Title Skeleton */}
                    <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-5 w-64 bg-gray-200 rounded mb-6 animate-pulse" />

                    {/* Date Filter Skeleton */}
                    <div className="flex gap-3 mb-6">
                        <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
                    </div>

                    {/* Summary Card Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="grid grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="text-center">
                                    <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                                    <div className="h-6 w-24 bg-gray-200 rounded mx-auto animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transaction List Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="px-4 py-3 flex items-center gap-4">
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
                                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
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
