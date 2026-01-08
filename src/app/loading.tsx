"use client";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 h-14" />

            {/* Main Content */}
            <main className="pt-16 pb-20 md:pb-4 md:pl-20 px-4">
                <div className="max-w-6xl mx-auto py-4">
                    {/* Title Skeleton */}
                    <div className="h-8 w-40 bg-gray-200 rounded-lg mb-4 animate-pulse" />

                    {/* Search Bar Skeleton */}
                    <div className="h-12 bg-gray-200 rounded-xl mb-4 animate-pulse" />

                    {/* Category Tabs Skeleton */}
                    <div className="flex gap-2 mb-4">
                        <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
                    </div>

                    {/* Menu Grid Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse"
                            >
                                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
                                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                                <div className="h-5 w-1/2 bg-gray-200 rounded" />
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
