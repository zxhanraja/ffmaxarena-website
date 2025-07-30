import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons/IconDefs';

const StaticPageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to Home</span>
            </Link>
        </div>
        <div className="glassmorphic rounded-xl p-6 sm:p-10 card-glow-border">
            <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-white mb-6">{title}</h1>
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-4">
                {children}
            </div>
        </div>
    </div>
);

const PromotionGuidelinesPage: React.FC = () => {
    return (
        <StaticPageLayout title="Promotion Guidelines">
            <p>To ensure a high-quality and trustworthy experience for all users, we have established these promotion guidelines for tournament organizers.</p>

            <h2>1. Clarity and Honesty</h2>
            <p>All tournament information must be clear, accurate, and not misleading. This includes prize pools, entry fees, schedules, and rules. Do not promise prizes you cannot deliver.</p>

            <h2>2. Professional Poster Design</h2>
            <p>Your tournament poster is the first impression players will have. It should be high-quality, easy to read, and contain all essential information. Avoid cluttered designs and use clear fonts. A 16:9 aspect ratio is recommended.</p>

            <h2>3. Reliable Contact Information</h2>
            <p>Provide active and reliable contact links (e.g., WhatsApp, Discord). Players need a way to reach you for questions and support. Dead links or unresponsive contacts will result in your tournament being delisted.</p>

            <h2>4. No False Scarcity or Urgency</h2>
            <p>Do not use misleading tactics like "Only 2 slots left!" unless it is verifiably true. Be honest about your tournament's capacity and registration status.</p>

            <h2>5. Adherence to Community Standards</h2>
            <p>Your tournament promotion must not contain any offensive, discriminatory, or inappropriate content. We are a community-first platform and expect all organizers to uphold a positive and inclusive environment.</p>
        </StaticPageLayout>
    );
};

export default PromotionGuidelinesPage;