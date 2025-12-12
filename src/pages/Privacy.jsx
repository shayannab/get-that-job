import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white border-b border-border">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <img src="/assets/logo.png" alt="ResumeLab" className="h-8 w-8" />
                            <span className="text-2xl font-bold text-textPrimary tracking-tight">
                                ResumeLab
                            </span>
                        </div>
                        <button
                            className="btn-ghost flex items-center gap-2 text-textSecondary hover:text-textPrimary"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container-custom py-12 md:py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center">
                            <Shield size={24} className="text-textPrimary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary">Privacy Policy</h1>
                            <p className="text-textSecondary">Last updated: December 2025</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <div className="bg-white rounded-2xl p-8 border border-border space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">1. Information We Collect</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    When you use ResumeLab, we collect information you provide directly, including:
                                </p>
                                <ul className="list-disc pl-6 mt-3 space-y-2 text-textSecondary">
                                    <li>Job posting content you paste for analysis</li>
                                    <li>Personal information for your resume (name, email, phone)</li>
                                    <li>Work experience and education details you provide</li>
                                    <li>Skills and qualifications you share</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">2. How We Use Your Information</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    We use your information solely to:
                                </p>
                                <ul className="list-disc pl-6 mt-3 space-y-2 text-textSecondary">
                                    <li>Generate customized resumes and cover letters</li>
                                    <li>Analyze job postings and provide ATS optimization</li>
                                    <li>Calculate skills gap and salary insights</li>
                                    <li>Improve our AI models and service quality</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">3. Data Storage & Security</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    Your data is processed in real-time and is not permanently stored on our servers.
                                    We use industry-standard encryption to protect data during transmission.
                                    Resume content exists only during your active session.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">4. Third-Party Services</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    We use AI language models to analyze job postings and generate content.
                                    These services process your data according to their respective privacy policies.
                                    We do not sell or share your personal information with advertisers.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">5. Your Rights</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    You have the right to:
                                </p>
                                <ul className="list-disc pl-6 mt-3 space-y-2 text-textSecondary">
                                    <li>Access the information you've provided</li>
                                    <li>Request deletion of your data</li>
                                    <li>Opt out of data processing</li>
                                    <li>Export your resume in various formats</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">6. Contact Us</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    If you have questions about this Privacy Policy, please contact us at{' '}
                                    <a href="mailto:privacy@resumelab.app" className="text-textPrimary underline">
                                        privacy@resumelab.app
                                    </a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Privacy;
