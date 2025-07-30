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

const TermsOfServicePage: React.FC = () => {
    return (
        <StaticPageLayout title="Terms of Service">
            <p>Welcome to FFMaxArena. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.</p>
            
            <h2>1. Platform Usage</h2>
            <p>FFMaxArena is a community-driven platform for finding and listing Free Fire Max tournaments. We are a non-profit entity and are not affiliated with Garena. Our goal is to provide a safe and reliable space for the gaming community.</p>
            
            <h2>2. User Conduct</h2>
            <p>Users are expected to conduct themselves respectfully. Harassment, abuse, or any form of toxic behavior towards other users or organizers is strictly prohibited. We reserve the right to ban users who violate these rules.</p>
            
            <h2>3. Tournament Submissions</h2>
            <p>Organizers who submit tournaments are responsible for the accuracy of the information provided. All submissions are reviewed by our team before being listed. We reserve the right to reject or remove any tournament listing that we deem inappropriate or fraudulent.</p>

            <h2>4. Disclaimer</h2>
            <p>FFMaxArena acts as a directory and is not responsible for the execution or management of the tournaments listed. Any disputes between players and organizers must be resolved between the involved parties. We strive to list only verified and trusted organizers but cannot guarantee the outcome of any tournament.</p>
            
            <h2>5. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. We will notify users of any significant changes. Continued use of the platform after such changes constitutes your acceptance of the new terms.</p>
        </StaticPageLayout>
    );
};

export default TermsOfServicePage;