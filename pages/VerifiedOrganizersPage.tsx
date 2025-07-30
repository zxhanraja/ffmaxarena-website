import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheckIcon, UsersIcon, TrophyIcon, ArrowRightIcon, SendIcon, StarIcon } from '../components/icons/IconDefs';
import SkeletonCard from '../components/skeletons/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { Organizer } from '../types';
import { useNotifier } from '../contexts/NotificationContext';
import Stepper from '../components/Stepper';
import Spinner from '../components/Spinner';
import { getTransformedImageUrl, sanitizeUrl } from '../utils/helper';
import { useData } from '../contexts/DataContext';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
const FORM_CACHE_KEY = 'organizerVerificationFormCache';

// --- Form Field Components (Styled like SubmitTournamentPage) ---
const InputField: React.FC<{ label: string; name: string; type?: string; placeholder: string; required?: boolean; isOptional?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; }> = ({ label, name, type = 'text', placeholder, required = false, isOptional = false, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">{label} {required && <span className="text-red-400">*</span>} {isOptional && <span className="text-gray-500">(Optional)</span>}</label>
        <input type={type} name={name} placeholder={placeholder} required={required} value={value} onChange={onChange} className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-white/20 focus:ring-cyan-500'}`} />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; placeholder: string; required?: boolean; isOptional?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; error?: string; }> = ({ label, name, placeholder, required = false, isOptional = false, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">{label} {required && <span className="text-red-400">*</span>} {isOptional && <span className="text-gray-500">(Optional)</span>}</label>
        <textarea name={name} placeholder={placeholder} required={required} rows={3} value={value} onChange={onChange} className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-white/20 focus:ring-cyan-500'}`}></textarea>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">{children}</div>
);

const ReviewItem: React.FC<{ label: string; value: string | React.ReactNode | null;}> = ({label, value}) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 break-words">{value || <span className="text-gray-500">Not provided</span>}</dd>
    </div>
)

const VERIFICATION_STEPS = ["Contact", "Experience", "Links", "Review & Submit"];

// --- Organizer Verification Form Page Component ---
const OrganizerVerificationForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const notifier = useNotifier();
    const navigate = useNavigate();
    const initialFormData = {
        organizer_name: '', email: '', phone: '', organization_name: '', experience: '',
        previous_tournaments: '', whatsapp_link: '', discord_link: '', social_media: '',
        why_verified: '', proof_links: '', logo_url: ''
    };
    
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSending, setIsSending] = useState(false);
    
    const [formData, setFormData] = useState(() => {
        try {
            const cachedData = localStorage.getItem(FORM_CACHE_KEY);
            return cachedData ? { ...initialFormData, ...JSON.parse(cachedData) } : initialFormData;
        } catch {
            return initialFormData;
        }
    });

    useEffect(() => {
        localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(formData));
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const resetForm = () => {
        if (window.confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
            setFormData(initialFormData);
        }
    };

    const handleCancel = () => {
        localStorage.removeItem(FORM_CACHE_KEY);
        onCancel();
    };

    const validateStep = (isFinal = false) => {
        const newErrors: { [key: string]: string } = {};

        const checkStep1 = () => {
            if (!formData.organizer_name) newErrors.organizer_name = "Name is required";
            if (!formData.organization_name) newErrors.organization_name = "Organization name is required";
            if (!formData.email) newErrors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
            if (!formData.phone) newErrors.phone = "Phone number is required";
        };
        const checkStep2 = () => {
            if (!formData.experience) newErrors.experience = "Experience is required";
            if (!formData.why_verified) newErrors.why_verified = "This field is required";
        };
        
        if (isFinal) {
            checkStep1();
            checkStep2();
        } else {
            if (step === 1) checkStep1();
            if (step === 2) checkStep2();
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) setStep(s => Math.min(s + 1, VERIFICATION_STEPS.length));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending) return;

        if (!WEB3FORMS_ACCESS_KEY) {
            notifier.error("Form submission is not configured.");
            return;
        }
        
        if (!validateStep(true)) {
            notifier.error("Please fill all required fields before submitting.");
            const firstErrorKey = Object.keys(errors)[0] || '';
            if (['organizer_name', 'organization_name', 'email', 'phone'].includes(firstErrorKey)) {
                setStep(1);
            } else if (['experience', 'why_verified'].includes(firstErrorKey)) {
                setStep(2);
            }
            return;
        }

        setIsSending(true);
        const submissionData = {
            ...formData,
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `New Organizer Verification: ${formData.organizer_name}`,
            from_name: "FFMaxArena Verifications",
        };

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(submissionData),
            });

            const result = await res.json();
            if (result.success) {
                localStorage.removeItem(FORM_CACHE_KEY);
                navigate("/thank-you/verification");
            } else {
                console.error("Web3Forms error:", result);
                notifier.error(result.message || "An error occurred submitting the form.");
            }
        } catch (error) {
            console.error('Submission failed:', error);
            notifier.error(error instanceof Error ? error.message : "An unknown submission error occurred.");
        } finally {
            setIsSending(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        const target = e.target as HTMLElement;
        if (e.key === 'Enter' && target.tagName !== 'TEXTAREA' && step < VERIFICATION_STEPS.length) {
            e.preventDefault();
            nextStep();
        }
    };

     return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-white">Organizer Verification</h1>
                <p className="mt-4 text-base text-gray-400">Follow the steps to become a verified organizer on FFMaxArena.</p>
            </div>
            
            <div className="mt-16 mb-12 flex justify-center">
                 <Stepper currentStep={step} totalSteps={VERIFICATION_STEPS.length} steps={VERIFICATION_STEPS} />
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="mt-12 glassmorphic rounded-xl p-6 sm:p-8 space-y-8 card-glow-border">
                <div className="animate-form-step-enter">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 1: Contact Information</h2>
                            <FormRow>
                                <InputField label="Full Name / Team Name" name="organizer_name" required placeholder="Your name or team name" value={formData.organizer_name} onChange={handleInputChange} error={errors.organizer_name} />
                                <InputField label="Organization Name" name="organization_name" required placeholder="Your organization/team name" value={formData.organization_name} onChange={handleInputChange} error={errors.organization_name} />
                            </FormRow>
                            <FormRow>
                                <InputField label="Contact Email Address" name="email" type="email" required placeholder="your.email@example.com" value={formData.email} onChange={handleInputChange} error={errors.email} />
                                <InputField label="Contact Phone Number" name="phone" type="tel" required placeholder="+91 XXXXXXXXXX" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                            </FormRow>
                        </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 2: Experience & Purpose</h2>
                            <InputField label="Experience in Tournament Organization" name="experience" required placeholder="e.g., 2+ years organizing" value={formData.experience} onChange={handleInputChange} error={errors.experience} />
                            <TextAreaField label="Previous Tournaments Organized" name="previous_tournaments" isOptional placeholder="List previous tournaments with participant count, dates, etc." value={formData.previous_tournaments} onChange={handleInputChange}/>
                            <TextAreaField label="Proof of Past Tournaments" name="proof_links" isOptional placeholder="Provide direct links to screenshots, videos, or results of past tournaments (one link per line)." value={formData.proof_links} onChange={handleInputChange}/>
                            <TextAreaField label="Why do you want to become a verified organizer?" name="why_verified" required placeholder="Tell us about your goals and community." value={formData.why_verified} onChange={handleInputChange} error={errors.why_verified} />
                         </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 3: Community Links</h2>
                            <InputField label="Logo URL" name="logo_url" type="url" isOptional placeholder="https://i.imgur.com/your-logo.png" value={formData.logo_url} onChange={handleInputChange}/>
                            <TextAreaField label="Social Media Links" name="social_media" isOptional placeholder="YouTube, Instagram, etc. (one per line)" value={formData.social_media} onChange={handleInputChange}/>
                            <FormRow>
                                <InputField label="WhatsApp Group Link" name="whatsapp_link" type="url" isOptional placeholder="https://chat.whatsapp.com/..." value={formData.whatsapp_link} onChange={handleInputChange}/>
                                <InputField label="Discord Server Link" name="discord_link" type="url" isOptional placeholder="https://discord.gg/..." value={formData.discord_link} onChange={handleInputChange}/>
                            </FormRow>
                        </div>
                    )}
                     {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 4: Review Your Application</h2>
                            <p className="text-gray-400">Please review all the information carefully before submitting.</p>
                            <div className="border-t border-b border-white/20 divide-y divide-white/20">
                                <ReviewItem label="Full Name / Team Name" value={formData.organizer_name} />
                                <ReviewItem label="Organization Name" value={formData.organization_name} />
                                <ReviewItem label="Contact Email" value={formData.email} />
                                <ReviewItem label="Contact Phone" value={formData.phone} />
                                <ReviewItem label="Experience" value={formData.experience} />
                                <ReviewItem label="Previous Tournaments" value={formData.previous_tournaments} />
                                <ReviewItem label="Proof Links" value={formData.proof_links} />
                                <ReviewItem label="Reason for Verification" value={formData.why_verified} />
                                <ReviewItem label="Logo URL" value={formData.logo_url} />
                                <ReviewItem label="Social Media" value={formData.social_media} />
                                <ReviewItem label="WhatsApp Link" value={formData.whatsapp_link} />
                                <ReviewItem label="Discord Link" value={formData.discord_link} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-5 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between items-center">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {step === 1 && (
                            <button type="button" onClick={handleCancel} className="w-full justify-center flex px-6 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">
                                Cancel
                            </button>
                        )}
                        {step > 1 && (
                             <button type="button" onClick={prevStep} className="w-full justify-center flex px-6 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors">
                                Previous
                            </button>
                        )}
                        {step > 1 && (
                            <button type="button" onClick={resetForm} className="w-full justify-center flex px-4 py-2 rounded-lg text-red-400 bg-red-900/20 hover:bg-red-900/40 transition-colors text-sm">
                                Reset
                            </button>
                        )}
                    </div>
                    <div className="w-full sm:w-auto">
                        {step < VERIFICATION_STEPS.length && (
                             <button type="button" onClick={nextStep} className="w-full inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-colors">
                                <span>Next Step</span>
                                <ArrowRightIcon className="ml-2 w-4 h-4" />
                            </button>
                        )}
                        {step === VERIFICATION_STEPS.length && (
                             <button type="submit" disabled={isSending} className="w-full sm:w-auto inline-flex items-center justify-center py-3 px-12 border border-transparent shadow-sm text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 soft-glow disabled:bg-gray-600 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed">
                                {isSending ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <SendIcon className="w-5 h-5 mr-2" />
                                        <span>Submit Application</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};


// --- Original Page Components (Redesigned) ---

const OrganizerStatCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
    <div className="glassmorphic p-4 sm:p-6 rounded-lg flex items-center space-x-4 card-glow-border">
        <div className="p-3 bg-white/10 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-3xl font-bold font-orbitron">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
        </div>
    </div>
);

const Badge: React.FC<{ text: string }> = ({ text }) => {
    const badgeMap: { [key: string]: { icon: React.ReactNode, style: string } } = {
        'Verified Badge': { icon: <ShieldCheckIcon className="w-3.5 h-3.5 mr-1.5" />, style: 'bg-green-900/50 text-green-300' },
        'Priority Listing': { icon: <TrophyIcon className="w-3.5 h-3.5 mr-1.5" />, style: 'bg-blue-900/50 text-blue-300' },
        'Featured Tournaments': { icon: <StarIcon className="w-3.5 h-3.5 mr-1.5" />, style: 'bg-purple-900/50 text-purple-300' },
    };
    const badgeInfo = badgeMap[text] || { icon: null, style: 'bg-gray-700 text-gray-300' };

    return (
        <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeInfo.style}`}>
            {badgeInfo.icon}
            {text}
        </span>
    );
};

const OrganizerCard: React.FC<{ organizer: Organizer }> = React.memo(({ organizer }) => {
    const dicebearFallback = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${organizer.name}`;
    const safeLogoUrl = sanitizeUrl(organizer.logo_url) ?? dicebearFallback;
    const optimizedLogoUrl = getTransformedImageUrl(safeLogoUrl, { width: 256, quality: 98 });

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // prevent infinite loop
        if (target.src !== dicebearFallback) {
            target.src = dicebearFallback;
        }
    };

    return (
        <div className="glassmorphic rounded-xl p-6 text-center card-glow-border flex flex-col h-full hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-300">
            <img 
                src={optimizedLogoUrl!}
                alt={`${organizer.name} logo`} 
                className="h-20 w-20 mx-auto rounded-full mb-4 bg-white/10 p-1 border-2 border-white/20"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
            />

            <h3 className="text-lg font-bold text-white">{organizer.name}</h3>
            
            <div className="mt-4 flex-grow flex justify-center items-center flex-wrap gap-2 min-h-[32px]">
                {organizer.badges?.map(badge => <Badge key={badge} text={badge} />)}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                    <p className="font-bold text-lg text-white">{organizer.total_tournaments || 0}</p>
                    <p className="text-gray-400">Tournaments</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg text-white">{organizer.players_served || 0}</p>
                    <p className="text-gray-400">Players</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg text-white">{(organizer.rating ?? 5.0).toFixed(1)}</p>
                    <p className="text-gray-400">Rating</p>
                </div>
            </div>
        </div>
    );
});

const WhyVerifiedFeature: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <div className="p-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-cyan-400 mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-gray-400 text-sm">{description}</p>
    </div>
);

const OrganizerListPage: React.FC<{ onApplyClick: () => void, organizers: Organizer[], loading: boolean }> = ({ onApplyClick, organizers, loading }) => {
    const formatStat = (num: number) => {
        if (num >= 1000) return `${(num/1000).toFixed(1)}k+`;
        return num.toString();
    }
    
    return (
        <div className="space-y-16 sm:space-y-24 pb-16 sm:pb-24">
            <section className="text-center pt-12 sm:pt-16 pb-8 px-4">
                 <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-green-900/50 border-2 border-green-500/50 mb-6 shadow-2xl shadow-green-500/20">
                    <ShieldCheckIcon className="w-12 h-12 text-green-400" />
                 </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-white">Verified Organizers</h1>
                <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">Trusted tournament organizers with proven track records</p>
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-900/50 border border-green-500/50 rounded-full text-green-300 text-sm">
                    All organizers verified by FFMaxArena team
                </div>
            </section>
            
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <OrganizerStatCard icon={<ShieldCheckIcon className="h-8 w-8" />} value={loading ? '...' : organizers.length.toString()} label="Verified Organizers" />
                    <OrganizerStatCard icon={<TrophyIcon className="h-8 w-8" />} value={loading ? '...' : formatStat(organizers.reduce((acc, o) => acc + (o.total_tournaments || 0), 0))} label="Total Tournaments" />
                    <OrganizerStatCard icon={<UsersIcon className="h-8 w-8" />} value={loading ? '...' : formatStat(organizers.reduce((acc, o) => acc + (o.players_served || 0), 0))} label="Players Served" />
                    <OrganizerStatCard icon={<StarIcon className="h-8 w-8" />} value={loading ? '...' : (organizers.reduce((acc, o) => acc + (o.rating || 0), 0) / (organizers.length || 1)).toFixed(1)} label="Average Rating" />
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} isOrganizer />)}
                    </div>
                ) : organizers.length === 0 ? (
                    <div className="mt-12">
                        <EmptyState 
                            title="No Verified Organizers Yet"
                            message="Be the first to join our verified program and gain the trust of thousands of players."
                            buttonText="Apply for Verification"
                            onButtonClick={onApplyClick}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {organizers.map(org => (
                             <Link to={`/organizers/${org.id}`} key={org.id} className="block">
                                <OrganizerCard organizer={org} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glassmorphic rounded-xl p-6 sm:p-8 md:p-12">
                    <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-white text-center">Why become a verified organizer?</h2>
                     <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
                        <WhyVerifiedFeature
                            icon={<ShieldCheckIcon className="w-7 h-7" />}
                            title="Build Trust"
                            description="Gain credibility with a 'Verified' badge that shows players you're a legitimate organizer."
                        />
                         <WhyVerifiedFeature
                            icon={<TrophyIcon className="w-7 h-7" />}
                            title="Get Featured"
                            description="Have your tournaments listed with priority and featured on our homepage to attract more players."
                        />
                         <WhyVerifiedFeature
                            icon={<UsersIcon className="w-7 h-7" />}
                            title="Reach More Players"
                            description="Access our growing community of thousands of dedicated Free Fire Max players across India."
                        />
                    </div>
                    <div className="mt-10 text-center">
                         <button onClick={onApplyClick} className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 soft-glow">
                            Apply for Verification
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};


const VerifiedOrganizersPage: React.FC = () => {
    const { organizers, loading } = useData();
    const [isApplying, setIsApplying] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'apply') {
            setIsApplying(true);
            // Optional: remove the query param from URL after reading it
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    if (isApplying) {
        return <OrganizerVerificationForm onCancel={() => setIsApplying(false)} />;
    }
    
    return <OrganizerListPage onApplyClick={() => setIsApplying(true)} organizers={organizers} loading={loading} />;
};

export default VerifiedOrganizersPage;