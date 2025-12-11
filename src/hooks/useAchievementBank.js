import { useState, useEffect, useCallback } from 'react';

/**
 * Achievement Bank Hook
 * Manages user achievements stored in localStorage for reuse across job applications
 * 
 * Schema:
 * {
 *   achievements: [
 *     {
 *       id: string (uuid),
 *       category: 'projects' | 'metrics' | 'leadership' | 'technical' | 'other',
 *       title: string,
 *       description: string,
 *       metrics: string[] (e.g., ["Increased revenue by 25%", "Reduced costs by $50K"]),
 *       skills: string[] (related skills),
 *       date: string (when achieved),
 *       createdAt: string (ISO date),
 *       updatedAt: string (ISO date)
 *     }
 *   ],
 *   lastUpdated: string (ISO date)
 * }
 */

const STORAGE_KEY = 'resumeai_achievement_bank';

const DEFAULT_CATEGORIES = ['projects', 'metrics', 'leadership', 'technical', 'other'];

const generateId = () => {
    return `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getInitialState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                achievements: parsed.achievements || [],
                lastUpdated: parsed.lastUpdated || null,
            };
        }
    } catch (error) {
        console.error('Error loading achievement bank:', error);
    }
    return { achievements: [], lastUpdated: null };
};

/**
 * Custom hook for managing the achievement bank
 * @returns {Object} Achievement bank state and methods
 */
function useAchievementBank() {
    const [achievements, setAchievements] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const { achievements: storedAchievements, lastUpdated: storedLastUpdated } = getInitialState();
        setAchievements(storedAchievements);
        setLastUpdated(storedLastUpdated);
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever achievements change
    useEffect(() => {
        if (isLoaded) {
            try {
                const data = {
                    achievements,
                    lastUpdated: new Date().toISOString(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                setLastUpdated(data.lastUpdated);
            } catch (error) {
                console.error('Error saving achievement bank:', error);
            }
        }
    }, [achievements, isLoaded]);

    /**
     * Add a new achievement
     * @param {Object} achievement - Achievement data
     * @returns {Object} The created achievement with ID
     */
    const addAchievement = useCallback((achievement) => {
        const newAchievement = {
            id: generateId(),
            category: achievement.category || 'other',
            title: achievement.title || '',
            description: achievement.description || '',
            metrics: achievement.metrics || [],
            skills: achievement.skills || [],
            date: achievement.date || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setAchievements(prev => [...prev, newAchievement]);
        return newAchievement;
    }, []);

    /**
     * Update an existing achievement
     * @param {string} id - Achievement ID
     * @param {Object} updates - Fields to update
     */
    const updateAchievement = useCallback((id, updates) => {
        setAchievements(prev => prev.map(ach => {
            if (ach.id === id) {
                return {
                    ...ach,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };
            }
            return ach;
        }));
    }, []);

    /**
     * Delete an achievement
     * @param {string} id - Achievement ID
     */
    const deleteAchievement = useCallback((id) => {
        setAchievements(prev => prev.filter(ach => ach.id !== id));
    }, []);

    /**
     * Get achievements by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered achievements
     */
    const getByCategory = useCallback((category) => {
        return achievements.filter(ach => ach.category === category);
    }, [achievements]);

    /**
     * Search achievements by keyword
     * @param {string} query - Search query
     * @returns {Array} Matching achievements
     */
    const searchAchievements = useCallback((query) => {
        if (!query || query.trim() === '') {
            return achievements;
        }

        const queryLower = query.toLowerCase();
        return achievements.filter(ach => {
            return (
                ach.title.toLowerCase().includes(queryLower) ||
                ach.description.toLowerCase().includes(queryLower) ||
                ach.metrics.some(m => m.toLowerCase().includes(queryLower)) ||
                ach.skills.some(s => s.toLowerCase().includes(queryLower))
            );
        });
    }, [achievements]);

    /**
     * Get achievements matching specific skills
     * @param {Array} skills - Skills to match
     * @returns {Array} Matching achievements sorted by relevance
     */
    const getMatchingAchievements = useCallback((skills) => {
        if (!skills || skills.length === 0) {
            return achievements;
        }

        const skillsLower = skills.map(s => s.toLowerCase());

        return achievements
            .map(ach => {
                const matchCount = ach.skills.filter(s =>
                    skillsLower.includes(s.toLowerCase())
                ).length;

                // Also check description for skill mentions
                const descMatches = skillsLower.filter(s =>
                    ach.description.toLowerCase().includes(s)
                ).length;

                return {
                    ...ach,
                    relevanceScore: matchCount * 2 + descMatches,
                };
            })
            .filter(ach => ach.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }, [achievements]);

    /**
     * Format achievement for resume use
     * @param {Object} achievement - Achievement to format
     * @returns {string} Formatted string for resume
     */
    const formatForResume = useCallback((achievement) => {
        let result = achievement.description;

        if (achievement.metrics && achievement.metrics.length > 0) {
            result += ` (${achievement.metrics.join(', ')})`;
        }

        return result;
    }, []);

    /**
     * Import achievements from JSON
     * @param {string} jsonString - JSON string to import
     */
    const importAchievements = useCallback((jsonString) => {
        try {
            const imported = JSON.parse(jsonString);
            const importedAchievements = Array.isArray(imported)
                ? imported
                : imported.achievements || [];

            const newAchievements = importedAchievements.map(ach => ({
                ...ach,
                id: generateId(),
                createdAt: ach.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));

            setAchievements(prev => [...prev, ...newAchievements]);
            return { success: true, count: newAchievements.length };
        } catch (error) {
            console.error('Error importing achievements:', error);
            return { success: false, error: error.message };
        }
    }, []);

    /**
     * Export achievements to JSON
     * @returns {string} JSON string of achievements
     */
    const exportAchievements = useCallback(() => {
        return JSON.stringify({ achievements, exportedAt: new Date().toISOString() }, null, 2);
    }, [achievements]);

    /**
     * Clear all achievements
     */
    const clearAll = useCallback(() => {
        setAchievements([]);
    }, []);

    return {
        // State
        achievements,
        lastUpdated,
        isLoaded,
        categories: DEFAULT_CATEGORIES,

        // CRUD operations
        addAchievement,
        updateAchievement,
        deleteAchievement,

        // Query functions
        getByCategory,
        searchAchievements,
        getMatchingAchievements,

        // Utilities
        formatForResume,
        importAchievements,
        exportAchievements,
        clearAll,

        // Stats
        stats: {
            total: achievements.length,
            byCategory: DEFAULT_CATEGORIES.reduce((acc, cat) => {
                acc[cat] = achievements.filter(a => a.category === cat).length;
                return acc;
            }, {}),
        },
    };
}

export default useAchievementBank;
