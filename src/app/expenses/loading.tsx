"use client";

export default function ExpensesLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 h-14" />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-4xl mx-auto py-4">
                    {/* Title and Button Skeleton */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
                    </div>

                    {/* Stats Summary Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Expenses List Skeleton */}
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
                                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Nav Skeleton - Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 md:hidden" />
        </div>
    );
}
