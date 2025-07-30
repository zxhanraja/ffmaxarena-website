

import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Tournament, Organizer } from '../types';
import { getTournamentStatus, TournamentStatus } from '../utils/time';
import { getTransformedImageUrl, sanitizeUrl } from '../utils/helper';
import { 
    TrophyIcon, 
    UsersIcon, 
    ShieldCheckIcon, 
    ClockIcon, 
    MapPinIcon, 
    DiscordIcon, 
    WhatsappIcon,
    CalendarIcon,
    TagIcon,
    CheckCircleIcon,
    XIcon,
    ArrowLeftIcon,
    ShareIcon,
    CopyIcon,
    TwitterIcon,
    FacebookIcon,
    YoutubeIcon
} from '../components/icons/IconDefs';
import { useNotifier } from '../contexts/NotificationContext';
import { supabase } from '../supabaseClient';
import TournamentDetailSkeleton from '../components/skeletons/TournamentDetailSkeleton';
import DefaultBanner from '../components/DefaultBanner';


// --- Local Helper Components ---

function parseTime(timeStr: string): { hours: number; minutes: number } {
    if (!timeStr || !timeStr.includes(':') || !timeStr.includes(' ')) {
        return { hours: 0, minutes: 0 };
    }
    const [time, ampm] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (ampm.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    }
    if (ampm.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }
    return { hours, minutes };
}

const CountdownDisplay: React.FC<{ targetDateTime: Date }> = ({ targetDateTime }) => {
    const calculateTimeLeft = () => {
        const difference = targetDateTime.getTime() - new Date().getTime();
        let timeLeft = { days: 0, hours: 0, mins: 0, secs: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                mins: Math.floor((difference / 1000 / 60) % 60),
                secs: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDateTime]);

    const CountdownBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <div className="text-center">
            <div className="text-2xl font-bold font-orbitron text-white bg-black/30 px-2 py-1 rounded-md min-w-[40px]">{String(value).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
        </div>
    );
    
    if (!timeLeft.days && !timeLeft.hours && !timeLeft.mins && !timeLeft.secs) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <CountdownBox value={timeLeft.days} label="Days" />
            <CountdownBox value={timeLeft.hours} label="Hours" />
            <CountdownBox value={timeLeft.mins} label="Mins" />
            <CountdownBox value={timeLeft.secs} label="Secs" />
        </div>
    );
};

const StatGridItem: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => (
    <div className="glassmorphic p-4 rounded-lg text-center card-glow-border h-full flex flex-col justify-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-cyan-400 mb-2">
            {icon}
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="font-bold text-white text-lg truncate">{value || 'N/A'}</p>
    </div>
);

const SidebarInfoItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode | string | null }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-cyan-400 mt-0.5">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-base font-semibold text-white break-words">{value || 'N/A'}</p>
        </div>
    </div>
);

const SidebarActionButton: React.FC<{ href: string | null; icon: React.ReactNode; text: string; color?: 'primary' | 'green' | 'purple' | 'red' | 'dark' }> = ({ href, icon, text, color = 'dark' }) => {
    const disabled = !href;
    const baseClasses = "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform text-sm";
    
    const colorClasses = {
        primary: "bg-cyan-400 text-black hover:bg-cyan-300 hover:scale-105 soft-glow",
        green: "bg-green-600/90 text-white hover:bg-green-600",
        purple: "bg-indigo-600/90 text-white hover:bg-indigo-600",
        red: "bg-red-700/90 text-white hover:bg-red-700",
        dark: "bg-white/10 text-white hover:bg-white/20",
    };
    const disabledClasses = "bg-gray-800 text-gray-500 cursor-not-allowed";
    const finalClasses = `${baseClasses} ${disabled ? disabledClasses : colorClasses[color]}`;

    return (
        <a href={href || undefined} target="_blank" rel="noopener noreferrer" className={finalClasses} onClick={(e) => disabled && e.preventDefault()}>
            {icon}<span>{text}</span>
        </a>
    );
};

const ShareModal: React.FC<{ tournament: Tournament; onClose: () => void }> = ({ tournament, onClose }) => {
    const [copied, setCopied] = useState(false);
    const notifier = useNotifier();
    const tournamentUrl = window.location.href;

    const shareOptions = [
        { name: 'WhatsApp', icon: <WhatsappIcon className="w-7 h-7" />, href: `https://wa.me/?text=${encodeURIComponent(`Check out this tournament: ${tournament.title} on FFMaxArena!\n${tournamentUrl}`)}`, color: 'bg-[#25D366]' },
        { name: 'X / Twitter', icon: <TwitterIcon className="w-6 h-6" />, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(tournamentUrl)}&text=${encodeURIComponent(`Check out this Free Fire Max tournament: ${tournament.title} on FFMaxArena!`)}&hashtags=FFMaxArena,FreeFire,Esports`, color: 'bg-black' },
        { name: 'Facebook', icon: <FacebookIcon className="w-6 h-6" />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tournamentUrl)}`, color: 'bg-[#1877F2]' },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(tournamentUrl).then(() => {
            setCopied(true);
            notifier.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            notifier.error('Failed to copy link.');
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <ShareIcon className="h-7 h-7 text-cyan-400" />
                        <h2 className="text-xl font-bold font-orbitron text-white">Share Tournament</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full bg-white/10 hover:bg-white/20">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-gray-400">Share this tournament with your friends and teammates!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {shareOptions.map(option => (
                            <a key={option.name} href={option.href} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold transition-transform transform hover:scale-105 ${option.color}`}>
                                {option.icon}
                                <span>{option.name}</span>
                            </a>
                        ))}
                    </div>
                     <div className="relative">
                        <input type="text" readOnly value={tournamentUrl} className="w-full bg-white/5 border border-white/20 rounded-lg pl-4 pr-24 py-3 text-white" />
                        <button onClick={handleCopy} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors">
                           {copied ? <CheckCircleIcon className="w-5 h-5"/> : <CopyIcon className="w-5 h-5"/>}
                           {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const TournamentDetailPage: React.FC = () => {
    const { id } = useParams<{id: string}>();
    
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [organizerInfo, setOrganizerInfo] = useState<Organizer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const [statusInfo, setStatusInfo] = useState<TournamentStatus | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) {
                setError(true); return;
            }
            setLoading(true);
            
            const { data: tourData, error: tourError } = await supabase.from('tournaments').select('*').eq('id', id).single();

            if (tourError || !tourData) {
                console.error("Error fetching tournament:", tourError);
                setError(true); setLoading(false);
                return;
            }
            setTournament(tourData);

            const { data: orgData, error: orgError } = await supabase.from('organizers').select('*').eq('name', tourData.organizer_name).single();
            if (!orgError && orgData) setOrganizerInfo(orgData);
            
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (!tournament) return;
        
        const update = () => setStatusInfo(getTournamentStatus(tournament));
        update();
        const timer = setInterval(update, 1000 * 30);
        return () => clearInterval(timer);
    }, [tournament]);
    
    if (loading) return <TournamentDetailSkeleton />;
    if (error || !tournament) return <Navigate to="/404" />;
    if (!statusInfo) return <TournamentDetailSkeleton />;
    
    const { hours, minutes } = parseTime(tournament.time);
    const tournamentDateTime = new Date(tournament.date);
    tournamentDateTime.setUTCHours(hours, minutes, 0, 0);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date Not Available';
        const dateObj = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(dateObj);
    };

    const DESCRIPTION_TRUNCATE_LENGTH = 300;
    const needsTruncation = tournament.description && tournament.description.length > DESCRIPTION_TRUNCATE_LENGTH;

    return (
        <div className="pb-16 sm:pb-24">
            {isShareModalOpen && <ShareModal tournament={tournament} onClose={() => setIsShareModalOpen(false)} />}
            
            {/* New Banner Section */}
            <div className="relative h-auto md:h-80 w-full overflow-hidden bg-gradient-to-b from-slate-950/80 via-black to-black">
                <div className="absolute inset-0 animate-light-ray-pan opacity-50 z-0"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-0"></div>

                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-10">
                    <div className="mb-6 md:mb-8">
                        <Link 
                            to="/tournaments" 
                            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors group bg-black/30 hover:bg-black/50 px-4 py-2 rounded-lg border border-white/20 text-sm backdrop-blur-sm"
                        >
                            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="font-medium">All Tournaments</span>
                        </Link>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                        {/* Left side: Text info */}
                        <div className="text-center md:text-left z-10 order-2 md:order-1">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-orbitron text-white drop-shadow-lg">{tournament.title}</h1>
                            <div className="mt-4 text-base text-gray-300 drop-shadow-md flex items-center justify-center md:justify-start space-x-2">
                                <span>Organized by</span>
                                <span className="font-semibold text-white">{tournament.organizer_name}</span>
                                {organizerInfo?.is_verified && <ShieldCheckIcon className="w-5 h-5 text-green-400" />}
                            </div>
                        </div>

                        {/* Right side: Trophy hologram */}
                        <div className="relative z-10 order-1 md:order-2 flex justify-center md:justify-end md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
                            <div className="relative flex flex-col items-center">
                                <TrophyIcon 
                                    className="w-24 h-24 text-cyan-400 relative z-10 animate-float"
                                    style={{ filter: 'drop-shadow(0 0 15px hsl(var(--primary)/ 0.8))' }}
                                />
                                <div
                                    className="absolute -bottom-10 h-32 w-32"
                                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 65%)' }}
                                ></div>
                                <div 
                                    className="absolute -bottom-4 w-48 h-2 rounded-[50%] border-t border-cyan-400/30 animate-projector-pulse"
                                    style={{ transform: 'translateX(-50%) perspective(40px) rotateX(20deg)' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Status & Countdown Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="glassmorphic p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${statusInfo.isLive ? 'bg-red-500/80 text-white' : 'bg-cyan-500/80 text-black'}`}>{statusInfo.status}</span>
                    </div>
                    {statusInfo.isUpcoming && <CountdownDisplay targetDateTime={tournamentDateTime} />}
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Stats & Description) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatGridItem icon={<TrophyIcon className="w-6 h-6"/>} label="Prize Pool" value={`₹${tournament.prize_pool || 'TBA'}`} />
                            <StatGridItem icon={<CheckCircleIcon className="w-6 h-6"/>} label="Entry Fee" value={(tournament.entry_fee || 'N/A').toUpperCase()} />
                            <StatGridItem icon={<UsersIcon className="w-6 h-6"/>} label="Game Mode" value={tournament.game_mode} />
                            <StatGridItem icon={<MapPinIcon className="w-6 h-6"/>} label="Map" value={tournament.map} />
                        </div>

                        {/* Description & Rules Card */}
                        <div className="glassmorphic p-6 rounded-lg card-glow-border">
                             <h2 className="text-2xl font-bold font-orbitron text-white mb-6">Description & Rules</h2>
                             <div className="prose prose-invert prose-sm text-gray-300 max-w-none">
                                <p className={`whitespace-pre-wrap break-words transition-all duration-300 ${!isDescriptionExpanded && needsTruncation ? 'line-clamp-5' : 'line-clamp-none'}`}>
                                    {tournament.description || 'No additional information provided by the organizer.'}
                                </p>
                            </div>
                            {needsTruncation && (
                                <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-cyan-400 hover:text-cyan-300 font-semibold mt-2 text-sm">
                                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                        <div className="glassmorphic p-6 rounded-lg card-glow-border space-y-6">
                            <h3 className="text-2xl font-bold font-orbitron text-white">Tournament Info</h3>
                            <div className="space-y-4">
                               <SidebarInfoItem icon={<CalendarIcon className="w-5 h-5"/>} label="Date" value={formatDate(tournament.date)} />
                               <SidebarInfoItem icon={<ClockIcon className="w-5 h-5"/>} label="Time" value={tournament.time} />
                               <SidebarInfoItem icon={<UsersIcon className="w-5 h-5"/>} label="Max Participants" value={tournament.max_participants} />
                            </div>
                            <div className="space-y-3 pt-6 border-t border-white/20">
                                <SidebarActionButton href={tournament.registration_link} icon={<TrophyIcon className="w-5 h-5"/>} text={statusInfo.isCompleted ? 'View Results' : 'Register Now'} color="primary" />
                                <div className="grid grid-cols-2 gap-3">
                                    <SidebarActionButton href={tournament.whatsapp_link} icon={<WhatsappIcon className="w-5 h-5"/>} text="WhatsApp" color="green" />
                                    <SidebarActionButton href={tournament.discord_link} icon={<DiscordIcon className="w-5 h-5"/>} text="Discord" color="purple" />
                                </div>
                                <SidebarActionButton href={tournament.youtube_link} icon={<YoutubeIcon className="w-5 h-5" />} text="Watch on YouTube" color="red" />
                                <button onClick={() => setIsShareModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform bg-white/10 text-white hover:bg-white/20 text-sm">
                                    <ShareIcon className="w-5 h-5"/>
                                    <span>Share Tournament</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetailPage;