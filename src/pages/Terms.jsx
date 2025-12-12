import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

function Terms() {
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
                            <FileText size={24} className="text-textPrimary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary">Terms of Service</h1>
                            <p className="text-textSecondary">Last updated: December 2025</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <div className="bg-white rounded-2xl p-8 border border-border space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">1. Acceptance of Terms</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    By accessing and using ResumeLab, you accept and agree to be bound by these Terms of Service.
                                    If you do not agree to these terms, please do not use our service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">2. Description of Service</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    ResumeLab provides AI-powered resume building tools, including:
                                </p>
                                <ul className="list-disc pl-6 mt-3 space-y-2 text-textSecondary">
                                    <li>Job posting analysis and keyword extraction</li>
                                    <li>ATS-optimized resume generation</li>
                                    <li>Cover letter creation</li>
                                    <li>Skills gap analysis and salary insights</li>
                                    <li>Resume export in PDF, DOCX, and TXT formats</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">3. User Responsibilities</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    You agree to:
                                </p>
                                <ul className="list-disc pl-6 mt-3 space-y-2 text-textSecondary">
                                    <li>Provide accurate and truthful information in your resume</li>
                                    <li>Use the service only for lawful purposes</li>
                                    <li>Not misrepresent your qualifications or experience</li>
                                    <li>Take responsibility for the content you generate</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">4. Intellectual Property</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    You retain ownership of the content you provide (work experience, skills, etc.).
                                    The resumes and cover letters generated are yours to use.
                                    ResumeLab retains rights to the underlying AI technology and service design.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">5. Disclaimer of Warranties</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    ResumeLab is provided "as is" without warranties of any kind.
                                    We do not guarantee that using our service will result in job interviews or employment.
                                    ATS scores and salary estimates are approximations based on available data.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">6. Limitation of Liability</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    ResumeLab shall not be liable for any indirect, incidental, special, or consequential damages
                                    arising from your use of the service. Our total liability is limited to the amount you paid
                                    for the service, if any.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">7. Changes to Terms</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    We reserve the right to modify these terms at any time.
                                    Continued use of the service after changes constitutes acceptance of the new terms.
                                    We will notify users of significant changes via the website.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-textPrimary mb-4">8. Contact</h2>
                                <p className="text-textSecondary leading-relaxed">
                                    For questions about these Terms of Service, please contact us at{' '}
                                    <a href="mailto:legal@resumelab.app" className="text-textPrimary underline">
                                        legal@resumelab.app
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

export default Terms;
