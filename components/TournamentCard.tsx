import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, TrophyIcon } from './icons/IconDefs';
import { Tournament, Organizer } from '../types';
import { getTournamentStatus, TournamentStatus } from '../utils/time';
import { sanitizeUrl, getTransformedImageUrl } from '../utils/helper';

const StatusBadge: React.FC<{ statusInfo: TournamentStatus }> = ({ statusInfo }) => {
    let badgeStyle = '';
    let content: React.ReactNode = statusInfo.message;

    if (statusInfo.isLive) {
        badgeStyle = 'bg-red-600/90 text-white shadow-lg shadow-red-500/30';
        content = (
            <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-white rounded-full animate-flashing-dot"></span>
                <span className="font-bold tracking-wider">LIVE</span>
            </div>
        );
    } else if (statusInfo.isUpcoming) {
        badgeStyle = 'bg-cyan-500/80 text-black';
    } else if (statusInfo.isCompleted) {
        badgeStyle = 'bg-gray-700/80 text-gray-300';
    }

    return (
        <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 font-semibold rounded-full backdrop-blur-sm ${badgeStyle}`}>
            {content}
        </span>
    );
};

interface TournamentCardProps {
    tournament: Tournament;
    organizers: Organizer[];
    index: number;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, organizers, index }) => {
    const [statusInfo, setStatusInfo] = useState(getTournamentStatus(tournament));
    const isOrganizerVerified = organizers.some(o => o.name === tournament.organizer_name && o.is_verified);
    const safePosterUrl = sanitizeUrl(tournament.poster_url);
    
    useEffect(() => {
        if (statusInfo.isCompleted) return;

        const timer = setInterval(() => {
            const newStatus = getTournamentStatus(tournament);
            setStatusInfo(newStatus);
            if (newStatus.isCompleted) {
                clearInterval(timer);
            }
        }, 30000); // Update every 30 seconds

        return () => clearInterval(timer);
    }, [tournament, statusInfo.isCompleted]);

    return (
        <div 
          className="glassmorphic rounded-xl overflow-hidden group transition-all duration-300 card-glow-border opacity-0 animate-card-enter flex flex-col"
          style={{ animationDelay: `${index * 75}ms` }}
        >
            <div className="relative">
                <Link to={`/tournaments/${tournament.id}`} className="block h-48 sm:h-52 w-full">
                    {safePosterUrl ? (
                        <img 
                            src={getTransformedImageUrl(safePosterUrl, { width: 1024, quality: 95 })!} 
                            alt={tournament.title} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                           <TrophyIcon className="w-16 h-16 text-gray-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                </Link>
                
                <StatusBadge statusInfo={statusInfo} />
                
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg drop-shadow-lg">{tournament.title}</h3>
                    <div className="flex items-center space-x-1.5 text-sm text-gray-300 drop-shadow-md">
                       <span>by {tournament.organizer_name}</span>
                       {isOrganizerVerified && <ShieldCheckIcon className="w-4 h-4 text-green-400" />}
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3 flex-grow">
                <div className="flex justify-between items-center">
                     <p className="text-sm font-semibold text-gray-400">Prize Pool</p>
                     <p className="text-lg font-bold text-cyan-400 text-glow">₹{tournament.prize_pool || 'TBA'}</p>
                </div>
                 <div className="flex justify-between items-center">
                     <p className="text-sm font-semibold text-gray-400">Entry</p>
                     <p className="text-base font-semibold text-white">{(tournament.entry_fee || 'N/A').toUpperCase()}</p>
                </div>
            </div>
            <div className="p-4 pt-2 mt-auto">
                 <a href={tournament.registration_link || '#'} target="_blank" rel="noopener noreferrer" className={`w-full text-center block px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${tournament.registration_link && !statusInfo.isCompleted ? 'bg-cyan-400 text-black hover:bg-cyan-300 transform hover:scale-105 shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
                   {statusInfo.isCompleted ? 'View Results' : 'Register Now'}
                </a>
            </div>
        </div>
    );
};


export default React.memo(TournamentCard);