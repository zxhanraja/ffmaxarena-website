import React from 'react';
import SkeletonCard from './SkeletonCard';

const OrganizerDetailSkeleton: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 animate-pulse">
            {/* Organizer Header Skeleton */}
            <section>
                <div className="glassmorphic rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 card-glow-border shimmer-bg">
                    <div className="w-32 h-32 rounded-full bg-white/10 flex-shrink-0"></div>
                    <div className="text-center md:text-left flex-grow">
                        <div className="h-10 w-3/4 md:w-1/2 rounded-md bg-white/10 mx-auto md:mx-0"></div>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3">
                           <div className="h-6 w-24 rounded-md bg-white/10"></div>
                           <div className="h-6 w-24 rounded-md bg-white/10"></div>
                           <div className="h-6 w-24 rounded-md bg-white/10"></div>
                        </div>
                    </div>
                     <div className="md:ml-auto flex-shrink-0 grid grid-cols-2 gap-6 text-center">
                        <div>
                            <div className="h-8 w-12 rounded-md bg-white/10 mx-auto"></div>
                            <div className="h-4 w-28 rounded-md bg-white/10 mt-2"></div>
                        </div>
                        <div>
                            <div className="h-8 w-12 rounded-md bg-white/10 mx-auto"></div>
                            <div className="h-4 w-24 rounded-md bg-white/10 mt-2"></div>
                        </div>
                    </div>
                </div>
            </section>

             {/* About Section Skeleton */}
            <section>
                 <div className="h-8 w-1/3 rounded-md bg-white/10 mb-4"></div>
                 <div className="glassmorphic p-6 rounded-lg shimmer-bg">
                    <div className="space-y-3">
                        <div className="h-4 w-full rounded-md bg-white/5"></div>
                        <div className="h-4 w-5/6 rounded-md bg-white/5"></div>
                    </div>
                 </div>
            </section>

            {/* Tournaments Section Skeleton */}
            <section>
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="h-8 w-1/2 sm:w-1/3 rounded-md bg-white/10"></div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/20">
                         <div className="h-9 w-28 rounded-md bg-white/10"></div>
                         <div className="h-9 w-28 rounded-md bg-white/10"></div>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
            </section>
        </div>
    );
};

export default OrganizerDetailSkeleton;
