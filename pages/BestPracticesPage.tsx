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

const BestPracticesPage: React.FC = () => {
    return (
        <StaticPageLayout title="Best Practices for Organizers">
            <p>Running a successful tournament requires more than just a prize pool. Follow these best practices to build a strong reputation and a loyal player base.</p>

            <h2>1. Clear and Concise Rulebook</h2>
            <p>Create a comprehensive rulebook that covers everything from registration to match conduct and disputes. A clear rulebook prevents confusion and ensures fair play.</p>

            <h2>2. Punctuality is Key</h2>
            <p>Start your tournaments on time as scheduled. Delays can frustrate players and damage your reputation. If a delay is unavoidable, communicate it clearly and promptly to all participants.</p>

            <h2>3. Active and Responsive Support</h2>
            <p>Be available on your provided contact channels (Discord, WhatsApp) to answer questions and resolve issues before, during, and after the tournament. Good support is a sign of a professional organizer.</p>

            <h2>4. Timely Prize Distribution</h2>
            <p>Distribute prizes to the winners as soon as possible after the tournament concludes. Delays in prize distribution are a major source of player distrust. Be transparent about the payout timeline.</p>

            <h2>5. Gather Feedback</h2>
            <p>After each tournament, ask for feedback from your players. What did they like? What could be improved? Using feedback to improve your next event shows that you care about the player experience.</p>
        </StaticPageLayout>
    );
};

export default BestPracticesPage;