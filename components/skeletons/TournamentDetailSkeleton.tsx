import React from 'react';

const TournamentDetailSkeleton: React.FC = () => {
    return (
        <div className="pb-24 animate-pulse">
            {/* Poster Banner Skeleton */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden shimmer-bg">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6">
                    <div className="shimmer-bg h-10 w-3/4 md:w-1/2 rounded-md"></div>
                    <div className="shimmer-bg h-6 w-1/3 md:w-1/4 rounded-md mt-3"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-40px]">
                 <div className="relative z-10 glassmorphic p-4 sm:p-6 rounded-lg border border-white/10 shimmer-bg h-24"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="glassmorphic p-4 rounded-lg shimmer-bg h-28"></div>
                            ))}
                        </div>

                        {/* Description Skeleton */}
                        <div className="glassmorphic p-6 rounded-lg card-glow-border space-y-4 shimmer-bg">
                            <div className="h-8 w-3/4 rounded-md bg-white/5"></div>
                            <div className="h-4 w-full rounded-md bg-white/5"></div>
                            <div className="h-4 w-5/6 rounded-md bg-white/5"></div>
                            <div className="h-4 w-full rounded-md bg-white/5"></div>
                             <div className="h-6 w-1/2 rounded-md bg-white/5 mt-6"></div>
                             <div className="h-4 w-full rounded-md bg-white/5"></div>
                             <div className="h-4 w-4/6 rounded-md bg-white/5"></div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glassmorphic p-6 rounded-lg card-glow-border space-y-6 shimmer-bg">
                            <div className="h-7 w-1/2 rounded-md bg-white/5"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-1/4 rounded-md bg-white/5"></div>
                                <div className="h-5 w-3/4 rounded-md bg-white/5"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-1/3 rounded-md bg-white/5"></div>
                                <div className="h-5 w-1/2 rounded-md bg-white/5"></div>
                            </div>
                             <div className="space-y-3 pt-4">
                                <div className="h-12 w-full rounded-lg bg-white/5"></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-10 w-full rounded-lg bg-white/5"></div>
                                    <div className="h-10 w-full rounded-lg bg-white/5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetailSkeleton;
