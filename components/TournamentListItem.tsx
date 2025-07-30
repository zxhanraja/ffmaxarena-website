import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, TrophyIcon, CalendarIcon, ClockIcon } from './icons/IconDefs';
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
        <span className={`text-xs px-2.5 py-1 font-semibold rounded-full backdrop-blur-sm ${badgeStyle}`}>
            {content}
        </span>
    );
};

interface TournamentListItemProps {
    tournament: Tournament;
    organizers: Organizer[];
    index: number;
}

const TournamentListItem: React.FC<TournamentListItemProps> = ({ tournament, organizers, index }) => {
    const [statusInfo, setStatusInfo] = useState(getTournamentStatus(tournament));
    const isOrganizerVerified = organizers.some(o => o.name === tournament.organizer_name && o.is_verified);
    
    const safePosterUrl = sanitizeUrl(tournament.poster_url);
    const optimizedPosterUrl = getTransformedImageUrl(safePosterUrl, { width: 256, height: 256, quality: 95, resize: 'cover' });
    const dicebearFallback = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${tournament.title}`;
    
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
            className="glassmorphic rounded-xl group transition-all duration-300 card-glow-border opacity-0 animate-card-enter flex flex-col md:flex-row items-stretch p-4 gap-4"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Link to={`/tournaments/${tournament.id}`} className="flex-shrink-0 w-full h-40 md:w-28 md:h-28 block rounded-lg overflow-hidden">
                <img
                    src={optimizedPosterUrl || dicebearFallback}
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = dicebearFallback }}
                />
            </Link>

            <div className="flex-grow flex flex-col justify-center text-center md:text-left">
                <StatusBadge statusInfo={statusInfo} />
                <Link to={`/tournaments/${tournament.id}`} className="mt-2 text-lg font-bold text-white hover:text-cyan-400 transition-colors">
                    {tournament.title}
                </Link>
                <div className="flex items-center justify-center md:justify-start space-x-1.5 text-sm text-gray-300">
                    <span>by {tournament.organizer_name}</span>
                    {isOrganizerVerified && <ShieldCheckIcon className="w-4 h-4 text-green-400" />}
                </div>
            </div>
            
            <div className="flex-shrink-0 grid grid-cols-3 md:grid-cols-1 gap-2 text-center md:text-left md:border-l md:border-r border-white/10 md:px-6 w-full md:w-auto">
                <div className="py-1">
                    <p className="text-sm font-semibold text-gray-400">Prize Pool</p>
                    <p className="text-lg font-bold text-cyan-400 text-glow">₹{tournament.prize_pool || 'TBA'}</p>
                </div>
                <div className="py-1">
                    <p className="text-sm font-semibold text-gray-400">Entry</p>
                    <p className="text-base font-semibold text-white">{(tournament.entry_fee || 'N/A').toUpperCase()}</p>
                </div>
                <div className="py-1">
                    <p className="text-sm font-semibold text-gray-400">Date</p>
                    <p className="text-base font-semibold text-white">{tournament.date}</p>
                </div>
            </div>

            <div className="w-full md:w-40 flex-shrink-0 flex items-center justify-center">
                 <a href={tournament.registration_link || '#'} target="_blank" rel="noopener noreferrer" className={`w-full text-center block px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${tournament.registration_link && !statusInfo.isCompleted ? 'bg-cyan-400 text-black hover:bg-cyan-300 transform hover:scale-105 shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
                   {statusInfo.isCompleted ? 'View Results' : 'Register Now'}
                </a>
            </div>
        </div>
    );
}

export default React.memo(TournamentListItem);