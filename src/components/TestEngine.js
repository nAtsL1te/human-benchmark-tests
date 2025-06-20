/**
 * TestEngine for Human Reaction Benchmark Tool
 * Handles all types of reaction tests (Visual, Audio, Choice) with precise timing
 */

class TestEngine {
    constructor() {
        this.currentTest = null;
        this.testState = "idle"; // idle, ready, waiting, active, complete
        this.startTime = null;
        this.endTime = null;
        this.testTimeout = null;
        this.testData = {};

        this.testTypes = {
            visual: {
                name: "Visual Reaction Test",
                description: "Click when the screen changes color",
                minDelay: 1000,
                maxDelay: 5000,
                instruction: "Wait for the screen to change color, then click as fast as you can!",
            },
            audio: {
                name: "Audio Reaction Test",
                description: "Click when you hear the sound",
                minDelay: 1000,
                maxDelay: 5000,
                instruction: "Wait for the sound, then click as fast as you can!",
            },
            choice: {
                name: "Choice Reaction Test",
                description: "Choose the correct response",
                minDelay: 500,
                maxDelay: 3000,
                instruction: "Choose the correct response as fast as you can!",
            },
        };

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.createAudioContext();

        if (window.logger) {
            window.logger.info("TestEngine initialized");
        }
    }

    setupEventListeners() {
        document.addEventListener("keydown", (e) => {
            if (e.code === "Space" && this.testState === "active") {
                e.preventDefault();
                this.handleReaction();
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target.id === "reaction-area" && this.testState === "active") {
                this.handleReaction();
            }
        });
    }

    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn("Audio context not available", error);
            this.audioContext = null;
        }
    }

    startTest(testType) {
        if (!this.testTypes[testType]) {
            throw new Error(`Invalid test type: ${testType}`);
        }

        this.currentTest = testType;
        this.testState = "ready";
        this.testData = {
            type: testType,
            startTime: Date.now(),
            reactionTime: null,
            success: false,
            attempts: 0,
        };

        this.setupTestUI(testType);

        if (window.logger) {
            window.logger.info(`Starting ${testType} test`);
        }
    }

    setupTestUI(testType) {
        const testTitle = document.getElementById("test-title");
        const testSubtitle = document.getElementById("test-subtitle");
        const testInstructions = document.getElementById("test-instructions");
        const reactionArea = document.getElementById("reaction-area");
        const testResults = document.getElementById("test-results");
        const testSelection = document.getElementById("test-selection");
        const testArena = document.getElementById("test-arena");

        if (testSelection) testSelection.classList.add("hidden");
        if (testArena) testArena.classList.remove("hidden");
        if (testResults) testResults.classList.add("hidden");

        const testConfig = this.testTypes[testType];

        if (testTitle) testTitle.textContent = testConfig.name;
        if (testSubtitle) testSubtitle.textContent = testConfig.description;
        if (testInstructions) {
            testInstructions.innerHTML = `<p>${testConfig.instruction}</p>`;
        }

        if (reactionArea) {
            reactionArea.classList.remove("hidden");
            reactionArea.textContent = "Click to Start";
            reactionArea.onclick = () => this.beginTest();

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "ready");
            }
        }
    }

    beginTest() {
        if (this.testState !== "ready") return;

        this.testState = "waiting";
        this.testData.attempts++;

        const reactionArea = document.getElementById("reaction-area");
        const testInstructions = document.getElementById("test-instructions");

        if (reactionArea) {
            reactionArea.textContent = "Wait...";
            reactionArea.onclick = () => this.handleEarlyClick();

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "waiting");
            }
        }

        if (testInstructions) {
            testInstructions.innerHTML = "<p>Wait for the signal...</p>";
        }

        // Random delay before showing stimulus
        const testConfig = this.testTypes[this.currentTest];
        const delay =
            Math.random() * (testConfig.maxDelay - testConfig.minDelay) + testConfig.minDelay;

        this.testTimeout = setTimeout(() => {
            this.showStimulus();
        }, delay);

        if (window.logger) {
            window.logger.debug(`Test delay: ${delay}ms`);
        }
    }

    showStimulus() {
        if (this.testState !== "waiting") return;

        this.testState = "active";
        this.startTime = performance.now();

        const reactionArea = document.getElementById("reaction-area");
        const testInstructions = document.getElementById("test-instructions");

        if (testInstructions) {
            testInstructions.innerHTML = "<p>React NOW!</p>";
        }

        switch (this.currentTest) {
            case "visual":
                this.showVisualStimulus(reactionArea);
                break;
            case "audio":
                this.showAudioStimulus(reactionArea);
                break;
            case "choice":
                this.showChoiceStimulus(reactionArea);
                break;
        }

        // Timeout after 3 seconds
        this.testTimeout = setTimeout(() => {
            this.handleTimeout();
        }, 3000);
    }

    showVisualStimulus(reactionArea) {
        if (reactionArea) {
            reactionArea.textContent = "CLICK NOW!";
            reactionArea.onclick = () => this.handleReaction();

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "active");
            }
        }
    }

    showAudioStimulus(reactionArea) {
        if (reactionArea) {
            reactionArea.textContent = "CLICK NOW!";
            reactionArea.onclick = () => this.handleReaction();

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "active");
            }
        }

        // Play sound
        this.playSound(800, 0.2, 200); // 800Hz tone for 200ms
    }

    showChoiceStimulus(reactionArea) {
        const choices = ["LEFT", "RIGHT", "UP", "DOWN"];
        const correctChoice = choices[Math.floor(Math.random() * choices.length)];
        this.testData.correctChoice = correctChoice;

        if (reactionArea) {
            reactionArea.innerHTML = `
                <div class="text-center">
                    <div class="text-2xl mb-4">Choose: ${correctChoice}</div>
                    <div class="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                        ${choices
                            .map(
                                (choice) => `
                            <button 
                                class="choice-btn bg-white text-gray-800 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                                data-choice="${choice}"
                                onclick="window.testEngine.handleChoiceClick('${choice}')"
                            >
                                ${choice}
                            </button>
                        `,
                            )
                            .join("")}
                    </div>
                </div>
            `;

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "active");
            }
        }
    }

    playSound(frequency, volume, duration) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + duration / 1000,
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn("Error playing sound", error);
        }
    }

    handleReaction() {
        if (this.testState !== "active") return;

        this.endTime = performance.now();
        const reactionTime = Math.round(this.endTime - this.startTime);

        this.testData.reactionTime = reactionTime;
        this.testData.success = true;
        this.testData.endTime = Date.now();

        this.completeTest();

        if (window.logger) {
            window.logger.info(`Reaction time: ${reactionTime}ms`);
        }
    }

    handleChoiceClick(choice) {
        if (this.testState !== "active") return;

        this.endTime = performance.now();
        const reactionTime = Math.round(this.endTime - this.startTime);

        this.testData.reactionTime = reactionTime;
        this.testData.chosenAnswer = choice;
        this.testData.success = choice === this.testData.correctChoice;
        this.testData.endTime = Date.now();

        this.completeTest();
    }

    handleEarlyClick() {
        if (this.testState !== "waiting") return;

        this.testState = "error";
        clearTimeout(this.testTimeout);

        const reactionArea = document.getElementById("reaction-area");
        const testInstructions = document.getElementById("test-instructions");

        if (reactionArea) {
            reactionArea.textContent = "Too Early! Click to try again";
            reactionArea.onclick = () => this.beginTest();

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "error");
            }
        }

        if (testInstructions) {
            testInstructions.innerHTML =
                '<p class="text-red-600">You clicked too early! Wait for the signal.</p>';
        }

        this.testState = "ready";

        if (window.logger) {
            window.logger.debug("Early click detected");
        }
    }

    handleTimeout() {
        if (this.testState !== "active") return;

        this.testData.reactionTime = -1; // Indicates timeout
        this.testData.success = false;
        this.testData.endTime = Date.now();

        this.completeTest();

        if (window.logger) {
            window.logger.debug("Test timed out");
        }
    }

    completeTest() {
        this.testState = "complete";
        clearTimeout(this.testTimeout);

        // Save result to storage
        if (window.storage) {
            window.storage.saveTestResult(this.testData);
        }

        // Update UI
        this.showResults();

        // Update global results
        if (window.resultsManager) {
            window.resultsManager.updateDisplay();
        }

        if (window.logger) {
            window.logger.info("Test completed", this.testData);
        }
    }

    showResults() {
        const reactionArea = document.getElementById("reaction-area");
        const testResults = document.getElementById("test-results");
        const reactionTimeElement = document.getElementById("reaction-time");

        if (reactionArea) {
            reactionArea.classList.add("hidden");
        }

        if (testResults) {
            testResults.classList.remove("hidden");

            if (window.animations) {
                window.animations.animateIn(testResults, "slideUp");
            }
        }

        if (reactionTimeElement) {
            if (this.testData.reactionTime > 0) {
                reactionTimeElement.textContent = `${this.testData.reactionTime} ms`;
                reactionTimeElement.className = "text-4xl font-bold text-green-600";
            } else {
                reactionTimeElement.textContent = "Timeout";
                reactionTimeElement.className = "text-4xl font-bold text-red-600";
            }
        }
    }

    restartTest() {
        const reactionArea = document.getElementById("reaction-area");
        const testResults = document.getElementById("test-results");

        if (reactionArea) {
            reactionArea.classList.remove("hidden");
            reactionArea.textContent = "Click to Start";
            reactionArea.onclick = () => this.beginTest();

            if (window.animations) {
                window.animations.animateReactionArea(reactionArea, "ready");
            }
        }

        if (testResults) {
            testResults.classList.add("hidden");
        }

        this.testState = "ready";
        this.testData.attempts = 0;

        if (window.logger) {
            window.logger.info("Test restarted");
        }
    }

    stopTest() {
        this.testState = "idle";
        clearTimeout(this.testTimeout);
        this.currentTest = null;

        if (window.logger) {
            window.logger.info("Test stopped");
        }
    }

    getTestHistory() {
        if (window.storage) {
            return window.storage.getTestResults({ limit: 50 });
        }
        return [];
    }

    getTestStats() {
        if (window.storage) {
            return window.storage.getUserStats();
        }
        return null;
    }
}

// Create global test engine instance
const testEngine = new TestEngine();
window.testEngine = testEngine;
