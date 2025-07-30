import React from 'react';

const Spinner: React.FC<{ size?: string; color?: string; className?: string }> = ({ size = 'w-5 h-5', color = 'border-white', className = '' }) => {
    return (
        <div
            className={`${size} ${color} border-t-transparent border-solid animate-spin rounded-full border-2 ${className}`}
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
