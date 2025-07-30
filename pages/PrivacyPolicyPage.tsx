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

const PrivacyPolicyPage: React.FC = () => {
    return (
        <StaticPageLayout title="Privacy Policy">
            <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use FFMaxArena.</p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you submit a tournament, apply for verification, or contact us. This may include your name, email address, and other contact details. We do not collect sensitive personal data.</p>
            
            <h2>2. How We Use Your Information</h2>
            <p>The information we collect is used solely for the purpose of operating our platform. This includes:</p>
            <ul>
                <li>Listing your tournament on our website.</li>
                <li>Contacting you regarding your submission or application.</li>
                <li>Responding to your inquiries.</li>
                <li>Sending newsletters if you have subscribed.</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your information is only used internally by the FFMaxArena team to manage the platform.</p>

            <h2>4. Data Security</h2>
            <p>We use Supabase for our backend, which provides robust security measures to protect your data. While no online service is 100% secure, we take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access.</p>

            <h2>5. Your Choices</h2>
            <p>You can request to have your data removed from our platform by contacting us at our support email. If you have subscribed to our newsletter, you can unsubscribe at any time.</p>
        </StaticPageLayout>
    );
};

export default PrivacyPolicyPage;