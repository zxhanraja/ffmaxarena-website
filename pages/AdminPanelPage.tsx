import React, { useState, useMemo, useEffect } from 'react';
import { TrophyIcon, UsersIcon, XIcon, ArrowLeftIcon, PlusCircleIcon, SearchIcon, LayoutGridIcon, PencilIcon, TrashIcon, LogOutIcon, ClipboardListIcon, ImageIcon, LinkIcon, UserCircleIcon, StarIcon, ShareIcon, YoutubeIcon } from '../components/icons/IconDefs';
import { Tournament, Organizer, TournamentInsert, TournamentUpdate, OrganizerInsert, OrganizerUpdate } from '../types';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useNotifier } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { getTournamentStatus } from '../utils/time';
import Spinner from '../components/Spinner';
import CustomSelect from '../components/CustomSelect';


// --- Reusable Components ---

const FullScreenFormWrapper: React.FC<{ title: string; onCancel: () => void; children: React.ReactNode }> = ({ title, onCancel, children }) => (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a14] to-black z-[100] animate-form-step-enter overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="mb-8">
                <button onClick={onCancel} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium">Back to Dashboard</span>
                </button>
            </div>
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-white">{title}</h1>
            </div>
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ label: string; name: string; type?: string; placeholder?: string; value: string | number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; required?: boolean; }> = ({ label, name, type = 'text', placeholder, value, onChange, error, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
            {required && <span className="text-red-400">*</span>}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-white/20 focus:ring-cyan-500'}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; placeholder: string; value: string | null; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> = ({ label, name, placeholder, value, onChange }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <textarea
            name={name}
            id={name}
            rows={3}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    </div>
);

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="glassmorphic p-4 sm:p-6 rounded-lg flex items-center space-x-4 card-glow-border">
        <div className="p-3 bg-white/10 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-3xl font-bold font-orbitron">{value}</p>
            <p className="text-gray-400">{title}</p>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: 'Live' | 'Upcoming' | 'Completed' }> = ({ status }) => {
    const styles = {
        Live: 'bg-red-500/20 text-red-300',
        Upcoming: 'bg-cyan-500/20 text-cyan-300',
        Completed: 'bg-gray-500/20 text-gray-400',
    };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
}

// --- Constants ---
const ALL_BADGES = ['Verified Badge', 'Priority Listing', 'Featured Tournaments'];
const FREE_FIRE_MAPS = ["Bermuda", "Bermuda Remastered", "Purgatory", "Kalahari", "Alpine", "NeXTerra"];
const GAME_MODES = ['Squad', 'Duo', 'Solo', 'Clash Squad'];

type ViewState = 'dashboard' | 'add_tournament' | 'edit_tournament' | 'add_organizer' | 'edit_organizer';

// --- Form Components ---

interface TournamentFormProps {
    initialData: any;
    onSubmit: (data: TournamentUpdate) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    notifier: ReturnType<typeof useNotifier>;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting, notifier }) => {
    const formCacheKey = useMemo(() => {
        return initialData.id ? `adminTournamentForm_edit_${initialData.id}` : 'adminTournamentForm_add';
    }, [initialData.id]);
    
    const [formData, setFormData] = useState(() => {
        try {
            const cachedData = localStorage.getItem(formCacheKey);
            return cachedData ? JSON.parse(cachedData) : initialData;
        } catch {
            return initialData;
        }
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    useEffect(() => {
        localStorage.setItem(formCacheKey, JSON.stringify(formData));
    }, [formData, formCacheKey]);
    
    const hourOptions = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') }));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }));
    const ampmOptions = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];
    const gameModeOptions = GAME_MODES.map(m => ({ value: m, label: m }));
    const mapOptions = FREE_FIRE_MAPS.map(m => ({ value: m, label: m }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const allErrors: { [key: string]: string } = {};
        if (!formData.title) allErrors.title = "Tournament title is required";
        if (!formData.organizer_name) allErrors.organizer_name = "Organizer name is required";
        if (!formData.date) allErrors.date = "Tournament date is required";
        if (!formData.poster_url) {
            allErrors.poster_url = "Poster URL is required";
        } else {
            try {
                new URL(formData.poster_url);
            } catch (_) {
                 if (!formData.poster_url.startsWith('data:image/')) {
                    allErrors.poster_url = "Please enter a valid URL";
                 }
            }
        }
        
        setErrors(allErrors);

        if (Object.keys(allErrors).length > 0) {
            notifier.error("Please fill all required fields before submitting.");
            return;
        }
        
        const { hour, minute, ampm, ...rest } = formData;
        // Set banner_url to null to ensure it's cleared, aligning with the use of a default banner.
        const payload: TournamentUpdate = { ...rest, time: `${hour}:${minute} ${ampm}`, banner_url: null };
        delete (payload as any).hour;
        delete (payload as any).minute;
        delete (payload as any).ampm;
        
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="glassmorphic soft-glow rounded-xl p-6 sm:p-8 space-y-8 mt-12">
                <div className="animate-form-step-enter space-y-10">
                    {/* Core Info Section */}
                    <div className="space-y-6">
                         <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <TrophyIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Core Information</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="Tournament Name" name="title" required value={formData.title} onChange={handleChange} error={errors.title} />
                            <InputField label="Organizer Name" name="organizer_name" required value={formData.organizer_name} onChange={handleChange} error={errors.organizer_name} />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <ClipboardListIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Details</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="Date" name="date" type="date" required value={formData.date} onChange={handleChange} error={errors.date} />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Time</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <CustomSelect options={hourOptions} value={formData.hour} onChange={(v) => handleSelectChange('hour', v)} />
                                    <CustomSelect options={minuteOptions} value={formData.minute} onChange={(v) => handleSelectChange('minute', v)} />
                                    <CustomSelect options={ampmOptions} value={formData.ampm} onChange={(v) => handleSelectChange('ampm', v)} />
                                </div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <CustomSelect label="Game Mode" name="game_mode" options={gameModeOptions} value={formData.game_mode || ''} onChange={(v) => handleSelectChange('game_mode', v)} />
                            <CustomSelect label="Map" name="map" options={mapOptions} value={formData.map || ''} onChange={(v) => handleSelectChange('map', v)} />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <InputField label="Entry Fee" name="entry_fee" placeholder="FREE or 50" value={formData.entry_fee} onChange={handleChange} />
                            <InputField label="Prize Pool" name="prize_pool" placeholder="10000" value={formData.prize_pool} onChange={handleChange} />
                            <InputField label="Max Participants" name="max_participants" placeholder="100 teams" value={formData.max_participants} onChange={handleChange} />
                        </div>
                        <TextAreaField label="Description" name="description" placeholder="Enter tournament rules, format, etc." value={formData.description} onChange={handleChange} />
                    </div>

                    {/* Poster Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <ImageIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Poster</h2>
                        </div>
                        
                        <InputField label="Poster URL" name="poster_url" required placeholder="https://.../poster.png (Recommended: 4:3 or 1:1)" value={formData.poster_url} onChange={handleChange} error={errors.poster_url}/>
                        <p className="text-xs text-gray-400 -mt-5">Must be a direct link to an image (e.g., .png, .jpg) or a data URL.</p>

                        {formData.poster_url && (
                            <div className="p-4 bg-black/30 rounded-lg border border-gray-600">
                                <p className="text-sm text-gray-400 mb-2">Poster Preview:</p>
                                <img
                                    key={`poster-${formData.poster_url}`}
                                    src={formData.poster_url}
                                    alt="Poster Preview"
                                    className="max-h-60 w-auto rounded-md mx-auto"
                                    onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        if (target.style.display !== 'none') {
                                            target.style.display = 'none';
                                            setErrors(prev => ({...prev, poster_url: 'URL is not a valid, direct image link.'}));
                                        }
                                    }}
                                    onLoad={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'block';
                                        if (errors.poster_url?.includes('valid')) {
                                            setErrors(prev => {
                                                const newErrors = {...prev};
                                                delete newErrors.poster_url;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Links Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <LinkIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Links</h2>
                        </div>
                        <InputField label="Registration Link" name="registration_link" placeholder="Google Form or other link" value={formData.registration_link} onChange={handleChange} />
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="WhatsApp Group Link" name="whatsapp_link" placeholder="https://chat.whatsapp.com/..." value={formData.whatsapp_link} onChange={handleChange} />
                            <InputField label="Discord Invite Link" name="discord_link" placeholder="https://discord.gg/..." value={formData.discord_link} onChange={handleChange} />
                        </div>
                        <InputField label="YouTube Stream/Channel Link" name="youtube_link" placeholder="https://youtube.com/..." value={formData.youtube_link} onChange={handleChange} />
                    </div>
                </div>
                
                <div className="pt-8 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between items-center border-t border-gray-700 mt-10">
                    <div className="w-full sm:w-auto">
                        <button type="button" onClick={onCancel} className="w-full justify-center flex px-6 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                    </div>
                    <div className="w-full sm:w-auto">
                        <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center px-6 py-2 border border-transparent font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 soft-glow disabled:bg-gray-600">
                            {isSubmitting ? <Spinner /> : (formData.id ? 'Update Tournament' : 'Add Tournament')}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

const OrganizerForm: React.FC<{
    initialData: any,
    onSubmit: (data: OrganizerUpdate) => void,
    onCancel: () => void,
    isSubmitting: boolean,
    notifier: ReturnType<typeof useNotifier>
}> = ({ initialData, onSubmit, onCancel, isSubmitting, notifier }) => {
    const formCacheKey = useMemo(() => {
        return initialData.id ? `adminOrganizerForm_edit_${initialData.id}` : 'adminOrganizerForm_add';
    }, [initialData.id]);

    const [formData, setFormData] = useState(() => {
        try {
            const cachedData = localStorage.getItem(formCacheKey);
            return cachedData ? JSON.parse(cachedData) : initialData;
        } catch {
            return initialData;
        }
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        localStorage.setItem(formCacheKey, JSON.stringify(formData));
    }, [formData, formCacheKey]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };
    
    const handleBadgeChange = (badge: string) => {
        setFormData((prev: any) => {
            const newBadges = prev.badges?.includes(badge) ? prev.badges.filter((b: string) => b !== badge) : [...(prev.badges || []), badge];
            return { ...prev, badges: newBadges };
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const allErrors: { [key: string]: string } = {};
        if (!formData.name) allErrors.name = "Organizer name is required";
        if (!formData.contact_email || !/\S+@\S+\.\S+/.test(formData.contact_email)) {
            allErrors.contact_email = "A valid email is required";
        }
        
        setErrors(allErrors);

        if (Object.keys(allErrors).length > 0) {
            notifier.error("Please fill all required fields before submitting.");
            return;
        }

        const payload: OrganizerUpdate = {
            ...formData,
            is_verified: true,
            total_tournaments: Number(formData.total_tournaments || 0),
            players_served: Number(formData.players_served || 0),
            rating: Number(formData.rating || 5),
        };
        onSubmit(payload);
    };
    
    return (
        <form onSubmit={handleFormSubmit}>
            <div className="glassmorphic soft-glow rounded-xl p-6 sm:p-8 space-y-8 mt-12">
                <div className="animate-form-step-enter space-y-10">
                    {/* Identity Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <UserCircleIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Identity</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="Organizer Name" name="name" required value={formData.name} onChange={handleChange} error={errors.name} />
                            <InputField label="Contact Email" name="contact_email" required type="email" value={formData.contact_email} onChange={handleChange} error={errors.contact_email} />
                        </div>
                        <InputField label="Logo URL" name="logo_url" placeholder="https://i.imgur.com/your-logo.png" value={formData.logo_url} onChange={handleChange} error={errors.logo_url} />
                        {formData.logo_url && (
                            <div className="p-4 bg-black/30 rounded-lg border border-gray-600 text-center">
                                <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
                                <img
                                    key={formData.logo_url}
                                    src={formData.logo_url}
                                    alt="Logo Preview"
                                    className="h-24 w-24 rounded-full mx-auto"
                                    onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        if (target.style.display !== 'none') {
                                            target.style.display = 'none';
                                            setErrors(prev => ({ ...prev, logo_url: 'Invalid image URL.' }));
                                        }
                                    }}
                                    onLoad={() => {
                                        if (errors.logo_url) {
                                            setErrors(prev => {
                                                const newErrors = {...prev};
                                                delete newErrors.logo_url;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                />
                            </div>
                        )}
                        <TextAreaField label="About Organizer" name="about" placeholder="Short bio for the organizer profile page" value={formData.about} onChange={handleChange} />
                    </div>

                    {/* Profile Links Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <ShareIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Profile Links</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="WhatsApp Number" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} />
                            <InputField label="Discord Invite Link" name="discord_id" value={formData.discord_id} onChange={handleChange} />
                            <InputField label="YouTube Channel Link" name="youtube_channel" value={formData.youtube_channel} onChange={handleChange} />
                            <InputField label="Instagram Profile Link" name="instagram_profile" value={formData.instagram_profile} onChange={handleChange} />
                        </div>
                    </div>
                    
                    {/* Stats & Badges Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
                            <StarIcon className="w-6 h-6 text-cyan-400"/>
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Stats & Badges</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <InputField label="Total Tournaments" name="total_tournaments" type="number" value={formData.total_tournaments} onChange={handleChange} />
                            <InputField label="Players Served" name="players_served" type="number" value={formData.players_served} onChange={handleChange} />
                            <InputField label="Rating" name="rating" type="number" value={formData.rating} onChange={handleChange} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Assign Badges</h4>
                            <div className="flex flex-wrap gap-4">
                                {ALL_BADGES.map(badge => (
                                    <label key={badge} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.badges?.includes(badge)} onChange={() => handleBadgeChange(badge)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                                        <span className="text-white">{badge}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between items-center border-t border-gray-700 mt-10">
                    <div className="w-full sm:w-auto">
                        <button type="button" onClick={onCancel} className="w-full justify-center flex px-6 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                    </div>
                    <div className="w-full sm:w-auto">
                        <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center px-6 py-2 border border-transparent font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 soft-glow disabled:bg-gray-600">
                            {isSubmitting ? <Spinner /> : (formData.id ? 'Update Organizer' : 'Add Organizer')}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}


interface AdminPanelPageProps {
    tournaments: Tournament[];
    organizers: Organizer[];
    onAddTournament: (tournament: TournamentInsert) => Promise<void>;
    onUpdateTournament: (id: number, tournament: TournamentUpdate) => Promise<void>;
    onDeleteTournament: (id: number) => Promise<void>;
    onAddOrganizer: (organizer: OrganizerInsert) => Promise<void>;
    onUpdateOrganizer: (id: number, organizer: OrganizerUpdate) => Promise<void>;
    onDeleteOrganizer: (id: number) => Promise<void>;
}

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ 
    tournaments, 
    organizers,
    onAddTournament,
    onUpdateTournament,
    onDeleteTournament,
    onAddOrganizer,
    onUpdateOrganizer,
    onDeleteOrganizer,
}) => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [view, setView] = useState<ViewState>('dashboard');
    const [currentItem, setCurrentItem] = useState<Tournament | Organizer | null>(null);
    const [tourSearch, setTourSearch] = useState('');
    const [orgSearch, setOrgSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { logout } = useAuth();
    const notifier = useNotifier();
    const navigate = useNavigate();

    // --- Memoized Filters ---
    const filteredTournaments = useMemo(() => tournaments.filter(t => t.title.toLowerCase().includes(tourSearch.toLowerCase()) || t.organizer_name.toLowerCase().includes(tourSearch.toLowerCase())), [tournaments, tourSearch]);
    const filteredOrganizers = useMemo(() => organizers.filter(o => o.name.toLowerCase().includes(orgSearch.toLowerCase()) || o.contact_email.toLowerCase().includes(orgSearch.toLowerCase())), [organizers, orgSearch]);

    // --- Event Handlers ---
    const openNewTournamentForm = () => { setCurrentItem(null); setView('add_tournament'); };
    const openEditTournamentForm = (t: Tournament) => { setCurrentItem(t); setView('edit_tournament'); };
    const openNewOrganizerForm = () => { setCurrentItem(null); setView('add_organizer'); };
    const openEditOrganizerForm = (o: Organizer) => { setCurrentItem(o); setView('edit_organizer'); };
    
    const closeForm = () => {
        if (view === 'edit_tournament' || view === 'add_tournament') {
            const key = currentItem?.id ? `adminTournamentForm_edit_${(currentItem as Tournament).id}` : 'adminTournamentForm_add';
            localStorage.removeItem(key);
        }
        if (view === 'edit_organizer' || view === 'add_organizer') {
            const key = currentItem?.id ? `adminOrganizerForm_edit_${(currentItem as Organizer).id}` : 'adminOrganizerForm_add';
            localStorage.removeItem(key);
        }
        setView('dashboard');
        setCurrentItem(null);
    };
    
    const handleTournamentSubmit = async (data: TournamentUpdate) => {
        setIsSubmitting(true);
        const key = currentItem?.id ? `adminTournamentForm_edit_${(currentItem as Tournament).id}` : 'adminTournamentForm_add';
        
        try {
            if (currentItem && 'title' in currentItem) {
                await onUpdateTournament(currentItem.id, data);
            } else {
                await onAddTournament({ ...data, status: 'Upcoming', is_verified: true } as TournamentInsert);
            }
            localStorage.removeItem(key);
            closeForm();
        } catch (error) {
            notifier.error("An error occurred while saving the tournament.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleOrganizerSubmit = async (data: OrganizerUpdate) => {
        setIsSubmitting(true);
        const key = currentItem?.id ? `adminOrganizerForm_edit_${(currentItem as Organizer).id}` : 'adminOrganizerForm_add';

        try {
            if (currentItem && 'contact_email' in currentItem) {
                await onUpdateOrganizer(currentItem.id, data);
            } else {
                await onAddOrganizer(data as OrganizerInsert);
            }
            localStorage.removeItem(key);
            closeForm();
        } catch (error) {
             notifier.error("An error occurred while saving the organizer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (type: 'tournament' | 'organizer', id: number) => {
        if (window.confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) {
            if (type === 'tournament') onDeleteTournament(id); else onDeleteOrganizer(id);
        }
    };
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
        notifier.info('You have been logged out.');
    };

    const TabButton: React.FC<{ tabName: string; currentTab: string; onClick: (tab: string) => void; icon: React.ReactNode; children: React.ReactNode; }> = ({ tabName, currentTab, onClick, icon, children }) => (
        <button 
            onClick={() => onClick(tabName)} 
            className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${currentTab === tabName ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'}`}
        >
            {icon}
            <span className="hidden sm:inline">{children}</span>
        </button>
    );

    if (view === 'add_tournament' || view === 'edit_tournament') {
        const initialData: Partial<Tournament> & { hour?: string, minute?: string, ampm?: string } = view === 'edit_tournament' ? { ...(currentItem as Tournament) } : { game_mode: 'Squad', map: 'Bermuda', time: '07:00 PM' };
        
        // Prepare time fields for the form
        const [timePart, ampm] = (initialData.time || '07:00 PM').split(' ');
        const [hour, minute] = timePart.split(':');
        initialData.hour = hour;
        initialData.minute = minute;
        initialData.ampm = ampm;

        return (
            <FullScreenFormWrapper title={view === 'edit_tournament' ? 'Edit Tournament' : 'Add New Tournament'} onCancel={closeForm}>
                <TournamentForm 
                    initialData={initialData}
                    onSubmit={handleTournamentSubmit} 
                    onCancel={closeForm} 
                    isSubmitting={isSubmitting} 
                    notifier={notifier}
                />
            </FullScreenFormWrapper>
        );
    }

    if (view === 'add_organizer' || view === 'edit_organizer') {
        const initialData = view === 'edit_organizer' ? currentItem as Organizer : { badges: [], rating: 5.0 };
        return (
            <FullScreenFormWrapper title={view === 'edit_organizer' ? 'Edit Organizer' : 'Add New Organizer'} onCancel={closeForm}>
                <OrganizerForm 
                    initialData={initialData} 
                    onSubmit={handleOrganizerSubmit} 
                    onCancel={closeForm} 
                    isSubmitting={isSubmitting} 
                    notifier={notifier}
                />
            </FullScreenFormWrapper>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-white">Admin Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-400">Manage your platform's content and settings.</p>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors duration-300 w-full sm:w-auto">
                    <LogOutIcon className="w-5 h-5"/>
                    <span>Logout</span>
                </button>
            </header>

            <nav className="border-b border-white/10 mt-8 sm:mt-12">
                <div className="flex space-x-2 sm:space-x-6">
                    <TabButton tabName="dashboard" currentTab={activeTab} onClick={setActiveTab} icon={<LayoutGridIcon className="w-5 h-5"/>}>
                        Dashboard
                    </TabButton>
                    <TabButton tabName="tournaments" currentTab={activeTab} onClick={setActiveTab} icon={<TrophyIcon className="w-5 h-5"/>}>
                        Tournaments
                    </TabButton>
                    <TabButton tabName="organizers" currentTab={activeTab} onClick={setActiveTab} icon={<UsersIcon className="w-5 h-5"/>}>
                        Organizers
                    </TabButton>
                </div>
            </nav>

            <main className="mt-8">
                {activeTab === 'dashboard' && (
                    <div className="animate-form-step-enter">
                        <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Tournaments" value={tournaments.length} icon={<TrophyIcon className="h-8 w-8" />} />
                            <StatCard title="Total Organizers" value={organizers.length} icon={<UsersIcon className="h-8 w-8" />} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-12 mb-6">Quick Actions</h2>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={openNewTournamentForm} className="inline-flex items-center gap-2 bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors">
                                <PlusCircleIcon className="w-5 h-5" /> Add New Tournament
                            </button>
                             <button onClick={openNewOrganizerForm} className="inline-flex items-center gap-2 bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors">
                                <PlusCircleIcon className="w-5 h-5" /> Add New Organizer
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'tournaments' && (
                    <div className="animate-form-step-enter">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white">Manage Tournaments</h2>
                             <div className="relative w-full sm:w-auto">
                                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input type="text" placeholder="Search tournaments..." value={tourSearch} onChange={(e) => setTourSearch(e.target.value)} className="w-full sm:w-64 bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                             </div>
                        </div>
                        
                        {filteredTournaments.length > 0 ? (
                             <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block glassmorphic rounded-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-300">
                                            <thead className="text-xs text-gray-400 uppercase bg-black/20">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">Title</th>
                                                    <th scope="col" className="px-6 py-4">Organizer</th>
                                                    <th scope="col" className="px-6 py-4">Date</th>
                                                    <th scope="col" className="px-6 py-4">Status</th>
                                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTournaments.map(tour => (
                                                    <tr key={tour.id} className="border-b border-gray-800 hover:bg-white/5">
                                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{tour.title}</td>
                                                        <td className="px-6 py-4">{tour.organizer_name}</td>
                                                        <td className="px-6 py-4">{tour.date}</td>
                                                        <td className="px-6 py-4"><StatusBadge status={getTournamentStatus(tour).status} /></td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <button onClick={() => openEditTournamentForm(tour)} className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors mr-4">
                                                                <PencilIcon className="w-4 h-4"/> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteClick('tournament', tour.id)} className="inline-flex items-center gap-1.5 font-medium text-red-400 hover:text-red-300 transition-colors">
                                                                <TrashIcon className="w-4 h-4"/> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                 {/* Mobile Card View */}
                                <div className="block md:hidden space-y-4">
                                    {filteredTournaments.map(tour => (
                                        <div key={tour.id} className="glassmorphic rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-bold text-white">{tour.title}</p>
                                                    <p className="text-sm text-gray-400">by {tour.organizer_name}</p>
                                                </div>
                                                <div className="flex-shrink-0 flex items-center gap-4">
                                                    <button onClick={() => openEditTournamentForm(tour)} aria-label="Edit" className="text-blue-400 hover:text-blue-300"><PencilIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteClick('tournament', tour.id)} aria-label="Delete" className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="text-gray-400">Date: </span>
                                                    <span className="font-semibold text-white">{tour.date}</span>
                                                </div>
                                                <StatusBadge status={getTournamentStatus(tour).status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="glassmorphic rounded-xl p-4">
                                <EmptyState title="No Tournaments Found" message="Try adjusting your search or add a new tournament." />
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'organizers' && (
                     <div className="animate-form-step-enter">
                         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white">Manage Organizers</h2>
                             <div className="relative w-full sm:w-auto">
                                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input type="text" placeholder="Search organizers..." value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} className="w-full sm:w-64 bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                             </div>
                        </div>

                         {filteredOrganizers.length > 0 ? (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block glassmorphic rounded-xl overflow-hidden">
                                     <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-300">
                                            <thead className="text-xs text-gray-400 uppercase bg-black/20">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">Name</th>
                                                    <th scope="col" className="px-6 py-4">Email</th>
                                                    <th scope="col" className="px-6 py-4">Tournaments</th>
                                                    <th scope="col" className="px-6 py-4">Rating</th>
                                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrganizers.map(org => (
                                                    <tr key={org.id} className="border-b border-gray-800 hover:bg-white/5">
                                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{org.name}</td>
                                                        <td className="px-6 py-4">{org.contact_email}</td>
                                                        <td className="px-6 py-4">{org.total_tournaments || 0}</td>
                                                        <td className="px-6 py-4">{org.rating || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <button onClick={() => openEditOrganizerForm(org)} className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors mr-4">
                                                                <PencilIcon className="w-4 h-4"/> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteClick('organizer', org.id)} className="inline-flex items-center gap-1.5 font-medium text-red-400 hover:text-red-300 transition-colors">
                                                                <TrashIcon className="w-4 h-4"/> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                 {/* Mobile Card View */}
                                <div className="block md:hidden space-y-4">
                                     {filteredOrganizers.map(org => (
                                        <div key={org.id} className="glassmorphic rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-start gap-4">
                                                <p className="font-bold text-white pr-4">{org.name}</p>
                                                <div className="flex-shrink-0 flex items-center gap-4">
                                                    <button onClick={() => openEditOrganizerForm(org)} aria-label="Edit" className="text-blue-400 hover:text-blue-300"><PencilIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteClick('organizer', org.id)} aria-label="Delete" className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 break-all">{org.contact_email}</p>
                                            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="text-gray-400">Tournaments: </span>
                                                    <span className="font-semibold text-white">{org.total_tournaments || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Rating: </span>
                                                    <span className="font-semibold text-white">{org.rating || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="glassmorphic rounded-xl p-4">
                                <EmptyState title="No Organizers Found" message="Try adjusting your search or add a new organizer." />
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanelPage;