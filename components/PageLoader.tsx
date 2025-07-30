import React from 'react';

const PageLoader: React.FC = () => {
    // This component is used as a fallback for React Suspense during page transitions.
    // It now uses the same trophy icon as the initial app loader to provide a consistent
    // and branded loading experience, preventing a jarring white screen flash while
    // the next page's code is loading.
    // The height `h-[calc(100vh-280px)]` centers the loader within the main content
    // area between the header and footer.
    return (
        <div className="flex justify-center items-center h-[calc(100vh-280px)]" aria-live="polite" aria-busy="true">
            <svg className="animate-pulse-glow" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
        </div>
    );
};

export default PageLoader;