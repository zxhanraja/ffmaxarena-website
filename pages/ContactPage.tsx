import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, ClockIcon, MapPinIcon, SendIcon } from '../components/icons/IconDefs';
import { useNotifier } from '../contexts/NotificationContext';
import Spinner from '../components/Spinner';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-white/10 text-cyan-400">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="mt-1 text-gray-400">{children}</div>
        </div>
    </div>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
    <div className="border-t border-white/10 py-5">
        <dt className="font-semibold text-white">{question}</dt>
        <dd className="mt-2 text-gray-400">{answer}</dd>
    </div>
);

const ContactPage: React.FC = () => {
    const notifier = useNotifier();
    const navigate = useNavigate();
    const [isSending, setIsSending] = useState(false);
    
    const [formData, setFormData] = useState({ full_name: '', email: '', subject: '', message: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (isSending) return;
        setIsSending(true);

        if (!WEB3FORMS_ACCESS_KEY) {
            notifier.error("Form submission is not configured.");
            setIsSending(false);
            return;
        }

        const submissionData = {
            ...formData,
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Contact Form: ${formData.subject || 'No Subject'}`,
            from_name: formData.full_name,
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
                setFormData({ full_name: '', email: '', subject: '', message: '' });
                navigate("/thank-you/contact");
            } else {
                console.error("Web3Forms error:", result);
                notifier.error(result.message || "An error occurred submitting the form.");
            }
        } catch (error) {
            console.error('Contact form error:', error);
            notifier.error('Failed to send message. Please try again later.');
        }

        setIsSending(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-white">Get Support</h1>
                <p className="mt-4 text-base text-gray-400">We're here to help. Reach out to us with your questions or concerns.</p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-8">
                {/* Left Side: Info */}
                <div className="md:col-span-4 space-y-8">
                    <InfoCard icon={<MailIcon className="h-6 w-6" /> } title="Email Support">
                        <p>Send us a detailed message.</p>
                        <a href="mailto:ffmaxarenaesports@gmail.com" className="mt-2 inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/20 transition-colors">
                            ffmaxarenaesports@gmail.com
                        </a>
                    </InfoCard>
                    <InfoCard icon={<ClockIcon className="h-6 w-6" />} title="Support Hours">
                        <p>Mon-Sun: 9 AM - 11 PM IST</p>
                    </InfoCard>
                    <InfoCard icon={<MapPinIcon className="h-6 w-6" />} title="Location">
                        <p>Mumbai, India</p>
                    </InfoCard>
                </div>

                {/* Right Side: Form */}
                <div className="md:col-span-8">
                    <div className="glassmorphic rounded-xl p-6 sm:p-8 card-glow-border">
                         <div className="flex items-center space-x-3 mb-6">
                            <SendIcon className="w-7 h-7 text-cyan-400" />
                            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">Send us a Message</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Full Name *</label>
                                    <input type="text" name="full_name" id="full_name" placeholder="Your full name" required className="mt-1 block w-full bg-white/5 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" value={formData.full_name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address *</label>
                                    <input type="email" name="email" id="email" placeholder="your.email@example.com" required className="mt-1 block w-full bg-white/5 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" value={formData.email} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Subject</label>
                                <input type="text" name="subject" id="subject" placeholder="What's this about?" className="mt-1 block w-full bg-white/5 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" value={formData.subject} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message *</label>
                                <textarea id="message" name="message" rows={5} placeholder="Tell us how we can help..." required className="mt-1 block w-full bg-white/5 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" value={formData.message} onChange={handleInputChange}></textarea>
                            </div>
                            <div>
                                <button type="submit" disabled={isSending} className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed soft-glow">
                                    {isSending ? (
                                        <Spinner />
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <SendIcon className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-16 sm:mt-24">
                <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-white text-center">Frequently Asked Questions</h2>
                <dl className="mt-8 max-w-3xl mx-auto">
                    <FaqItem question="How long does tournament approval take?" answer="After you submit your tournament via the form, we receive it in our inbox. Our team reviews submissions within 24-48 hours and manually adds approved tournaments to the site." />
                    <FaqItem question="Can I edit my tournament after submission?" answer="Currently, you cannot edit after submitting. Please contact us via email if you need to make changes to a submitted tournament." />
                    <FaqItem question="How do I become a verified organizer?" answer="Use the 'Apply for Verification' form. We review applications from our inbox within 48-72 hours and will add you to the verified list if approved." />
                </dl>
            </div>
        </div>
    );
};

export default ContactPage;