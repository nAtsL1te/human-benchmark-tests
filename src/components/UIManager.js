/**
 * UIManager for Human Reaction Benchmark Tool
 * Handles all UI interactions, navigation, and interface management
 */

class UIManager {
    constructor() {
        this.currentSection = "home";
        this.isInitialized = false;

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupGlobalFunctions();
        this.hideLoadingScreen();

        this.isInitialized = true;

        if (window.logger) {
            window.logger.info("UIManager initialized");
        }
    }

    setupEventListeners() {
        // Mobile menu toggle
        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-mobile-menu-toggle]")) {
                this.toggleMobileMenu();
            }
        });

        // Section navigation
        document.addEventListener("click", (e) => {
            const sectionButton = e.target.closest("[data-section]");
            if (sectionButton) {
                const section = sectionButton.getAttribute("data-section");
                this.showSection(section);
            }
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case "1":
                        e.preventDefault();
                        this.showSection("home");
                        break;
                    case "2":
                        e.preventDefault();
                        this.showSection("tests");
                        break;
                    case "3":
                        e.preventDefault();
                        this.showSection("results");
                        break;
                    case "4":
                        e.preventDefault();
                        this.showSection("about");
                        break;
                }
            }

            if (e.key === "Escape") {
                this.handleEscape();
            }
        });

        // Window resize handler
        window.addEventListener("resize", () => {
            this.handleResize();
        });

        // Accessibility improvements
        this.setupAccessibility();
    }

    setupAccessibility() {
        // Add focus management
        document.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                this.manageFocus(e);
            }
        });

        // Add ARIA labels and roles where needed
        this.enhanceAccessibility();
    }

    enhanceAccessibility() {
        // Add skip link
        const skipLink = document.createElement("a");
        skipLink.href = "#main-content";
        skipLink.textContent = "Skip to main content";
        skipLink.className =
            "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50";
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main landmark
        const main = document.querySelector("main");
        if (main) {
            main.id = "main-content";
            main.setAttribute("role", "main");
        }

        // Enhance navigation
        const nav = document.querySelector("nav");
        if (nav) {
            nav.setAttribute("role", "navigation");
            nav.setAttribute("aria-label", "Main navigation");
        }
    }

    setupGlobalFunctions() {
        // Expose functions globally for HTML onclick handlers
        window.showSection = (section) => this.showSection(section);
        window.toggleMobileMenu = () => this.toggleMobileMenu();
        window.startTest = (type) => this.startTest(type);
        window.restartTest = () => this.restartTest();
        window.backToSelection = () => this.backToSelection();
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) {
            setTimeout(() => {
                if (window.animations) {
                    window.animations.animateOut(loadingScreen, "fadeOut").then(() => {
                        loadingScreen.remove();
                    });
                } else {
                    loadingScreen.remove();
                }
            }, 1000); // Show loading for at least 1 second
        }
    }

    showSection(sectionName) {
        if (this.currentSection === sectionName) return;

        const currentElement = document.getElementById(`${this.currentSection}-section`);
        const newElement = document.getElementById(`${sectionName}-section`);

        if (!newElement) {
            if (window.logger) {
                window.logger.warn(`Section not found: ${sectionName}`);
            }
            return;
        }

        // Update active navigation
        this.updateNavigation(sectionName);

        // Animate section transition
        if (window.animations) {
            window.animations.animateSection(currentElement, newElement).then(() => {
                this.onSectionChanged(sectionName);
            });
        } else {
            if (currentElement) currentElement.classList.add("hidden");
            newElement.classList.remove("hidden");
            this.onSectionChanged(sectionName);
        }

        this.currentSection = sectionName;

        // Close mobile menu if open
        this.closeMobileMenu();

        if (window.logger) {
            window.logger.info(`Navigated to section: ${sectionName}`);
        }
    }

    updateNavigation(activeSection) {
        // Update desktop navigation
        const navButtons = document.querySelectorAll("nav button, #mobile-menu button");
        navButtons.forEach((button) => {
            button.classList.remove("text-purple-200");
            if (button.onclick && button.onclick.toString().includes(activeSection)) {
                button.classList.add("text-purple-200");
            }
        });
    }

    onSectionChanged(sectionName) {
        switch (sectionName) {
            case "results":
                if (window.resultsManager) {
                    window.resultsManager.updateDisplay();
                }
                break;
            case "tests":
                this.resetTestUI();
                break;
        }

        // Update document title
        const titles = {
            home: "Human Reaction Benchmark Test Tool",
            tests: "Reaction Tests - Human Reaction Benchmark",
            results: "Your Results - Human Reaction Benchmark",
            about: "About - Human Reaction Benchmark",
        };

        document.title = titles[sectionName] || titles.home;
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu) {
            mobileMenu.classList.toggle("hidden");
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu) {
            mobileMenu.classList.add("hidden");
        }
    }

    startTest(testType) {
        if (window.testEngine) {
            try {
                window.testEngine.startTest(testType);

                if (window.logger) {
                    window.logger.userInteraction("start_test", testType);
                }
            } catch (error) {
                this.showError("Failed to start test: " + error.message);

                if (window.logger) {
                    window.logger.trackError(error, "startTest");
                }
            }
        }
    }

    restartTest() {
        if (window.testEngine) {
            window.testEngine.restartTest();

            if (window.logger) {
                window.logger.userInteraction("restart_test", "button");
            }
        }
    }

    backToSelection() {
        const testSelection = document.getElementById("test-selection");
        const testArena = document.getElementById("test-arena");

        if (testSelection && testArena) {
            if (window.animations) {
                window.animations.animateOut(testArena, "fadeOut").then(() => {
                    testArena.classList.add("hidden");
                    testSelection.classList.remove("hidden");
                    window.animations.animateIn(testSelection, "slideUp");
                });
            } else {
                testArena.classList.add("hidden");
                testSelection.classList.remove("hidden");
            }
        }

        // Stop current test
        if (window.testEngine) {
            window.testEngine.stopTest();
        }

        if (window.logger) {
            window.logger.userInteraction("back_to_selection", "button");
        }
    }

    resetTestUI() {
        const testSelection = document.getElementById("test-selection");
        const testArena = document.getElementById("test-arena");
        const testResults = document.getElementById("test-results");
        const reactionArea = document.getElementById("reaction-area");

        if (testSelection) testSelection.classList.remove("hidden");
        if (testArena) testArena.classList.add("hidden");
        if (testResults) testResults.classList.add("hidden");

        if (reactionArea) {
            reactionArea.style.display = "flex";
            reactionArea.className = "reaction-area test-ready";
            reactionArea.textContent = "Click to Start";
        }

        // Stop any running tests
        if (window.testEngine) {
            window.testEngine.stopTest();
        }
    }

    showError(message) {
        this.showNotification(message, "error");
    }

    showSuccess(message) {
        this.showNotification(message, "success");
    }

    showInfo(message) {
        this.showNotification(message, "info");
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${this.getNotificationClasses(
            type,
        )}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="text-lg">${this.getNotificationIcon(type)}</span>
                    <span>${message}</span>
                </div>
                <button class="ml-2 opacity-60 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
                    ✕
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                if (window.animations) {
                    window.animations.animateOut(notification, "fadeOut").then(() => {
                        notification.remove();
                    });
                } else {
                    notification.remove();
                }
            }
        }, 5000);

        // Animate in
        if (window.animations) {
            window.animations.animateIn(notification, "slideDown");
        }
    }

    getNotificationClasses(type) {
        const classes = {
            error: "bg-red-500 text-white",
            success: "bg-green-500 text-white",
            warning: "bg-yellow-500 text-white",
            info: "bg-blue-500 text-white",
        };

        return classes[type] || classes.info;
    }

    getNotificationIcon(type) {
        const icons = {
            error: "❌",
            success: "✅",
            warning: "⚠️",
            info: "ℹ️",
        };

        return icons[type] || icons.info;
    }

    handleEscape() {
        // Close mobile menu
        this.closeMobileMenu();

        // Stop any running tests
        if (window.testEngine && window.testEngine.testState !== "idle") {
            this.backToSelection();
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768) {
            this.closeMobileMenu();
        }

        // Update charts if visible
        if (this.currentSection === "results" && window.resultsManager) {
            setTimeout(() => {
                window.resultsManager.updateDisplay();
            }, 100);
        }
    }

    manageFocus(event) {
        // Trap focus within modals or important areas
        const activeElement = document.activeElement;
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        // Basic focus management - can be enhanced based on specific needs
        if (event.shiftKey && activeElement === focusableElements[0]) {
            event.preventDefault();
            focusableElements[focusableElements.length - 1].focus();
        } else if (
            !event.shiftKey &&
            activeElement === focusableElements[focusableElements.length - 1]
        ) {
            event.preventDefault();
            focusableElements[0].focus();
        }
    }

    updatePreferences(preferences) {
        if (window.storage) {
            window.storage.updatePreferences(preferences);
        }

        // Apply preferences
        if (preferences.animationsEnabled !== undefined && window.animations) {
            window.animations.setAnimationsEnabled(preferences.animationsEnabled);
        }

        if (window.logger) {
            window.logger.info("Preferences updated", preferences);
        }
    }

    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenSize: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            devicePixelRatio: window.devicePixelRatio,
            colorDepth: screen.colorDepth,
            timestamp: new Date().toISOString(),
        };
    }
}

// Create global UI manager instance
const uiManager = new UIManager();
window.uiManager = uiManager;
