import React from 'react';

interface SkeletonCardProps {
    isOrganizer?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ isOrganizer = false }) => {
    return (
        <div className="glassmorphic rounded-xl overflow-hidden group flex flex-col">
            <div className="shimmer-bg h-52 w-full"></div>
            <div className="p-4 space-y-3 flex-grow flex flex-col">
                {isOrganizer ? (
                    <>
                        <div className="shimmer-bg h-5 w-3/4 rounded-md mx-auto"></div>
                        <div className="flex-grow flex justify-center items-center flex-wrap gap-2 mt-4">
                            <div className="shimmer-bg h-5 w-24 rounded-full"></div>
                            <div className="shimmer-bg h-5 w-28 rounded-full"></div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
                             <div className="shimmer-bg h-8 w-16 rounded-md mx-auto"></div>
                             <div className="shimmer-bg h-8 w-16 rounded-md mx-auto"></div>
                             <div className="shimmer-bg h-8 w-16 rounded-md mx-auto"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center">
                            <div className="shimmer-bg h-4 w-1/4 rounded-md"></div>
                            <div className="shimmer-bg h-5 w-1/3 rounded-md"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="shimmer-bg h-4 w-1/3 rounded-md"></div>
                            <div className="shimmer-bg h-5 w-1/4 rounded-md"></div>
                        </div>
                         <div className="mt-auto pt-2">
                             <div className="shimmer-bg h-12 w-full rounded-lg"></div>
                         </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SkeletonCard;
