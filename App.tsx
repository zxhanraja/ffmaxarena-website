
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams, Link, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationContainer from './components/NotificationContainer';
import PageLoader from './components/PageLoader';
import { supabase } from './supabaseClient';
import { useNotifier } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { Tournament, Organizer, TournamentInsert, TournamentUpdate, OrganizerInsert, OrganizerUpdate } from './types';
import { CheckCircleIcon, TrophyIcon } from './components/icons/IconDefs';

// --- Lazy-loaded Page Imports for Performance ---
const HomePage = lazy(() => import('./pages/HomePage'));
const TournamentsPage = lazy(() => import('./pages/TournamentsPage'));
const TournamentDetailPage = lazy(() => import('./pages/TournamentDetailPage'));
const OrganizerDetailPage = lazy(() => import('./pages/OrganizerDetailPage'));
const VerifiedOrganizersPage = lazy(() => import('./pages/VerifiedOrganizersPage'));
const SubmitTournamentPage = lazy(() => import('./pages/SubmitTournamentPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const PromotionGuidelinesPage = lazy(() => import('./pages/PromotionGuidelinesPage'));
const BestPracticesPage = lazy(() => import('./pages/BestPracticesPage'));
const WhyChooseUsPage = lazy(() => import('./pages/WhyChooseUsPage'));


// --- Stable Component Definitions ---

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const ThankYouPage: React.FC = () => {
    const { type } = useParams<{ type: string }>();

    const content = useMemo(() => {
        switch (type) {
            case 'submission':
                return {
                    title: "Submission Sent!",
                    message: "Your tournament has been sent for review. We'll get it listed within 24-48 hours. Thanks for contributing!",
                    buttonText: "See Other Tournaments",
                    buttonLink: "/tournaments"
                };
            case 'verification':
                return {
                    title: "Application Received!",
                    message: "Your organizer verification request is in our hands. We'll review your details and get back to you soon.",
                    buttonText: "Back to Organizers",
                    buttonLink: "/organizers"
                };
            case 'contact':
                return {
                    title: "Message Sent!",
                    message: "Thanks for reaching out! We've received your message and will get back to you as soon as possible.",
                    buttonText: "Back to Home",
                    buttonLink: "/"
                };
            case 'newsletter':
                 return {
                    title: "Successfully Subscribed!",
                    message: "Thank you for joining our newsletter. Keep an eye on your inbox for the latest updates.",
                    buttonText: "Back to Home",
                    buttonLink: "/"
                };
            default:
                return {
                    title: "Thank You!",
                    message: "Your request has been successfully processed.",
                    buttonText: "Go Home",
                    buttonLink: "/"
                };
        }
    }, [type]);

    return (
        <div className="min-h-[calc(100vh-280px)] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
             <div className="animate-card-enter max-w-lg">
                <div className="mb-8">
                    <CheckCircleIcon className="w-32 h-32 text-green-400 mx-auto animate-pulse-glow" />
                </div>
                <h1 className="text-4xl font-bold font-orbitron text-white">{content.title}</h1>
                <p className="mt-4 text-gray-300">{content.message}</p>
                <Link to={content.buttonLink}>
                    <button className="mt-8 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 soft-glow">
                        {content.buttonText}
                    </button>
                </Link>
            </div>
        </div>
    );
};

const AppLayout: React.FC = () => (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>
        </main>
        <Footer />
    </div>
);


// --- Main App Logic Component ---
const AppContent: React.FC = () => {
    // State for Admin panel data management
    const [adminTournaments, setAdminTournaments] = useState<Tournament[]>([]);
    const [adminOrganizers, setAdminOrganizers] = useState<Organizer[]>([]);
    const notifier = useNotifier();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
    }, []);

    // This function now exclusively fetches data for the admin panel
    async function fetchAdminData() {
        const { data: tournamentsData, error: tournamentsError } = await supabase.from('tournaments').select('*').order('date', { ascending: true });
        if (tournamentsError) {
            notifier.error("Error fetching tournaments for admin: " + tournamentsError.message);
        } else {
            setAdminTournaments(tournamentsData || []);
        }

        const { data: organizersData, error: organizersError } = await supabase.from('organizers').select('*').order('created_at', { ascending: false });
        if (organizersError) {
            notifier.error("Error fetching organizers for admin: " + organizersError.message);
        } else {
            setAdminOrganizers(organizersData || []);
        }
    }
    
    useEffect(() => {
        // Only fetch all data if the user is authenticated (i.e., for the admin)
        if (isAuthenticated) {
            fetchAdminData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // --- Admin CRUD Handlers ---

    const handleAddTournament = async (tournament: TournamentInsert) => {
        const { error } = await supabase.from('tournaments').insert([tournament]);
        if (error) {
             console.error("Error adding tournament:", error);
             notifier.error('Failed to add tournament: ' + error.message);
             return;
        }
        notifier.success('Tournament added successfully!');
        fetchAdminData();
    };

    const handleUpdateTournament = async (id: number, updateData: TournamentUpdate) => {
        const { error } = await supabase.from('tournaments').update(updateData).eq('id', id);
        if (error) {
            console.error("Error updating tournament:", error);
            notifier.error('Failed to update tournament: ' + error.message);
            return;
        }
        notifier.success('Tournament updated successfully!');
        fetchAdminData();
    };

    const handleDeleteTournament = async (id: number) => {
        const { error } = await supabase.from('tournaments').delete().eq('id', id);
        if (error) {
            console.error("Error deleting tournament:", error);
            notifier.error('Failed to delete tournament: ' + error.message);
            return;
        }
        notifier.success('Tournament deleted.');
        fetchAdminData();
    };

    const handleAddOrganizer = async (organizer: OrganizerInsert) => {
        const { error } = await supabase.from('organizers').insert([organizer]);
        if (error) {
             console.error("Error adding organizer:", error);
             notifier.error('Failed to add organizer: ' + error.message);
             return;
        }
        notifier.success('Organizer added successfully!');
        fetchAdminData();
    };

    const handleUpdateOrganizer = async (id: number, updateData: OrganizerUpdate) => {
        const { error } = await supabase.from('organizers').update(updateData).eq('id', id);
        if (error) {
            console.error("Error updating organizer:", error);
            notifier.error('Failed to update organizer: ' + error.message);
            return;
        }
        notifier.success('Organizer updated successfully!');
        fetchAdminData();
    };
    
    const handleDeleteOrganizer = async (id: number) => {
        const { error } = await supabase.from('organizers').delete().eq('id', id);
        if (error) {
             console.error("Error deleting organizer:", error);
            notifier.error('Failed to delete organizer: ' + error.message);
            return;
        }
        notifier.success('Organizer deleted.');
        fetchAdminData();
    };

    const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const { isAuthenticated, loading } = useAuth();
        if (loading) return <PageLoader />;
        return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
    };

    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tournaments" element={<TournamentsPage />} />
                    <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
                    <Route path="/organizers" element={<VerifiedOrganizersPage />} />
                    <Route path="/organizers/:id" element={<OrganizerDetailPage />} />
                    <Route path="/submit" element={<SubmitTournamentPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminPanelPage 
                                tournaments={adminTournaments}
                                organizers={adminOrganizers}
                                onAddTournament={handleAddTournament}
                                onUpdateTournament={handleUpdateTournament}
                                onDeleteTournament={handleDeleteTournament}
                                onAddOrganizer={handleAddOrganizer}
                                onUpdateOrganizer={handleUpdateOrganizer}
                                onDeleteOrganizer={handleDeleteOrganizer}
                            />
                        </ProtectedRoute>
                    } />
                    <Route path="/thank-you/:type" element={<ThankYouPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/guidelines" element={<PromotionGuidelinesPage />} />
                    <Route path="/best-practices" element={<BestPracticesPage />} />
                    <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={
                        <div className="text-center py-16 sm:py-24 flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
                            <TrophyIcon className="w-40 h-40 text-cyan-400/30 mx-auto animate-float" />
                           <h1 className="text-6xl font-orbitron text-white mt-4">404</h1>
                           <p className="text-xl mt-4 text-gray-400">Oops! You're lost in space.</p>
                           <Link to="/" className="mt-8 inline-block px-6 py-2 bg-cyan-400 text-black rounded-md hover:bg-cyan-300 transition-colors">Go Home</Link>
                        </div>
                    } />
                </Route>
            </Routes>
            <NotificationContainer />
        </>
    );
};

// --- App Root Component ---
const App: React.FC = () => (
    <BrowserRouter>
        <AppContent />
    </BrowserRouter>
);

export default App;