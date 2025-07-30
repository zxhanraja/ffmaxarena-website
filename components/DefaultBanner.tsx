import React from 'react';
import { TrophyIcon } from './icons/IconDefs';

const DefaultBanner: React.FC = () => {
    return (
        <div className="w-full h-full bg-gradient-to-b from-gray-900/90 via-black to-black overflow-hidden relative">
            {/* Animated Light Rays */}
            <div className="absolute inset-0 animate-light-ray-pan opacity-60"></div>
            
            {/* Reflective Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

            {/* Central Hologram Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center">
                    {/* Floating Trophy Icon */}
                    <TrophyIcon 
                        className="w-20 h-20 sm:w-24 sm:h-24 text-cyan-400 relative z-10 animate-float"
                        style={{ filter: 'drop-shadow(0 0 15px hsl(var(--primary)/ 0.8))' }}
                    />
                    
                    {/* Projector Glow */}
                    <div
                        className="absolute -bottom-10 h-28 w-28 sm:h-32 sm:w-32"
                        style={{
                            background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                        }}
                    ></div>
                    
                    {/* Projector Ring on Floor */}
                    <div 
                        className="absolute -bottom-4 w-48 h-2 rounded-[50%] border-t border-cyan-400/30 animate-projector-pulse"
                        style={{ transform: 'translateX(-50%) perspective(40px) rotateX(20deg)' }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default DefaultBanner;