import React, { useState } from 'react';
import { FiFileText, FiRefreshCw, FiCopy, FiDownload, FiCheck, FiEdit3 } from 'react-icons/fi';
import { generateCoverLetter } from '../../services/api';

/**
 * CoverLetterStep - Generate and preview cover letter
 * Uses the same job analysis to create a matching cover letter
 */
function CoverLetterStep({
    jobAnalysis,
    userAnswers,
    resumeContent,
    onBack,
    onContinue,
}) {
    const [coverLetter, setCoverLetter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    const handleGenerateCoverLetter = async () => {
        setLoading(true);
        setError(null);
        setCoverLetter(null);

        try {
            const result = await generateCoverLetter(jobAnalysis, userAnswers, resumeContent);

            if (result.success) {
                setCoverLetter(result.data);
                setEditedContent(result.data.fullText);
            } else {
                setError(result.error || 'Failed to generate cover letter');
            }
        } catch (err) {
            setError('Failed to generate cover letter: ' + (err.message || 'Unknown error'));
            console.error('Error generating cover letter:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        const textToCopy = isEditing ? editedContent : coverLetter?.fullText;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = () => {
        const textToDownload = isEditing ? editedContent : coverLetter?.fullText;
        if (!textToDownload) return;

        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cover_letter.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Save changes - update coverLetter state
            setCoverLetter(prev => ({
                ...prev,
                fullText: editedContent,
            }));
        }
        setIsEditing(!isEditing);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-textPrimary mb-2">
                    Cover Letter Generator
                </h2>
                <p className="text-textSecondary">
                    Generate a personalized cover letter that matches the job requirements and your qualifications.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg">
                    <p className="text-error text-sm">{error}</p>
                </div>
            )}

            {/* Generate Button - Show when no cover letter */}
            {!coverLetter && (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-hover rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiFileText className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-textPrimary mb-2">
                        Ready to Generate Your Cover Letter
                    </h3>
                    <p className="text-textSecondary mb-6 max-w-md mx-auto">
                        Our AI will create a personalized cover letter based on your resume and the job requirements.
                    </p>
                    <button
                        onClick={handleGenerateCoverLetter}
                        disabled={loading}
                        className={loading ? 'btn-disabled' : 'btn-cta'}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <FiRefreshCw className="animate-spin" />
                                Generating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <FiFileText />
                                Generate Cover Letter
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Cover Letter Preview */}
            {coverLetter && (
                <div className="space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleGenerateCoverLetter}
                                disabled={loading}
                                className="btn-primary text-sm flex items-center gap-2"
                            >
                                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                Regenerate
                            </button>
                            <button
                                onClick={toggleEdit}
                                className="btn-primary text-sm flex items-center gap-2"
                            >
                                <FiEdit3 />
                                {isEditing ? 'Save Changes' : 'Edit'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="btn-primary text-sm flex items-center gap-2"
                            >
                                {copied ? <FiCheck className="text-success" /> : <FiCopy />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="btn-cta text-sm flex items-center gap-2"
                            >
                                <FiDownload />
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Letter Content */}
                    <div className="card">
                        {coverLetter.metadata && (
                            <div className="mb-4 pb-4 border-b border-border">
                                <p className="text-sm text-textSecondary">
                                    Cover letter for <span className="font-medium text-textPrimary">{coverLetter.metadata.targetRole}</span>
                                    {coverLetter.metadata.targetCompany && coverLetter.metadata.targetCompany !== '[Company Name]' && (
                                        <span> at <span className="font-medium text-textPrimary">{coverLetter.metadata.targetCompany}</span></span>
                                    )}
                                </p>
                            </div>
                        )}

                        {isEditing ? (
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full min-h-[400px] p-4 bg-surface border border-border rounded-lg text-textPrimary leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        ) : (
                            <div className="prose max-w-none">
                                {/* Greeting */}
                                <p className="text-textPrimary font-medium mb-4">
                                    {coverLetter.greeting}
                                </p>

                                {/* Opening */}
                                <p className="text-textSecondary leading-relaxed mb-4">
                                    {coverLetter.opening}
                                </p>

                                {/* Body */}
                                <div className="text-textSecondary leading-relaxed mb-4 whitespace-pre-line">
                                    {coverLetter.body}
                                </div>

                                {/* Closing */}
                                <p className="text-textSecondary leading-relaxed mb-4">
                                    {coverLetter.closing}
                                </p>

                                {/* Sign-off */}
                                <p className="text-textPrimary whitespace-pre-line">
                                    {coverLetter.signoff}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                        <h4 className="text-sm font-semibold text-accent mb-2">💡 Pro Tips</h4>
                        <ul className="text-sm text-textSecondary space-y-1">
                            <li>• Review and personalize the letter before sending</li>
                            <li>• Replace [Company Name] with the actual company name if needed</li>
                            <li>• Add specific examples from your experience</li>
                            <li>• Proofread for any typos or formatting issues</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-border flex justify-between">
                <button onClick={onBack} className="btn-primary">
                    ← Back to Resume
                </button>
                {coverLetter && (
                    <button onClick={onContinue} className="btn-cta">
                        Continue to Download →
                    </button>
                )}
            </div>
        </div>
    );
}

export default CoverLetterStep;
