/**
 * Storage Utility for Human Reaction Benchmark Tool
 * Manages persistent storage of user data, test results, and application state
 */

class StorageManager {
    constructor() {
        this.prefix = "hrb_"; // Human Reaction Benchmark prefix
        this.version = "1.0.0";
        this.isStorageAvailable = this.checkStorageAvailability();

        this.keys = {
            USER_STATS: "user_stats",
            TEST_RESULTS: "test_results",
            PREFERENCES: "preferences",
            SESSION_DATA: "session_data",
        };

        this.initialize();
    }

    /**
     * Check if localStorage is available
     */
    checkStorageAvailability() {
        try {
            const test = "__storage_test__";
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.warn("localStorage not available, using fallback storage", error);
            }
            return false;
        }
    }

    /**
     * Initialize storage with default values
     */
    initialize() {
        if (!this.isStorageAvailable) {
            this.fallbackStorage = {};
            return;
        }

        // Initialize default user stats if not exists
        if (!this.get(this.keys.USER_STATS)) {
            this.set(this.keys.USER_STATS, {
                totalTests: 0,
                averageReactionTime: 0,
                bestReactionTime: null,
                testsByType: {
                    visual: 0,
                    audio: 0,
                    choice: 0,
                },
                streaks: {
                    current: 0,
                    best: 0,
                },
                achievements: [],
                createdAt: new Date().toISOString(),
                version: this.version,
            });
        }

        // Initialize preferences if not exists
        if (!this.get(this.keys.PREFERENCES)) {
            this.set(this.keys.PREFERENCES, {
                soundEnabled: true,
                animationsEnabled: true,
                testCount: 5,
                debugMode: false,
                theme: "default",
                version: this.version,
            });
        }

        // Initialize test results array if not exists
        if (!this.get(this.keys.TEST_RESULTS)) {
            this.set(this.keys.TEST_RESULTS, []);
        }
    }

    /**
     * Get data from storage
     */
    get(key, useSession = false) {
        try {
            const fullKey = this.prefix + key;
            const storage = useSession ? sessionStorage : localStorage;

            if (!this.isStorageAvailable) {
                return this.fallbackStorage[fullKey] || null;
            }

            const data = storage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            if (window.logger) {
                window.logger.error(`Error getting data for key: ${key}`, error);
            }
            return null;
        }
    }

    /**
     * Set data in storage
     */
    set(key, value, useSession = false) {
        try {
            const fullKey = this.prefix + key;
            const storage = useSession ? sessionStorage : localStorage;

            if (!this.isStorageAvailable) {
                this.fallbackStorage[fullKey] = value;
                return true;
            }

            storage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error(`Error saving data for key: ${key}`, error);
            }
            return false;
        }
    }

    /**
     * Remove data from storage
     */
    remove(key, useSession = false) {
        try {
            const fullKey = this.prefix + key;
            const storage = useSession ? sessionStorage : localStorage;

            if (!this.isStorageAvailable) {
                delete this.fallbackStorage[fullKey];
                return true;
            }

            storage.removeItem(fullKey);
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error(`Error removing data for key: ${key}`, error);
            }
            return false;
        }
    }

    /**
     * Save test result
     */
    saveTestResult(testResult) {
        try {
            const results = this.get(this.keys.TEST_RESULTS) || [];

            // Add timestamp and unique ID
            testResult.id = this.generateId();
            testResult.timestamp = new Date().toISOString();

            results.push(testResult);

            // Keep only last 1000 results to prevent storage overflow
            if (results.length > 1000) {
                results.splice(0, results.length - 1000);
            }

            this.set(this.keys.TEST_RESULTS, results);
            this.updateUserStats(testResult);

            if (window.logger) {
                window.logger.info("Test result saved", testResult);
            }
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error("Error saving test result", error);
            }
            return false;
        }
    }

    /**
     * Update user statistics
     */
    updateUserStats(testResult) {
        try {
            const stats = this.get(this.keys.USER_STATS);

            // Update total tests
            stats.totalTests++;
            stats.testsByType[testResult.type]++;

            // Update reaction times
            const allResults = this.get(this.keys.TEST_RESULTS) || [];
            const validTimes = allResults
                .filter((result) => result.reactionTime > 0)
                .map((result) => result.reactionTime);

            if (validTimes.length > 0) {
                stats.averageReactionTime =
                    validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
                stats.bestReactionTime = Math.min(...validTimes);
            }

            // Update streaks
            if (testResult.reactionTime > 0 && testResult.reactionTime < 1000) {
                stats.streaks.current++;
                stats.streaks.best = Math.max(stats.streaks.best, stats.streaks.current);
            } else {
                stats.streaks.current = 0;
            }

            // Check for achievements
            this.checkAchievements(stats, testResult);

            stats.lastUpdated = new Date().toISOString();
            this.set(this.keys.USER_STATS, stats);
        } catch (error) {
            if (window.logger) {
                window.logger.error("Error updating user stats", error);
            }
        }
    }

    /**
     * Check and award achievements
     */
    checkAchievements(stats, testResult) {
        const achievements = [];

        // First test achievement
        if (stats.totalTests === 1) {
            achievements.push({
                id: "first_test",
                name: "First Steps",
                description: "Complete your first reaction test",
                unlockedAt: new Date().toISOString(),
            });
        }

        // Speed achievements
        if (testResult.reactionTime < 200 && testResult.reactionTime > 0) {
            achievements.push({
                id: "lightning_fast",
                name: "Lightning Fast",
                description: "React in under 200ms",
                unlockedAt: new Date().toISOString(),
            });
        }

        // Consistency achievements
        if (stats.streaks.current === 10) {
            achievements.push({
                id: "consistent",
                name: "Consistent Performer",
                description: "Complete 10 successful tests in a row",
                unlockedAt: new Date().toISOString(),
            });
        }

        // Add new achievements to stats
        achievements.forEach((achievement) => {
            if (!stats.achievements.find((a) => a.id === achievement.id)) {
                stats.achievements.push(achievement);
                if (window.logger) {
                    window.logger.info("Achievement unlocked", achievement);
                }
            }
        });
    }

    /**
     * Get user statistics
     */
    getUserStats() {
        return this.get(this.keys.USER_STATS);
    }

    /**
     * Get test results with filtering options
     */
    getTestResults(options = {}) {
        const results = this.get(this.keys.TEST_RESULTS) || [];
        let filteredResults = results;

        // Filter by test type
        if (options.type) {
            filteredResults = filteredResults.filter((r) => r.type === options.type);
        }

        // Filter by date range
        if (options.startDate) {
            filteredResults = filteredResults.filter(
                (r) => new Date(r.timestamp) >= new Date(options.startDate),
            );
        }

        if (options.endDate) {
            filteredResults = filteredResults.filter(
                (r) => new Date(r.timestamp) <= new Date(options.endDate),
            );
        }

        // Limit results
        if (options.limit) {
            filteredResults = filteredResults.slice(-options.limit);
        }

        return filteredResults;
    }

    /**
     * Get user preferences
     */
    getPreferences() {
        return this.get(this.keys.PREFERENCES);
    }

    /**
     * Update user preferences
     */
    updatePreferences(newPreferences) {
        const current = this.get(this.keys.PREFERENCES);
        const updated = { ...current, ...newPreferences };
        this.set(this.keys.PREFERENCES, updated);
        return updated;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Clear all user data
     */
    clearAllData() {
        if (confirm("This will permanently delete all your data. Are you sure?")) {
            Object.values(this.keys).forEach((key) => {
                this.remove(key);
            });

            // Re-initialize with defaults
            this.initialize();

            if (window.logger) {
                window.logger.info("All user data cleared");
            }
            return true;
        }
        return false;
    }
}

// Create global storage manager instance
const storage = new StorageManager();

// Export for use in other modules
window.storage = storage;
