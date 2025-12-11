import React, { useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiInfo, FiChevronDown, FiChevronUp, FiTarget, FiAlertCircle } from 'react-icons/fi';

/**
 * SalaryInsights - Display salary estimates based on resume and job analysis
 */
function SalaryInsights({ salaryData }) {
    const [showDetails, setShowDetails] = useState(false);

    if (!salaryData) {
        return null;
    }

    const { range, currency, factors, tips, confidence, disclaimer } = salaryData;

    // Format currency
    const formatSalary = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Get impact color
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'positive':
                return 'text-success';
            case 'negative':
                return 'text-error';
            default:
                return 'text-textSecondary';
        }
    };

    // Get impact icon
    const getImpactIcon = (impact) => {
        switch (impact) {
            case 'positive':
                return '↑';
            case 'negative':
                return '↓';
            default:
                return '→';
        }
    };

    return (
        <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="text-success w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-textPrimary">Salary Insights</h3>
                        <p className="text-sm text-textSecondary">
                            Estimated range based on job requirements & resume
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-textSecondary">Confidence</span>
                    <span className={`text-sm font-medium ${confidence >= 70 ? 'text-success' : confidence >= 50 ? 'text-warning' : 'text-error'}`}>
                        {confidence}%
                    </span>
                </div>
            </div>

            {/* Salary Range Display */}
            <div className="bg-gradient-to-r from-success/5 via-success/10 to-success/5 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-xs text-textSecondary mb-1">Low</p>
                        <p className="text-xl font-bold text-textPrimary">{formatSalary(range.min)}</p>
                    </div>

                    {/* Visual Range Bar */}
                    <div className="flex-1 mx-6">
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-warning via-success to-accent rounded-full"
                                style={{ width: '100%' }}
                            />
                            {/* Marker for mid-point */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-success rounded-full shadow-md"
                                style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-xs text-success font-medium">Market Mid-Point</p>
                            <p className="text-2xl font-bold text-success">{formatSalary(range.mid)}</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-textSecondary mb-1">High</p>
                        <p className="text-xl font-bold text-textPrimary">{formatSalary(range.max)}</p>
                    </div>
                </div>
            </div>

            {/* Toggle Details */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-2 text-sm text-accent hover:text-accent/80 py-2"
            >
                {showDetails ? (
                    <>
                        <FiChevronUp /> Hide factors
                    </>
                ) : (
                    <>
                        <FiChevronDown /> Show factors affecting estimate
                    </>
                )}
            </button>

            {/* Detailed Factors */}
            {showDetails && (
                <div className="mt-4 space-y-4">
                    {/* Factors Grid */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                            <FiTarget className="text-accent" />
                            Factors Affecting Your Estimate
                        </h4>
                        <div className="space-y-2">
                            {factors.map((factor, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-textPrimary">{factor.factor}</p>
                                        <p className="text-xs text-textSecondary">{factor.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-textPrimary">{factor.value}</span>
                                        <span className={`text-lg ${getImpactColor(factor.impact)}`}>
                                            {getImpactIcon(factor.impact)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    {tips && tips.length > 0 && (
                        <div className="p-4 bg-accent/5 rounded-lg">
                            <h4 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                                <FiTrendingUp />
                                Tips to Maximize Your Offer
                            </h4>
                            <ul className="text-sm text-textSecondary space-y-1">
                                {tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-accent mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Disclaimer */}
                    {disclaimer && (
                        <div className="flex items-start gap-2 p-3 bg-warning/5 rounded-lg text-xs text-textSecondary">
                            <FiAlertCircle className="text-warning mt-0.5 flex-shrink-0" />
                            <p>{disclaimer}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SalaryInsights;
