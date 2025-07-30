import React from 'react';
import { Link } from 'react-router-dom';
import { TrophyIcon, ArrowRightIcon, SearchIcon } from './icons/IconDefs';

interface EmptyStateProps {
    title: string;
    message: string;
    buttonText?: string;
    buttonLink?: string;
    onButtonClick?: () => void;
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    message,
    buttonText,
    buttonLink,
    onButtonClick,
    icon = <div className="w-40 h-40 mx-auto flex items-center justify-center bg-white/5 rounded-full border-2 border-dashed border-gray-700"><SearchIcon className="w-16 h-16 text-gray-600" /></div>
}) => {
    const ButtonContent = () => (
        <>
            {buttonText}
            {buttonLink && <ArrowRightIcon className="ml-2 h-4 w-4" />}
        </>
    );

    return (
        <div className="glassmorphic border-dashed border-gray-700 rounded-lg p-8 sm:p-12 text-center">
            <div className="mx-auto">{icon}</div>
            <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">{message}</p>
            {(buttonLink || onButtonClick) && buttonText && (
                <div className="mt-6">
                    {buttonLink ? (
                        <Link to={buttonLink} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-colors">
                            <ButtonContent />
                        </Link>
                    ) : (
                        <button onClick={onButtonClick} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-colors">
                            <ButtonContent />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;