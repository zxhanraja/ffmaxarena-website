import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ZapIcon, ArrowRightIcon, ShieldCheckIcon, HeartIcon, UsersIcon, TrophyIcon, ShieldIcon } from '../components/icons/IconDefs';
import TournamentCard from '../components/TournamentCard';
import SkeletonCard from '../components/skeletons/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { getTournamentStatus } from '../utils/time';
import { formatNumber } from '../utils/helper';
import { useData } from '../contexts/DataContext';

const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
    <div className="glassmorphic p-4 sm:p-6 rounded-lg flex items-center space-x-4 card-glow-border">
        <div className="p-3 bg-white/10 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-3xl font-bold font-orbitron">{value}</p>
            <p className="text-gray-400">{label}</p>
        </div>
    </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="glassmorphic p-6 sm:p-8 rounded-xl text-center transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white/10 text-cyan-400 mb-6 border border-white/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold font-orbitron mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    const { tournaments, organizers, loading } = useData();

    const stats = useMemo(() => {
        if (loading) return { liveTournamentCount: 0, organizerCount: 0, totalPlayersServed: 0, totalMatches: 0 };

        const liveTournaments = tournaments.filter(t => getTournamentStatus(t).isLive);
        const totalPlayers = organizers.reduce((acc, o) => acc + (o.players_served || 0), 0);
        
        return {
            liveTournamentCount: liveTournaments.length,
            organizerCount: organizers.length,
            totalPlayersServed: totalPlayers,
            totalMatches: tournaments.length
        };
    }, [tournaments, organizers, loading]);

    const featuredTournaments = useMemo(() => {
        return tournaments
            .map(t => ({ tournament: t, status: getTournamentStatus(t) }))
            .filter(item => item.status.isUpcoming || item.status.isLive)
            .sort((a, b) => {
                if (a.status.isLive && !b.status.isLive) return -1;
                if (!a.status.isLive && b.status.isLive) return 1;
                return a.status.timeDiff - b.status.timeDiff;
            })
            .map(item => item.tournament)
            .slice(0, 3);
    }, [tournaments]);

    return (
        <div className="space-y-16 sm:space-y-20 md:space-y-24 pb-16 sm:pb-24">
            {/* Hero Section */}
            <section className="text-center pt-16 pb-10 relative overflow-hidden">
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.07) 0px, transparent 40%),
                            radial-gradient(circle at 80% 70%, hsl(var(--secondary) / 0.15) 0px, transparent 50%)
                        `,
                        maskImage: 'linear-gradient(to bottom, white 5%, transparent 80%)'
                    }}
                ></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-72 h-72 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <TrophyIcon 
                        className="h-20 w-20 mx-auto text-cyan-400 animate-float mb-6" 
                        style={{filter: 'drop-shadow(0 0 12px hsl(var(--primary)/ 0.7))'}} 
                    />
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-orbitron text-white tracking-tight">
                        FFMax<span className="text-cyan-400 text-glow">Arena</span>
                    </h1>
                    <p className="mt-6 text-base sm:text-lg font-bold text-gray-200 max-w-2xl mx-auto">
                        India's #1 Free Fire Max Tournament Hub
                    </p>
                    <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-3xl mx-auto">
                        Discover verified Free Fire Max tournaments, connect with trusted organizers, and compete with the best players across India. Our platform helps esports enthusiasts find legitimate tournaments and build the gaming community.
                    </p>
                     <div className="mt-8 flex justify-center items-center flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-black/20 border border-rose-500/50 rounded-full text-rose-300 backdrop-blur-sm">
                            <HeartIcon className="h-4 w-4" />
                            <span>100% Non-Profit Platform</span>
                        </div>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-black/20 border border-amber-500/50 rounded-full text-amber-300 backdrop-blur-sm">
                           <ShieldIcon className="h-4 w-4" />
                           <span>Not Associated with Garena</span>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link to="/tournaments" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 soft-glow">
                            Browse Tournaments <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </Link>
                        <Link to="/submit" className="inline-flex items-center justify-center px-8 py-3 border border-cyan-400 text-base font-medium rounded-md text-cyan-400 bg-black/30 hover:bg-cyan-400 hover:text-black transition-colors duration-300">
                            Submit Tournament
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* Stats Section */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold font-orbitron text-white">Platform Stats</h2>
                     <p className="mt-4 text-base text-gray-400">The pulse of our community, live and up-to-date.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<TrophyIcon className="h-8 w-8" />} value={loading ? '...' : stats.liveTournamentCount.toString()} label="Live Tournaments" />
                    <StatCard icon={<UsersIcon className="h-8 w-8" />} value={loading ? '...' : formatNumber(stats.totalPlayersServed)} label="Players Served" />
                    <StatCard icon={<ShieldCheckIcon className="h-8 w-8" />} value={loading ? '...' : stats.organizerCount.toString()} label="Verified Organizers" />
                    <StatCard icon={<ZapIcon className="h-8 w-8" />} value={loading ? '...' : formatNumber(stats.totalMatches)} label="Total Matches" />
                </div>
            </section>
            
            {/* What is FFMaxArena */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-orbitron text-white">Your Ultimate Hub for Free Fire Max Esports</h2>
                    <p className="mt-4 text-base text-gray-400 max-w-3xl mx-auto">
                        FFMaxArena is a centralized, community-focused platform built for the Indian Free Fire Max scene. We bridge the gap between passionate players seeking competitive action and dedicated organizers hosting top-tier tournaments. Our mission is to foster a trusted, transparent, and thriving esports ecosystem.
                    </p>
                </div>
                <div className="mt-20 grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<ShieldCheckIcon className="w-8 h-8" />}
                        title="Verified Organizers"
                        description="All tournament organizers are manually verified by our team to ensure legitimacy and trustworthiness."
                    />
                    <FeatureCard
                        icon={<HeartIcon className="w-8 h-8" />}
                        title="Non-Profit Mission"
                        description="We operate as a non-profit platform, focused on growing the esports community rather than making money."
                    />
                    <FeatureCard
                        icon={<UsersIcon className="w-8 h-8" />}
                        title="Community First"
                        description="Built by gamers, for gamers. We prioritize player safety and community growth above everything else."
                    />
                </div>
            </section>

            {/* Featured Tournaments */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold font-orbitron text-white">Featured Tournaments</h2>
                    <p className="mt-4 text-base text-gray-400">The latest LIVE and Upcoming tournaments from our verified organizers.</p>
                </div>
                {loading ? (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                ) : featuredTournaments.length === 0 ? (
                    <div className="mt-12">
                        <EmptyState 
                          title="No Upcoming Tournaments"
                          message="New tournaments will appear here once they are submitted and approved by our admin team."
                          buttonText="Submit Your Tournament"
                          buttonLink="/submit"
                        />
                    </div>
                ) : (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredTournaments.map((tour, index) => <TournamentCard key={tour.id} tournament={tour} organizers={organizers} index={index} />)}
                    </div>
                )}
                
                {!loading && tournaments.length > 0 && (
                    <div className="mt-8 text-center">
                        <Link to="/tournaments" className="inline-flex items-center text-cyan-400 hover:text-cyan-300">
                            View All Tournaments <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                )}
            </section>

            {/* CTA Host Tournament */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-slate-900/70 rounded-xl p-8 sm:p-10 md:p-12 text-center overflow-hidden border border-slate-700 backdrop-blur-sm">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">Ready to Host Your Tournament?</h2>
                        <p className="mt-4 text-base text-gray-300 max-w-3xl mx-auto">
                            Join verified organizers who trust FFMaxArena to promote their Free Fire Max tournaments to the Indian gaming community
                        </p>
                        <div className="mt-8">
                             <Link to="/submit" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 soft-glow">
                                <span>Submit Your Tournament</span>
                                <ArrowRightIcon className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;