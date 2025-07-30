import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, DiscordIcon, InstagramIcon, TelegramIcon, TrophyIcon } from './icons/IconDefs';
import { useNotifier } from '../contexts/NotificationContext';
import Spinner from './Spinner';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const notifier = useNotifier();
    const navigate = useNavigate();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending) return;
        setIsSending(true);

        if (!WEB3FORMS_ACCESS_KEY) {
            notifier.error("Form submission is not configured.");
            setIsSending(false);
            return;
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            notifier.error('Please enter a valid email address.');
            setIsSending(false);
            return;
        }
        
        const submissionData = {
            email: email,
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `New Newsletter Subscription: ${email}`,
            from_name: "FFMaxArena Newsletter",
            message: `${email} has subscribed to the newsletter.`
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
                navigate('/thank-you/newsletter');
            } else {
                console.error("Web3Forms error:", result);
                notifier.error(result.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Submission failed:', error);
            notifier.error("An error occurred. Please try again.");
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <footer className="glassmorphic border-t border-white/10 text-gray-400 mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Column 1: Brand, Socials, Newsletter */}
                    <div className="lg:col-span-1 space-y-8">
                        <Link to="/" className="flex items-center space-x-3">
                            <TrophyIcon className="h-10 w-auto text-cyan-400" />
                            <span className="text-2xl font-bold font-orbitron text-white">FFMaxArena</span>
                        </Link>
                        <p className="text-sm">
                            The heart of the Indian Free Fire Max community. Discover, compete, and connect.
                        </p>
                         <div className="flex space-x-4">
                            <a href="https://www.instagram.com/ffmaxarena?igsh=MTV5bHMwdGM2cHplcA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors"><InstagramIcon className="w-6 h-6" /></a>
                            <a href="https://t.me/+-D3BM7H7DWkzMTdl" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors"><TelegramIcon className="w-6 h-6" /></a>
                            <a href="https://discord.gg/jHsF7S8vwy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors"><DiscordIcon className="w-6 h-6" /></a>
                        </div>
                         <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Stay Updated</h3>
                            <p className="mt-2 text-sm">Get the latest tournaments and news delivered to your inbox.</p>
                            <form onSubmit={handleSubscribe} className="mt-4 flex items-center">
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border-white/20 rounded-l-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                    required
                                />
                                <button type="submit" disabled={isSending} className="p-2 bg-cyan-500 text-black rounded-r-md hover:bg-cyan-400 transition-colors disabled:bg-gray-600 flex justify-center items-center w-11 h-[42px]">
                                    {isSending ? (
                                        <Spinner size="w-6 h-6" />
                                    ) : (
                                        <ArrowRightIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Column 2 & 3: Links */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Platform</h3>
                            <ul className="mt-4 space-y-3">
                                <li><Link to="/tournaments" className="hover:text-cyan-400 transition-colors text-sm">Browse Tournaments</Link></li>
                                <li><Link to="/submit" className="hover:text-cyan-400 transition-colors text-sm">Submit Tournament</Link></li>
                                <li><Link to="/organizers" className="hover:text-cyan-400 transition-colors text-sm">Verified Organizers</Link></li>
                                <li><Link to="/why-choose-us" className="hover:text-cyan-400 transition-colors text-sm">Why Choose Us?</Link></li>
                                <li><Link to="/contact" className="hover:text-cyan-400 transition-colors text-sm">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">For Organizers</h3>
                            <ul className="mt-4 space-y-3">
                                <li><Link to="/organizers?action=apply" className="hover:text-cyan-400 transition-colors text-sm">Apply for Verification</Link></li>
                                <li><Link to="/guidelines" className="hover:text-cyan-400 transition-colors text-sm">Promotion Guidelines</Link></li>
                                <li><Link to="/best-practices" className="hover:text-cyan-400 transition-colors text-sm">Best Practices</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
                            <ul className="mt-4 space-y-3">
                                <li><Link to="/terms" className="hover:text-cyan-400 transition-colors text-sm">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors text-sm">Privacy Policy</Link></li>
                                <li><Link to="/admin" className="hover:text-cyan-400 transition-colors text-sm">Admin Panel</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-gray-500">
                        <p>&copy; {new Date().getFullYear()} FFMaxArena. All Rights Reserved.</p>
                        <p className="mt-1">FFMaxArena is a fan-made, non-profit project and is not affiliated with Garena or Free Fire Max.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;