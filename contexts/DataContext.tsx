import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Tournament, Organizer } from '../types';

interface DataContextType {
    tournaments: Tournament[];
    organizers: Organizer[];
    loading: boolean;
    error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [tournamentsResponse, organizersResponse] = await Promise.all([
                    supabase.from('tournaments').select('*').order('date', { ascending: true }),
                    supabase.from('organizers').select('*').order('created_at', { ascending: false }),
                ]);

                if (tournamentsResponse.error) throw tournamentsResponse.error;
                if (organizersResponse.error) throw organizersResponse.error;
                
                setTournaments(tournamentsResponse.data || []);
                setOrganizers(organizersResponse.data || []);

            } catch (err: any) {
                console.error("Error fetching shared data:", err);
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const value = {
        tournaments,
        organizers,
        loading,
        error,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
