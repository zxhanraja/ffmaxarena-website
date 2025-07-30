import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrophyIcon, CheckCircleIcon, SendIcon, ArrowRightIcon, ZapIcon, UploadCloudIcon, XIcon, YoutubeIcon } from '../components/icons/IconDefs';
import Stepper from '../components/Stepper';
import { useNotifier } from '../contexts/NotificationContext';
import Spinner from '../components/Spinner';
import { supabase } from '../supabaseClient';
import CustomSelect from '../components/CustomSelect';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
const FORM_CACHE_KEY = 'submitTournamentFormCache';

// --- Reusable Form Field Components ---
const InputField: React.FC<{ label: string; name: string; type?: string; placeholder?: string; isOptional?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; }> = ({ label, name, type = 'text', placeholder, isOptional = false, value, onChange, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label} {!isOptional && <span className="text-red-400">*</span>} {isOptional && <span className="text-gray-500">(Optional)</span>}
        </label>
        <input type={type} name={name} id={name} placeholder={placeholder || `Enter ${label.toLowerCase()}`} required={!isOptional} value={value} onChange={onChange} className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-white/20 focus:ring-cyan-500'}`} />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; placeholder: string; isOptional?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; children?: React.ReactNode }> = ({ label, name, placeholder, isOptional = true, value, onChange, children }) => (
     <div>
        <div className="flex justify-between items-center mb-1.5">
            <label htmlFor={name} className="block text-sm font-medium text-gray-300">
                {label} {isOptional && <span className="text-gray-500">(Optional)</span>}
            </label>
            {children}
        </div>
        <textarea name={name} id={name} rows={4} placeholder={placeholder} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={value} onChange={onChange} />
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

const FREE_FIRE_MAPS = ["Bermuda", "Bermuda Remastered", "Purgatory", "Kalahari", "Alpine", "NeXTerra"];


const ImageUploadField: React.FC<{
    label: string;
    isOptional?: boolean;
    onUploadSuccess: (url: string) => void;
    imageUrl: string;
    onRemove: () => void;
    error?: string;
}> = ({ label, isOptional = false, onUploadSuccess, imageUrl, onRemove, error }) => {
    const [uploading, setUploading] = useState(false);
    const notifier = useNotifier();

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            notifier.error("File is too large. Please upload an image under 5MB.");
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            notifier.error("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
            return;
        }
        
        setUploading(true);
        
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('tournament-posters')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });
        
        if (uploadError) {
            notifier.error(`Upload failed: ${uploadError.message}`);
            console.error(uploadError);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage
            .from('tournament-posters')
            .getPublicUrl(filePath);

        if (data.publicUrl) {
            onUploadSuccess(data.publicUrl);
        } else {
            notifier.error("Could not get public URL for the uploaded image.");
        }
        
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {label} {!isOptional && <span className="text-red-400">*</span>} {isOptional && <span className="text-gray-500">(Optional)</span>}
            </label>
            {!imageUrl ? (
                <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${error ? 'border-red-500' : 'border-gray-600'} border-dashed rounded-md`}>
                    <div className="space-y-1 text-center">
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-400">
                            <label
                                htmlFor={`file-upload-${name}`}
                                className="relative cursor-pointer rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none"
                            >
                                <span>Upload a file</span>
                                <input id={`file-upload-${name}`} name={`file-upload-${name}`} type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} disabled={uploading} accept="image/png, image/jpeg, image/webp" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-md">
                            <Spinner size="w-8 h-8"/>
                            <p className="text-white mt-2">Uploading...</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-2 relative">
                    <img src={imageUrl} alt="Image Preview" className="max-h-60 rounded-md mx-auto border border-gray-600" />
                    <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
};


// --- Main Page Component ---
const SubmitTournamentPage: React.FC = () => {
    const notifier = useNotifier();
    const navigate = useNavigate();

    const initialFormData = {
        organizer_name: '', email: '', tournament_title: '', date: '', hour: '07', minute: '00', ampm: 'PM',
        entry_fee: '', game_mode: 'Squad', map: 'Bermuda', prize_pool: '', max_participants: '', whatsapp_link: '',
        discord_link: '', registration_link: '', youtube_link: '', description: '', poster_url: ''
    };

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSending, setIsSending] = useState(false);

    const [formData, setFormData] = useState(() => {
        try {
            const cachedData = localStorage.getItem(FORM_CACHE_KEY);
            // Merge with initialFormData to ensure new fields are present
            return cachedData ? { ...initialFormData, ...JSON.parse(cachedData) } : initialFormData;
        } catch {
            return initialFormData;
        }
    });

    useEffect(() => {
        localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(formData));
    }, [formData]);


    const STEPS = ["Core Info", "Schedule & Rules", "Media & Links", "Review & Submit"];
    
    const hourOptions = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') }));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }));
    const ampmOptions = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];
    const gameModeOptions = [{value: 'Squad', label: 'Squad'}, {value: 'Duo', label: 'Duo'}, {value: 'Solo', label: 'Solo'}, {value: 'Clash Squad', label: 'Clash Squad'}];
    const mapOptions = FREE_FIRE_MAPS.map(mapName => ({value: mapName, label: mapName}));


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const resetForm = () => {
        if (window.confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
            setFormData(initialFormData);
        }
    }

    const validateStep = () => {
        const newErrors: { [key: string]: string } = {};
        if (step === 1) {
            if (!formData.organizer_name) newErrors.organizer_name = "Organizer name is required";
            if (!formData.email) newErrors.email = "Organizer email is required";
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid";
            if (!formData.tournament_title) newErrors.tournament_title = "Tournament title is required";
        }
        if (step === 2) {
            if (!formData.date) newErrors.date = "Tournament date is required";
            const today = new Date();
            today.setHours(0,0,0,0);
            if (new Date(formData.date) < today) newErrors.date = "Date cannot be in the past";
            if (!formData.entry_fee) newErrors.entry_fee = "Entry fee is required (e.g., FREE or 50)";
        }
        if (step === 3) {
            if (!formData.poster_url) {
                newErrors.poster_url = "A poster image is required. Please upload one.";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const nextStep = () => {
        if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length));
    };

    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending) return;

        if (!WEB3FORMS_ACCESS_KEY) {
            notifier.error("Form submission is not configured.");
            return;
        }

        const tempErrors: { [key: string]: string } = {};
        // Step 1
        if (!formData.organizer_name) tempErrors.organizer_name = "Organizer name is required";
        if (!formData.email) tempErrors.email = "Organizer email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Email address is invalid";
        if (!formData.tournament_title) tempErrors.tournament_title = "Tournament title is required";
        // Step 2
        if (!formData.date) tempErrors.date = "Tournament date is required";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (formData.date && new Date(formData.date) < today) tempErrors.date = "Date cannot be in the past";
        if (!formData.entry_fee) tempErrors.entry_fee = "Entry fee is required (e.g., FREE or 50)";
        // Step 3
        if (!formData.poster_url) {
            tempErrors.poster_url = "A poster image is required. Please upload one.";
        }

        setErrors(tempErrors);

        if (Object.keys(tempErrors).length > 0) {
            notifier.error('Please review your submission. Some required fields are missing.');
            const firstErrorKey = Object.keys(tempErrors)[0];
            if (['organizer_name', 'email', 'tournament_title'].includes(firstErrorKey)) {
                setStep(1);
            } else if (['date', 'entry_fee'].includes(firstErrorKey)) {
                setStep(2);
            } else if (['poster_url'].includes(firstErrorKey)) {
                setStep(3);
            }
            return;
        }

        setIsSending(true);

        const fullDateTime = `${formData.date} at ${formData.hour}:${formData.minute} ${formData.ampm}`;
        const submissionData = {
            ...formData,
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `New Tournament Submission: ${formData.tournament_title}`,
            from_name: "FFMaxArena Submissions",
            fullDateTime,
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
                navigate("/thank-you/submission");
            } else {
                console.error("Web3Forms error:", result);
                notifier.error(result.message || "An error occurred submitting the form.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            notifier.error(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        const target = e.target as HTMLElement;
        if (e.key === 'Enter' && target.tagName !== 'TEXTAREA' && step < STEPS.length) {
            e.preventDefault();
            nextStep();
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-white">Submit Your Tournament</h1>
                <p className="mt-4 text-base text-gray-400">Follow the steps to get your tournament listed on FFMaxArena.</p>
            </div>
            
            <div className="mt-16 mb-12 flex justify-center">
                 <Stepper currentStep={step} totalSteps={STEPS.length} steps={STEPS} />
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="mt-12 glassmorphic rounded-xl p-6 sm:p-8 space-y-8 card-glow-border">
                <div className="animate-form-step-enter">
                    {step === 1 && (
                        <div className="space-y-6">
                             <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 1: Core Information</h2>
                            <FormRow>
                                <InputField label="Organizer Name" name="organizer_name" value={formData.organizer_name} onChange={handleInputChange} error={errors.organizer_name} />
                                <InputField label="Organizer Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                            </FormRow>
                            <InputField label="Tournament Title" name="tournament_title" value={formData.tournament_title} onChange={handleInputChange} error={errors.tournament_title}/>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 2: Schedule & Rules</h2>
                             <FormRow>
                                <InputField label="Tournament Date" name="date" type="date" value={formData.date} onChange={handleInputChange} error={errors.date}/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Time <span className="text-red-400">*</span></label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <CustomSelect options={hourOptions} value={formData.hour} onChange={(v) => handleSelectChange('hour', v)} />
                                        <CustomSelect options={minuteOptions} value={formData.minute} onChange={(v) => handleSelectChange('minute', v)} />
                                        <CustomSelect options={ampmOptions} value={formData.ampm} onChange={(v) => handleSelectChange('ampm', v)} />
                                    </div>
                                </div>
                            </FormRow>
                             <FormRow>
                                <InputField label="Entry Fee" name="entry_fee" placeholder="e.g., FREE or 50" value={formData.entry_fee} onChange={handleInputChange} error={errors.entry_fee} />
                                <CustomSelect label="Game Mode" name="game_mode" options={gameModeOptions} value={formData.game_mode} onChange={(v) => handleSelectChange('game_mode', v)} />
                            </FormRow>
                            <FormRow>
                                <CustomSelect label="Map" name="map" options={mapOptions} value={formData.map} onChange={(v) => handleSelectChange('map', v)} />
                                <InputField label="Prize Pool" name="prize_pool" placeholder="e.g., 10000" isOptional value={formData.prize_pool} onChange={handleInputChange}/>
                            </FormRow>
                            <InputField label="Max Participants" name="max_participants" placeholder="e.g., 100 teams / 400 players" isOptional value={formData.max_participants} onChange={handleInputChange}/>
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 3: Media & Links</h2>
                             <ImageUploadField
                                label="Tournament Poster"
                                imageUrl={formData.poster_url}
                                onUploadSuccess={(url) => {
                                    handleSelectChange('poster_url', url);
                                    if (errors.poster_url) {
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.poster_url;
                                            return newErrors;
                                        });
                                    }
                                }}
                                onRemove={() => {
                                    handleSelectChange('poster_url', '');
                                }}
                                error={errors.poster_url}
                            />
                            <FormRow>
                                <InputField label="WhatsApp Group Link" name="whatsapp_link" placeholder="https://chat.whatsapp.com/..." isOptional value={formData.whatsapp_link} onChange={handleInputChange}/>
                                <InputField label="Discord Invite Link" name="discord_link" placeholder="https://discord.gg/..." isOptional value={formData.discord_link} onChange={handleInputChange}/>
                            </FormRow>
                            <FormRow>
                                <InputField label="Registration Link" name="registration_link" placeholder="https://forms.gle/... or your registration form link" isOptional value={formData.registration_link} onChange={handleInputChange}/>
                                <InputField label="YouTube Stream/Channel Link" name="youtube_link" placeholder="For stream promotion and credibility" isOptional value={formData.youtube_link} onChange={handleInputChange}/>
                            </FormRow>
                            <TextAreaField label="Tournament Description" name="description" placeholder="Additional details about your Free Fire Max tournament..." isOptional value={formData.description} onChange={handleInputChange} />
                        </div>
                    )}
                    
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Step 4: Review Your Submission</h2>
                            <p className="text-gray-400">Please review all the information carefully before submitting.</p>
                            <div className="border-t border-b border-white/20 divide-y divide-white/20">
                                <ReviewItem label="Organizer Name" value={formData.organizer_name} />
                                <ReviewItem label="Organizer Email" value={formData.email} />
                                <ReviewItem label="Tournament Title" value={formData.tournament_title} />
                                <ReviewItem label="Date & Time" value={`${formData.date} at ${formData.hour}:${formData.minute} ${formData.ampm}`} />
                                <ReviewItem label="Game Mode" value={formData.game_mode} />
                                <ReviewItem label="Map" value={formData.map} />
                                <ReviewItem label="Entry Fee" value={formData.entry_fee} />
                                <ReviewItem label="Prize Pool" value={formData.prize_pool} />
                                <ReviewItem label="Max Participants" value={formData.max_participants} />
                                <ReviewItem label="Registration Link" value={formData.registration_link} />
                                <ReviewItem label="WhatsApp Link" value={formData.whatsapp_link} />
                                <ReviewItem label="Discord Link" value={formData.discord_link} />
                                <ReviewItem label="YouTube Link" value={formData.youtube_link} />
                                <ReviewItem label="Poster URL" value={formData.poster_url} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-5 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between items-center">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
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
                        {step < STEPS.length && (
                             <button type="button" onClick={nextStep} className="w-full inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-colors">
                                <span>Next Step</span>
                                <ArrowRightIcon className="ml-2 w-4 h-4" />
                            </button>
                        )}
                        {step === STEPS.length && (
                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full sm:w-auto inline-flex items-center justify-center py-3 px-12 border border-transparent shadow-sm text-base font-medium rounded-md text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 soft-glow disabled:bg-gray-600 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <SendIcon className="w-5 h-5 mr-2" />
                                        <span>Submit Tournament</span>
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

export default SubmitTournamentPage;