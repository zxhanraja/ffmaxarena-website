import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MenuIcon, XIcon, TrophyIcon } from './icons/IconDefs';


const NavItem: React.FC<{ to: string; children: React.ReactNode; badgeCount?: number }> = React.memo(({ to, children, badgeCount = 0 }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `relative block sm:inline-block px-3 py-2 text-sm font-medium transition-colors group ${
            isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {children}
                {badgeCount > 0 && (
                    <span className="absolute top-1 -right-2.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-black bg-cyan-400 rounded-full">
                        {badgeCount}
                    </span>
                )}
                <span className={`absolute bottom-0 left-0 block h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full ${isActive ? 'w-full' : 'w-0'}`} />
            </>
        )}
    </NavLink>
));

const MobileNavItem: React.FC<{ to: string; onClick: () => void; children: React.ReactNode; index: number; isOpen: boolean, badgeCount?: number }> = React.memo(({ to, onClick, children, index, isOpen, badgeCount = 0 }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `relative block w-full py-4 text-center font-orbitron text-2xl tracking-wider transition-all duration-300 ${
            isActive ? 'text-cyan-400 tracking-widest' : 'text-white hover:text-cyan-400 hover:tracking-widest'
            }`
        }
        style={{
            transitionDelay: `${50 + index * 50}ms`,
            transform: isOpen ? 'translateY(0)' : 'translateY(15px)',
            opacity: isOpen ? 1 : 0,
        }}
    >
        {children}
        {badgeCount > 0 && (
            <span className="absolute top-1/2 -translate-y-1/2 ml-2 inline-flex items-center justify-center h-6 w-6 text-xs font-bold leading-none text-black bg-cyan-400 rounded-full">
                {badgeCount}
            </span>
        )}
    </NavLink>
));


const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <>
            <nav className="bg-black/20 backdrop-blur-lg sticky top-0 z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-3">
                                <TrophyIcon className="h-8 w-auto text-cyan-400" />
                                <span className="text-xl font-bold font-orbitron text-white">FFMaxArena</span>
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <NavItem to="/">Home</NavItem>
                                <NavItem to="/tournaments">Tournaments</NavItem>
                                <NavItem to="/organizers">Verified Organizers</NavItem>
                                <NavItem to="/contact">Contact</NavItem>
                            </div>
                        </div>
                        
                         <div className="hidden md:flex items-center space-x-4">
                            <Link to="/submit">
                                <button className="flex items-center space-x-2 bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                                    <span>Submit Tournament</span>
                                </button>
                            </Link>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                type="button"
                                className="bg-white/10 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                aria-controls="mobile-menu"
                                aria-expanded={isOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                <MenuIcon className="block h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-gradient-to-b from-black via-[#0a0a14] to-black transition-opacity duration-300 ease-in-out md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                id="mobile-menu"
            >
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
                            <TrophyIcon className="h-8 w-auto text-cyan-400" />
                            <span className="text-xl font-bold font-orbitron text-white">FFMaxArena</span>
                        </Link>
                        <button onClick={() => setIsOpen(false)} type="button" className="p-2 rounded-md text-gray-400 hover:text-white">
                            <span className="sr-only">Close menu</span>
                            <XIcon className="block h-7 w-7" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col h-[calc(100%-5rem)] pt-16 pb-10">
                        <div className="text-center space-y-2">
                           <MobileNavItem to="/" onClick={() => setIsOpen(false)} index={0} isOpen={isOpen}>Home</MobileNavItem>
                            <MobileNavItem to="/tournaments" onClick={() => setIsOpen(false)} index={1} isOpen={isOpen}>Tournaments</MobileNavItem>
                            <MobileNavItem to="/organizers" onClick={() => setIsOpen(false)} index={2} isOpen={isOpen}>Verified Organizers</MobileNavItem>
                            <MobileNavItem to="/contact" onClick={() => setIsOpen(false)} index={3} isOpen={isOpen}>Contact</MobileNavItem>
                        </div>
                        
                        <div 
                            className="mt-auto w-full max-w-sm mx-auto transition-all duration-500"
                            style={{
                                transitionDelay: '300ms',
                                transform: isOpen ? 'translateY(0)' : 'translateY(15px)',
                                opacity: isOpen ? 1 : 0,
                            }}
                        >
                            <Link to="/submit" onClick={() => setIsOpen(false)}>
                                <button className="w-full text-center flex items-center justify-center space-x-2 bg-cyan-500 text-black font-bold py-4 px-6 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                                    <span>Submit Tournament</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;