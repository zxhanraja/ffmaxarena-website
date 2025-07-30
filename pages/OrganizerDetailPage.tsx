import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Organizer, Tournament } from '../types';
import { ShieldCheckIcon, TrophyIcon, UsersIcon, StarIcon, WhatsappIcon, DiscordIcon, YoutubeIcon, InstagramIcon, MailIcon, ArrowLeftIcon } from '../components/icons/IconDefs';
import TournamentCard from '../components/TournamentCard';
import EmptyState from '../components/EmptyState';
import { getTournamentStatus } from '../utils/time';
import { parsePlayerCount, formatNumber, sanitizeUrl, getTransformedImageUrl } from '../utils/helper';
import { supabase } from '../supabaseClient';
import OrganizerDetailSkeleton from '../components/skeletons/OrganizerDetailSkeleton';
import { useData } from '../contexts/DataContext';


const SocialLink: React.FC<{ href: string | null | undefined; icon: React.ReactNode; }> = ({ href, icon }) => {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
            {icon}
        </a>
    );
};

const StatItem: React.FC<{ value: string; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-3xl font-bold font-orbitron text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);


const OrganizerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [filter, setFilter] = useState<'Upcoming' | 'Completed'>('Upcoming');
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);

    const [organizer, setOrganizer] = useState<Organizer | null>(null);
    const [organizerTournaments, setOrganizerTournaments] = useState<Tournament[]>([]);
    const { organizers: allOrganizers, loading: allOrganizersLoading } = useData();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOrganizerData = async () => {
            if (!id) {
                setError(true);
                return;
            }
            setLoading(true);

            // Fetch the specific organizer
            const { data: orgData, error: orgError } = await supabase
                .from('organizers')
                .select('*')
                .eq('id', id)
                .single();
            
            if (orgError || !orgData) {
                console.error("Error fetching organizer", orgError);
                setError(true);
                setLoading(false);
                return;
            }

            setOrganizer(orgData);

            // Fetch tournaments by this organizer
            const { data: tourData, error: tourError } = await supabase
                .from('tournaments')
                .select('*')
                .eq('organizer_name', orgData.name);

            if (tourError) {
                console.error("Error fetching tournaments for organizer", tourError);
            } else {
                setOrganizerTournaments(tourData || []);
            }

            setLoading(false);
        };
        fetchOrganizerData();
    }, [id]);
    
    const processedTournaments = useMemo(() => {
        return organizerTournaments.map(t => ({ ...t, statusInfo: getTournamentStatus(t) }));
    }, [organizerTournaments]);

    const { upcomingTournaments, completedTournaments, totalPlayersServed } = useMemo(() => {
        const upcoming = processedTournaments
            .filter(t => !t.statusInfo.isCompleted)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const completed = processedTournaments
            .filter(t => t.statusInfo.isCompleted)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const players = completed.reduce((acc, t) => acc + parsePlayerCount(t.max_participants), 0);
        return { upcomingTournaments: upcoming, completedTournaments: completed, totalPlayersServed: players };
    }, [processedTournaments]);

    const tournamentsToShow = filter === 'Upcoming' ? upcomingTournaments : completedTournaments;

    if (loading || allOrganizersLoading) {
        return <OrganizerDetailSkeleton />;
    }

    if (error || !organizer) {
        return <Navigate to="/404" />;
    }
    
    const dicebearFallback = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${organizer.name}`;
    const safeLogoUrl = sanitizeUrl(organizer.logo_url) ?? dicebearFallback;
    const optimizedLogoUrl = getTransformedImageUrl(safeLogoUrl, { width: 384, quality: 98 });

    const ABOUT_TRUNCATE_LENGTH = 300;
    const needsTruncation = organizer.about && organizer.about.length > ABOUT_TRUNCATE_LENGTH;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-16">
            <Link 
                to="/organizers" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
                <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to All Organizers</span>
            </Link>
            
            {/* Redesigned Header */}
            <header className="flex flex-col md:flex-row items-center gap-8">
                 <img 
                    src={optimizedLogoUrl!}
                    alt={`${organizer.name} logo`}
                    className="h-40 w-40 rounded-full bg-slate-800 p-2 border-2 border-slate-700 flex-shrink-0 soft-glow"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== dicebearFallback) {
                            target.src = dicebearFallback;
                        }
                    }}
                />
                <div className="text-center md:text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold font-orbitron text-white">{organizer.name}</h1>
                    {organizer.is_verified && <p className="text-lg font-semibold text-green-400 flex items-center justify-center md:justify-start gap-2 mt-2"><ShieldCheckIcon className="w-6 h-6"/> Verified Organizer</p>}
                    
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-3 text-gray-400">
                        <div className="flex items-center gap-2">
                           <MailIcon className="w-5 h-5"/>
                           <span>{organizer.contact_email}</span>
                        </div>
                         {organizer.whatsapp_number && <div className="flex items-center gap-2"><WhatsappIcon className="w-5 h-5"/><span>{organizer.whatsapp_number}</span></div>}
                    </div>
                     <div className="mt-4 flex justify-center md:justify-start items-center gap-4">
                        <SocialLink href={organizer.whatsapp_number ? `https://wa.me/${organizer.whatsapp_number.replace(/\D/g, '')}` : null} icon={<WhatsappIcon className="w-6 h-6"/>} />
                        <SocialLink href={organizer.discord_id} icon={<DiscordIcon className="w-6 h-6"/>} />
                        <SocialLink href={organizer.youtube_channel} icon={<YoutubeIcon className="w-6 h-6"/>} />
                        <SocialLink href={organizer.instagram_profile} icon={<InstagramIcon className="w-6 h-6"/>} />
                     </div>
                </div>
            </header>

            {/* Stats Bar */}
            <section className="glassmorphic rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 card-glow-border">
                <StatItem icon={<TrophyIcon className="w-8 h-8"/>} value={String(organizerTournaments.length)} label="Tournaments Hosted" />
                <StatItem icon={<UsersIcon className="w-8 h-8"/>} value={formatNumber(totalPlayersServed)} label="Total Players Served" />
                <StatItem icon={<StarIcon className="w-8 h-8"/>} value={(organizer.rating || 5.0).toFixed(1)} label="Community Rating" />
            </section>

            <div className="space-y-16">
                {organizer.about && (
                    <section>
                        <h2 className="text-3xl font-bold font-orbitron text-white mb-4">About {organizer.name}</h2>
                        <div className="glassmorphic p-6 rounded-lg">
                            <p className={`prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap break-words transition-all duration-300 ${!isAboutExpanded && needsTruncation ? 'line-clamp-5' : 'line-clamp-none'}`}>
                                {organizer.about}
                            </p>
                             {needsTruncation && (
                                <button
                                    onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                                    className="text-cyan-400 hover:text-cyan-300 font-semibold mt-2 text-sm"
                                >
                                    {isAboutExpanded ? 'Read Less' : 'Read More'}
                                </button>
                            )}
                        </div>
                    </section>
                )}
                <section>
                    <h2 className="text-3xl font-bold font-orbitron text-white mb-4">Player Reviews</h2>
                     <div className="glassmorphic p-8 rounded-lg text-center flex flex-col justify-center items-center">
                        <StarIcon className="w-10 h-10 text-amber-400 mb-2"/>
                        <p className="text-lg font-semibold text-white">Feature In Development</p>
                        <p className="text-gray-400">Player reviews are coming soon to help you choose the best tournaments.</p>
                    </div>
                </section>
            </div>

            <section>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold font-orbitron text-white">Tournaments</h2>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/20">
                        <button onClick={() => setFilter('Upcoming')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'Upcoming' ? 'bg-cyan-500 text-black shadow' : 'text-gray-300 hover:bg-white/10'}`}>Upcoming ({upcomingTournaments.length})</button>
                        <button onClick={() => setFilter('Completed')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'Completed' ? 'bg-cyan-500 text-black shadow' : 'text-gray-300 hover:bg-white/10'}`}>Completed ({completedTournaments.length})</button>
                    </div>
                </div>
                
                {tournamentsToShow.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tournamentsToShow.map((tour, index) => <TournamentCard key={tour.id} tournament={tour} organizers={allOrganizers} index={index} />)}
                    </div>
                ) : (
                    <EmptyState 
                        title={`No ${filter} Tournaments`}
                        message={`${organizer.name} has no ${filter.toLowerCase()} tournaments listed at the moment.`}
                    />
                )}
            </section>
        </div>
    );
};

export default OrganizerDetailPage;