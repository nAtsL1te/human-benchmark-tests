/**
 * Logger Utility for Human Reaction Benchmark Tool
 * Provides comprehensive logging capabilities with different levels and output targets
 */

class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3,
            TRACE: 4,
        };

        this.currentLevel = this.levels.DEBUG;
        this.enableConsole = true;
        this.enableDebugPanel = true;
        this.logs = [];
        this.maxLogs = 100;

        this.initializeDebugPanel();
    }

    /**
     * Initialize the debug panel for development
     */
    initializeDebugPanel() {
        // Show debug panel in development mode
        if (this.isDevelopment()) {
            const debugPanel = document.getElementById("debug-panel");
            if (debugPanel) {
                debugPanel.classList.remove("hidden");
            }
        }
    }

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.search.includes("debug=true")
        );
    }

    /**
     * Log an error message
     */
    error(message, data = null) {
        this.log(this.levels.ERROR, "ERROR", message, data);
    }

    /**
     * Log a warning message
     */
    warn(message, data = null) {
        this.log(this.levels.WARN, "WARN", message, data);
    }

    /**
     * Log an info message
     */
    info(message, data = null) {
        this.log(this.levels.INFO, "INFO", message, data);
    }

    /**
     * Log a debug message
     */
    debug(message, data = null) {
        this.log(this.levels.DEBUG, "DEBUG", message, data);
    }

    /**
     * Log a trace message
     */
    trace(message, data = null) {
        this.log(this.levels.TRACE, "TRACE", message, data);
    }

    /**
     * Core logging method
     */
    log(level, levelName, message, data = null) {
        if (level > this.currentLevel) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: levelName,
            message,
            data,
        };

        // Add to logs array
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output
        if (this.enableConsole) {
            this.logToConsole(levelName, message, data, timestamp);
        }

        // Debug panel output
        if (this.enableDebugPanel && this.isDevelopment()) {
            this.logToDebugPanel(levelName, message, timestamp);
        }
    }

    /**
     * Log to browser console
     */
    logToConsole(level, message, data, timestamp) {
        const prefix = `[${timestamp}] [${level}]`;

        switch (level) {
            case "ERROR":
                console.error(prefix, message, data);
                break;
            case "WARN":
                console.warn(prefix, message, data);
                break;
            case "INFO":
                console.info(prefix, message, data);
                break;
            case "DEBUG":
                console.debug(prefix, message, data);
                break;
            case "TRACE":
                console.trace(prefix, message, data);
                break;
            default:
                console.log(prefix, message, data);
        }
    }

    /**
     * Log to debug panel
     */
    logToDebugPanel(level, message, timestamp) {
        const debugLog = document.getElementById("debug-log");
        if (!debugLog) return;

        const logElement = document.createElement("div");
        logElement.className = `text-xs ${this.getLevelColor(level)}`;
        logElement.innerHTML = `
            <span class="opacity-60">[${timestamp.split("T")[1].split(".")[0]}]</span>
            <span class="font-semibold">[${level}]</span>
            <span>${message}</span>
        `;

        debugLog.appendChild(logElement);
        debugLog.scrollTop = debugLog.scrollHeight;
    }

    /**
     * Get color class for log level
     */
    getLevelColor(level) {
        switch (level) {
            case "ERROR":
                return "text-red-400";
            case "WARN":
                return "text-yellow-400";
            case "INFO":
                return "text-blue-400";
            case "DEBUG":
                return "text-green-400";
            case "TRACE":
                return "text-purple-400";
            default:
                return "text-gray-400";
        }
    }

    /**
     * Performance logging
     */
    performance(label, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.info(`Performance: ${label} took ${duration.toFixed(2)}ms`);
        return duration;
    }

    /**
     * Start performance timing
     */
    startTiming(label) {
        const startTime = performance.now();
        this.debug(`Starting timing: ${label}`);
        return startTime;
    }

    /**
     * Event logging
     */
    event(eventName, eventData = null) {
        this.info(`Event: ${eventName}`, eventData);
    }

    /**
     * User interaction logging
     */
    userInteraction(action, element, data = null) {
        this.debug(`User Interaction: ${action} on ${element}`, data);
    }

    /**
     * Error tracking with stack trace
     */
    trackError(error, context = null) {
        this.error(`Error: ${error.message}`, {
            stack: error.stack,
            context: context,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Get all logs
     */
    getAllLogs() {
        return this.logs;
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        const debugLog = document.getElementById("debug-log");
        if (debugLog) {
            debugLog.innerHTML = "";
        }
        this.info("Logs cleared");
    }

    /**
     * Export logs as JSON
     */
    exportLogs() {
        const logsData = {
            exportTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            logs: this.logs,
        };

        const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reaction-benchmark-logs-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.info("Logs exported successfully");
    }

    /**
     * Set log level
     */
    setLevel(level) {
        if (typeof level === "string") {
            level = this.levels[level.toUpperCase()];
        }

        if (level !== undefined) {
            this.currentLevel = level;
            this.info(
                `Log level set to: ${Object.keys(this.levels).find(
                    (key) => this.levels[key] === level,
                )}`,
            );
        }
    }
}

// Create global logger instance
const logger = new Logger();

// Global functions for debug panel
window.clearDebugLog = function () {
    logger.clearLogs();
};

window.exportLogs = function () {
    logger.exportLogs();
};

// Export logger for use in other modules
window.logger = logger;

// Log initialization
logger.info("Logger initialized successfully");
