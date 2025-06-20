/**
 * Animation Utility for Human Reaction Benchmark Tool
 * Handles all animations using Motion.dev (Framer Motion) for smooth UI interactions
 */

class AnimationManager {
    constructor() {
        this.isMotionAvailable = typeof Motion !== "undefined";
        this.animationsEnabled = true;
        this.currentAnimations = new Map();

        this.initialize();
    }

    initialize() {
        if (!this.isMotionAvailable) {
            console.warn("Motion.dev not loaded, using fallback animations");
        }

        if (window.storage) {
            const preferences = window.storage.getPreferences();
            this.animationsEnabled = preferences?.animationsEnabled !== false;
        }

        this.setupGlobalAnimations();
    }

    setupGlobalAnimations() {
        const style = document.createElement("style");
        style.textContent = `
            @keyframes slideInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideInDown {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .animate-slide-up { animation: slideInUp 0.5s ease-out; }
            .animate-slide-down { animation: slideInDown 0.5s ease-out; }
            .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            .animate-fade-out { animation: fadeOut 0.3s ease-out; }
            .animate-scale-in { animation: scaleIn 0.3s ease-out; }
            .animate-shake { animation: shake 0.5s ease-in-out; }
        `;
        document.head.appendChild(style);
    }

    animateIn(element, type = "fadeIn", options = {}) {
        if (!this.animationsEnabled || !element) return Promise.resolve();

        return new Promise((resolve) => {
            this.animateWithCSS(element, type, options, resolve);
        });
    }

    animateOut(element, type = "fadeOut", options = {}) {
        if (!this.animationsEnabled || !element) return Promise.resolve();

        return new Promise((resolve) => {
            this.animateWithCSS(element, type, options, resolve);
        });
    }

    animateWithCSS(element, type, options, callback) {
        const cssClasses = {
            fadeIn: "animate-fade-in",
            fadeOut: "animate-fade-out",
            slideUp: "animate-slide-up",
            slideDown: "animate-slide-down",
            scaleIn: "animate-scale-in",
            shake: "animate-shake",
        };

        const className = cssClasses[type] || cssClasses.fadeIn;
        element.classList.add(className);

        const duration = options.duration || 500;

        setTimeout(() => {
            element.classList.remove(className);
            if (callback) callback();
        }, duration);
    }

    animateReactionArea(element, state) {
        if (!element) return;

        const animations = {
            ready: () => {
                element.className = "reaction-area test-ready";
                this.animateIn(element, "scaleIn");
            },
            waiting: () => {
                element.className = "reaction-area test-waiting animate-pulse";
            },
            active: () => {
                element.className = "reaction-area test-active";
            },
            complete: () => {
                element.className = "reaction-area test-complete";
                this.animateIn(element, "fadeIn");
            },
            error: () => {
                element.classList.add("animate-shake");
                setTimeout(() => {
                    element.classList.remove("animate-shake");
                }, 500);
            },
        };

        if (animations[state]) {
            animations[state]();
        }
    }

    animateSection(fromSection, toSection) {
        if (!this.animationsEnabled) {
            if (fromSection) fromSection.classList.add("hidden");
            if (toSection) toSection.classList.remove("hidden");
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            if (fromSection) {
                this.animateOut(fromSection, "fadeOut").then(() => {
                    fromSection.classList.add("hidden");

                    if (toSection) {
                        toSection.classList.remove("hidden");
                        this.animateIn(toSection, "slideUp").then(resolve);
                    } else {
                        resolve();
                    }
                });
            } else if (toSection) {
                toSection.classList.remove("hidden");
                this.animateIn(toSection, "slideUp").then(resolve);
            } else {
                resolve();
            }
        });
    }

    setAnimationsEnabled(enabled) {
        this.animationsEnabled = enabled;

        if (window.storage) {
            const preferences = window.storage.getPreferences();
            window.storage.updatePreferences({
                ...preferences,
                animationsEnabled: enabled,
            });
        }
    }
}

const animations = new AnimationManager();
window.animations = animations;
