import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGridIcon, ListIcon, SearchIcon, TrophyIcon } from '../components/icons/IconDefs';
import TournamentCard from '../components/TournamentCard';
import TournamentListItem from '../components/TournamentListItem';
import SkeletonCard from '../components/skeletons/SkeletonCard';
import EmptyState from '../components/EmptyState';
import PaginationControls from '../components/PaginationControls';
import { Tournament } from '../types';
import { supabase } from '../supabaseClient';
import { useData } from '../contexts/DataContext';
import CustomSelect from '../components/CustomSelect';

const ITEMS_PER_PAGE = 9;

const modeOptions = [
    { value: 'All Modes', label: 'All Modes' },
    { value: 'Squad', label: 'Squad' },
    { value: 'Duo', label: 'Duo' },
    { value: 'Solo', label: 'Solo' },
    { value: 'Clash Squad', label: 'Clash Squad' },
];

const typeOptions = [
    { value: 'All Types', label: 'All Types' },
    { value: 'Free', label: 'Free' },
    { value: 'Paid', label: 'Paid' },
];

const TournamentsPage: React.FC = () => {
    const { organizers } = useData(); // Get organizers from global context
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [modeFilter, setModeFilter] = useState('All Modes');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const fetchTournaments = useCallback(async () => {
        setLoading(true);
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query: any = supabase
            .from('tournaments')
            .select('*', { count: 'exact' });

        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,organizer_name.ilike.%${searchTerm}%`);
        }
        if (modeFilter !== 'All Modes') {
            query = query.eq('game_mode', modeFilter);
        }
        if (typeFilter !== 'All Types') {
            if (typeFilter === 'Free') {
                query = query.ilike('entry_fee', 'free');
            } else { // Paid
                query = query.not('entry_fee', 'ilike', 'free');
            }
        }
        
        const finalQuery = query
            .order('date', { ascending: false })
            .order('time', { ascending: true })
            .range(from, to);
        
        const { data, error, count } = await finalQuery;
        
        if (error) {
            console.error('Error fetching tournaments:', error);
            setTournaments([]);
            setTotalCount(0);
        } else {
            setTournaments(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    }, [currentPage, searchTerm, modeFilter, typeFilter]);
    
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchTournaments();
        }, 300); 
        return () => clearTimeout(debounceTimer);
    }, [fetchTournaments]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, modeFilter, typeFilter]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const ViewToggleButton: React.FC<{ mode: 'grid' | 'list', icon: React.ReactNode }> = ({ mode, icon }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`p-2 rounded-md transition-colors ${viewMode === mode ? 'bg-cyan-500/20 text-cyan-400 soft-glow' : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
            aria-label={`Switch to ${mode} view`}
        >
            {icon}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <header className="text-center mb-12">
                <TrophyIcon 
                    className="h-20 w-20 mx-auto text-cyan-400 mb-6"
                    style={{filter: 'drop-shadow(0 0 12px hsl(var(--primary)/ 0.7))'}}
                />
                <h1 className="text-4xl sm:text-5xl font-bold font-orbitron text-white">All Tournaments</h1>
                <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">Discover and join verified tournaments from trusted organizers across the nation.</p>
            </header>

            {/* Filters */}
            <div className="sticky top-[80px] z-40 bg-gray-900/80 backdrop-blur-lg py-4 px-4 glassmorphic rounded-xl card-glow-border">
                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                    <div className="relative">
                         <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                         <input
                            type="text"
                            placeholder="Search tournaments or organizers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-[auto_auto_auto] gap-4">
                        <CustomSelect options={modeOptions} value={modeFilter} onChange={setModeFilter} />
                        <CustomSelect options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
                         <div className="col-span-2 md:col-span-1 flex-shrink-0 flex items-center justify-center gap-1 p-1 bg-black/20 rounded-lg">
                            <ViewToggleButton mode="grid" icon={<LayoutGridIcon className="w-5 h-5"/>} />
                            <ViewToggleButton mode="list" icon={<ListIcon className="w-5 h-5"/>} />
                        </div>
                    </div>
                 </div>
                 <div className="mt-4">
                     <div className="inline-flex items-center px-3 py-1 bg-cyan-900/50 border border-cyan-500/30 rounded-full text-cyan-300 text-sm">
                        <span className="font-bold mr-1.5">{loading ? '...' : totalCount}</span> Tournaments Found
                    </div>
                </div>
            </div>

            {/* Tournaments List */}
            <div className="mt-8 min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="flex justify-center items-center h-full pt-12">
                        <EmptyState 
                            title="No Tournaments Found"
                            message="No tournaments match your current filters. Try adjusting your search criteria."
                            buttonText="Clear Filters"
                            onButtonClick={() => {
                                setSearchTerm('');
                                setModeFilter('All Modes');
                                setTypeFilter('All Types');
                            }}
                             icon={<div className="w-40 h-40 mx-auto flex items-center justify-center bg-white/5 rounded-full border-2 border-dashed border-gray-700"><TrophyIcon className="w-16 h-16 text-gray-600" /></div>}
                        />
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {tournaments.map((tour, index) => <TournamentCard key={tour.id} tournament={tour} organizers={organizers} index={index} />)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tournaments.map((tour, index) => <TournamentListItem key={tour.id} tournament={tour} organizers={organizers} index={index} />)}
                            </div>
                        )}
                        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TournamentsPage;