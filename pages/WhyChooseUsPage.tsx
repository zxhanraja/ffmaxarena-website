import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, HeartIcon, UsersIcon, ZapIcon, ArrowLeftIcon } from '../components/icons/IconDefs';

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="glassmorphic rounded-lg p-6 flex items-start space-x-4 card-glow-border">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-white/10 text-cyan-400">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-gray-400">{description}</p>
        </div>
    </div>
);

const WhyChooseUsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium">Back to Home</span>
                </Link>
            </div>
            <div className="text-center">
                <ZapIcon className="h-20 w-20 mx-auto text-cyan-400 animate-pulse-glow" />
                <h1 className="mt-4 text-4xl sm:text-5xl font-bold font-orbitron text-white">Why Choose FFMaxArena?</h1>
                <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
                    We're not just another tournament listing site. We are a passionate, community-driven project dedicated to creating a better esports ecosystem for Free Fire Max in India.
                </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Feature
                    icon={<ShieldCheckIcon className="w-7 h-7" />}
                    title="Focus on Trust & Safety"
                    description="Every organizer is manually vetted by our team. We prioritize listing legitimate tournaments to protect players from scams and ensure a fair competitive environment."
                />
                <Feature
                    icon={<HeartIcon className="w-7 h-7" />}
                    title="100% Non-Profit & Fan-Made"
                    description="FFMaxArena is a non-profit project. We don't charge listing fees or take a cut from prize pools. Our only goal is to support and grow the Indian Free Fire Max community."
                />
                <Feature
                    icon={<UsersIcon className="w-7 h-7" />}
                    title="For the Community, By the Community"
                    description="This platform was built by Free Fire enthusiasts who understand what players and organizers need. We are always open to feedback to make the platform better for everyone."
                />
                <Feature
                    icon={<ZapIcon className="w-7 h-7" />}
                    title="Centralized & Easy to Use"
                    description="No more scrolling through endless social media feeds. We provide a clean, organized, and easy-to-navigate hub for all the best Free Fire Max tournaments in one place."
                />
            </div>
        </div>
    );
};

export default WhyChooseUsPage;