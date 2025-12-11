import React, { useState } from 'react';
import {
    FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiSearch,
    FiDownload, FiUpload, FiAward, FiFolder, FiTrendingUp,
    FiUsers, FiCode, FiMoreHorizontal
} from 'react-icons/fi';
import useAchievementBank from '../hooks/useAchievementBank';

/**
 * AchievementBank - UI component for managing stored achievements
 * Accessible as a modal/sidebar from the main workflow
 */
function AchievementBank({ isOpen, onClose, onSelectAchievement }) {
    const {
        achievements,
        categories,
        stats,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        searchAchievements,
        exportAchievements,
        importAchievements,
    } = useAchievementBank();

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        category: 'projects',
        title: '',
        description: '',
        metrics: '',
        skills: '',
        date: '',
    });

    // Category icons and colors
    const categoryConfig = {
        projects: { icon: FiFolder, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        metrics: { icon: FiTrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        leadership: { icon: FiUsers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        technical: { icon: FiCode, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        other: { icon: FiMoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    };

    // Filter achievements
    const filteredAchievements = (() => {
        let filtered = activeCategory === 'all'
            ? achievements
            : achievements.filter(a => a.category === activeCategory);

        if (searchQuery.trim()) {
            filtered = searchAchievements(searchQuery).filter(a =>
                activeCategory === 'all' || a.category === activeCategory
            );
        }

        return filtered;
    })();

    const resetForm = () => {
        setFormData({
            category: 'projects',
            title: '',
            description: '',
            metrics: '',
            skills: '',
            date: '',
        });
        setShowAddForm(false);
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const achievementData = {
            ...formData,
            metrics: formData.metrics.split(',').map(m => m.trim()).filter(Boolean),
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        };

        if (editingId) {
            updateAchievement(editingId, achievementData);
        } else {
            addAchievement(achievementData);
        }

        resetForm();
    };

    const handleEdit = (achievement) => {
        setFormData({
            category: achievement.category,
            title: achievement.title,
            description: achievement.description,
            metrics: achievement.metrics.join(', '),
            skills: achievement.skills.join(', '),
            date: achievement.date || '',
        });
        setEditingId(achievement.id);
        setShowAddForm(true);
    };

    const handleExport = () => {
        const jsonString = exportAchievements();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'achievement_bank.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = importAchievements(event.target.result);
            if (result.success) {
                alert(`Successfully imported ${result.count} achievements!`);
            } else {
                alert(`Import failed: ${result.error}`);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full overflow-hidden flex flex-col shadow-xl">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                            <FiAward className="text-accent w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-textPrimary">Achievement Bank</h2>
                            <p className="text-sm text-textSecondary">{stats.total} achievements stored</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-hover rounded-lg transition-colors">
                        <FiX className="w-5 h-5 text-textSecondary" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-border space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                        <input
                            type="text"
                            placeholder="Search achievements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn-cta text-sm flex items-center gap-2"
                            >
                                <FiPlus /> Add Achievement
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <label className="btn-primary text-sm flex items-center gap-2 cursor-pointer">
                                <FiUpload /> Import
                                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                            </label>
                            <button onClick={handleExport} className="btn-primary text-sm flex items-center gap-2">
                                <FiDownload /> Export
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${activeCategory === 'all'
                                    ? 'bg-accent text-white'
                                    : 'bg-hover text-textSecondary hover:text-textPrimary'
                                }`}
                        >
                            All ({stats.total})
                        </button>
                        {categories.map(cat => {
                            const config = categoryConfig[cat];
                            const Icon = config.icon;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeCategory === cat
                                            ? 'bg-accent text-white'
                                            : 'bg-hover text-textSecondary hover:text-textPrimary'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)} ({stats.byCategory[cat]})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="p-4 border-b border-border bg-accent/5">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-textPrimary">
                                    {editingId ? 'Edit Achievement' : 'Add New Achievement'}
                                </h3>
                                <button type="button" onClick={resetForm} className="text-textSecondary hover:text-textPrimary">
                                    <FiX />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Date (e.g., 2023)"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Achievement Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field"
                                required
                            />

                            <textarea
                                placeholder="Description - What did you do and what was the impact?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field min-h-[80px]"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Metrics (comma-separated, e.g., Increased revenue 25%, Saved $50K)"
                                value={formData.metrics}
                                onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                                className="input-field"
                            />

                            <input
                                type="text"
                                placeholder="Related Skills (comma-separated, e.g., React, Node.js, Leadership)"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                className="input-field"
                            />

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={resetForm} className="btn-primary text-sm">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-cta text-sm flex items-center gap-2">
                                    <FiSave /> {editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Achievements List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredAchievements.length === 0 ? (
                        <div className="text-center py-12">
                            <FiAward className="w-12 h-12 text-textSecondary mx-auto mb-4" />
                            <p className="text-textSecondary">
                                {searchQuery ? 'No achievements match your search' : 'No achievements yet'}
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-4 text-accent hover:underline text-sm"
                            >
                                Add your first achievement
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAchievements.map(achievement => {
                                const config = categoryConfig[achievement.category] || categoryConfig.other;
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={achievement.id}
                                        className="p-4 border border-border rounded-lg hover:border-accent/50 transition-colors bg-white"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`p-1.5 rounded ${config.bg}`}>
                                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                                    </span>
                                                    <h4 className="font-medium text-textPrimary">{achievement.title}</h4>
                                                    {achievement.date && (
                                                        <span className="text-xs text-textSecondary">({achievement.date})</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-textSecondary mb-2">{achievement.description}</p>

                                                {achievement.metrics.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {achievement.metrics.map((metric, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded">
                                                                {metric}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {achievement.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {achievement.skills.map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-hover text-textSecondary text-xs rounded">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {onSelectAchievement && (
                                                    <button
                                                        onClick={() => onSelectAchievement(achievement)}
                                                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                        title="Use in resume"
                                                    >
                                                        <FiPlus className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(achievement)}
                                                    className="p-2 text-textSecondary hover:bg-hover rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this achievement?')) {
                                                            deleteAchievement(achievement.id);
                                                        }
                                                    }}
                                                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AchievementBank;
