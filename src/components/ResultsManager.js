/**
 * ResultsManager for Human Reaction Benchmark Tool
 * Handles data visualization, statistics display, and results analysis
 */

class ResultsManager {
    constructor() {
        this.charts = {};
        this.isChartsLoaded = typeof Chart !== "undefined";

        this.initialize();
    }

    initialize() {
        if (!this.isChartsLoaded) {
            console.warn("Chart.js not loaded, charts will not be available");
        }

        this.setupChartDefaults();

        if (window.logger) {
            window.logger.info("ResultsManager initialized");
        }
    }

    setupChartDefaults() {
        if (!this.isChartsLoaded) return;

        Chart.defaults.font.family = "Inter, sans-serif";
        Chart.defaults.color = "#374151";
        Chart.defaults.plugins.legend.position = "bottom";
    }

    updateDisplay() {
        this.updateStatistics();
        this.updateCharts();

        if (window.logger) {
            window.logger.debug("Results display updated");
        }
    }

    updateStatistics() {
        if (!window.storage) return;

        const stats = window.storage.getUserStats();
        const results = window.storage.getTestResults({ limit: 100 });

        // Update stat cards
        this.updateStatCard("avg-time", this.formatTime(stats.averageReactionTime));
        this.updateStatCard("best-time", this.formatTime(stats.bestReactionTime));
        this.updateStatCard("total-tests", stats.totalTests.toString());
        this.updateStatCard("accuracy", this.calculateAccuracy(results));
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (window.animations) {
                window.animations.animateStatUpdate(element, value);
            } else {
                element.textContent = value;
            }
        }
    }

    formatTime(time) {
        if (!time || time <= 0) return "--";
        return Math.round(time) + "ms";
    }

    calculateAccuracy(results) {
        if (!results || results.length === 0) return "--";

        const successfulTests = results.filter((r) => r.success && r.reactionTime > 0);
        const accuracy = (successfulTests.length / results.length) * 100;

        return Math.round(accuracy) + "%";
    }

    updateCharts() {
        if (!this.isChartsLoaded) return;

        this.updateTrendChart();
        this.updateDistributionChart();
    }

    updateTrendChart() {
        const canvas = document.getElementById("trend-chart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const results = window.storage ? window.storage.getTestResults({ limit: 20 }) : [];

        // Prepare data
        const validResults = results.filter((r) => r.reactionTime > 0);
        const labels = validResults.map((_, index) => `Test ${index + 1}`);
        const data = validResults.map((r) => r.reactionTime);

        // Destroy existing chart
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        // Create new chart
        this.charts.trend = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Reaction Time (ms)",
                        data: data,
                        borderColor: "#3B82F6",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: "#3B82F6",
                        pointBorderColor: "#FFFFFF",
                        pointBorderWidth: 2,
                        pointRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#FFFFFF",
                        bodyColor: "#FFFFFF",
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function (context) {
                                return `Test ${context[0].dataIndex + 1}`;
                            },
                            label: function (context) {
                                return `${context.parsed.y}ms`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: "Recent Tests",
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Reaction Time (ms)",
                        },
                        beginAtZero: true,
                        grid: {
                            color: "rgba(0, 0, 0, 0.1)",
                        },
                    },
                },
                interaction: {
                    intersect: false,
                    mode: "index",
                },
            },
        });
    }

    updateDistributionChart() {
        const canvas = document.getElementById("distribution-chart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const stats = window.storage ? window.storage.getUserStats() : null;

        if (!stats) return;

        // Prepare data
        const testTypes = ["Visual", "Audio", "Choice"];
        const data = [
            stats.testsByType.visual || 0,
            stats.testsByType.audio || 0,
            stats.testsByType.choice || 0,
        ];

        const colors = [
            "#3B82F6", // Blue for Visual
            "#10B981", // Green for Audio
            "#8B5CF6", // Purple for Choice
        ];

        // Destroy existing chart
        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        // Create new chart
        this.charts.distribution = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: testTypes,
                datasets: [
                    {
                        data: data,
                        backgroundColor: colors,
                        borderColor: "#FFFFFF",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: "circle",
                        },
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#FFFFFF",
                        bodyColor: "#FFFFFF",
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage =
                                    total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                                return `${context.label}: ${context.parsed} tests (${percentage}%)`;
                            },
                        },
                    },
                },
                cutout: "60%",
            },
        });
    }

    exportResults() {
        if (!window.storage) {
            alert("No data available to export");
            return;
        }

        const stats = window.storage.getUserStats();
        const results = window.storage.getTestResults();

        const exportData = {
            exportDate: new Date().toISOString(),
            statistics: stats,
            testResults: results,
            summary: {
                totalTests: stats.totalTests,
                averageReactionTime: Math.round(stats.averageReactionTime),
                bestReactionTime: stats.bestReactionTime,
                accuracy: this.calculateAccuracy(results),
                testDistribution: stats.testsByType,
            },
        };

        // Create CSV data
        const csvData = this.convertToCSV(results);

        // Create ZIP-like structure (simplified as multiple downloads)
        this.downloadFile(
            JSON.stringify(exportData, null, 2),
            "reaction-benchmark-results.json",
            "application/json",
        );
        this.downloadFile(csvData, "reaction-benchmark-results.csv", "text/csv");

        if (window.logger) {
            window.logger.info("Results exported");
        }
    }

    convertToCSV(results) {
        if (!results || results.length === 0) return "";

        const headers = ["Date", "Time", "Test Type", "Reaction Time (ms)", "Success", "Attempts"];
        const rows = results.map((result) => {
            const date = new Date(result.timestamp);
            return [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                result.type,
                result.reactionTime > 0 ? result.reactionTime : "Timeout",
                result.success ? "Yes" : "No",
                result.attempts || 1,
            ];
        });

        return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getPerformanceAnalysis() {
        if (!window.storage) return null;

        const results = window.storage.getTestResults();
        const stats = window.storage.getUserStats();

        if (!results || results.length === 0) return null;

        const validResults = results.filter((r) => r.reactionTime > 0);

        const analysis = {
            totalTests: results.length,
            successfulTests: validResults.length,
            accuracy: (validResults.length / results.length) * 100,
            averageTime: stats.averageReactionTime,
            bestTime: stats.bestReactionTime,
            worstTime: Math.max(...validResults.map((r) => r.reactionTime)),
            consistency: this.calculateConsistency(validResults),
            improvement: this.calculateImprovement(validResults),
            testTypePerformance: this.getTestTypePerformance(validResults),
        };

        return analysis;
    }

    calculateConsistency(results) {
        if (results.length < 2) return 0;

        const times = results.map((r) => r.reactionTime);
        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        const variance =
            times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
        const standardDeviation = Math.sqrt(variance);

        // Lower standard deviation = higher consistency
        // Normalize to 0-100 scale (inverse relationship)
        const consistency = Math.max(0, 100 - (standardDeviation / mean) * 100);

        return Math.round(consistency);
    }

    calculateImprovement(results) {
        if (results.length < 10) return 0;

        const firstHalf = results.slice(0, Math.floor(results.length / 2));
        const secondHalf = results.slice(Math.floor(results.length / 2));

        const firstAverage =
            firstHalf.reduce((sum, r) => sum + r.reactionTime, 0) / firstHalf.length;
        const secondAverage =
            secondHalf.reduce((sum, r) => sum + r.reactionTime, 0) / secondHalf.length;

        const improvement = ((firstAverage - secondAverage) / firstAverage) * 100;

        return Math.round(improvement);
    }

    getTestTypePerformance(results) {
        const performance = {};

        ["visual", "audio", "choice"].forEach((type) => {
            const typeResults = results.filter((r) => r.type === type);

            if (typeResults.length > 0) {
                const times = typeResults.map((r) => r.reactionTime);
                performance[type] = {
                    count: typeResults.length,
                    average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
                    best: Math.min(...times),
                    accuracy:
                        (typeResults.filter((r) => r.success).length / typeResults.length) * 100,
                };
            }
        });

        return performance;
    }

    showPerformanceReport() {
        const analysis = this.getPerformanceAnalysis();
        if (!analysis) {
            alert("Not enough data for performance analysis. Complete more tests first.");
            return;
        }

        const reportHTML = `
            <div class="performance-report p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
                <h3 class="text-2xl font-bold mb-6 text-center">Performance Report</h3>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="stat-item text-center p-3 bg-blue-50 rounded">
                        <div class="text-2xl font-bold text-blue-600">${analysis.totalTests}</div>
                        <div class="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div class="stat-item text-center p-3 bg-green-50 rounded">
                        <div class="text-2xl font-bold text-green-600">${Math.round(
                            analysis.accuracy,
                        )}%</div>
                        <div class="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div class="stat-item text-center p-3 bg-purple-50 rounded">
                        <div class="text-2xl font-bold text-purple-600">${Math.round(
                            analysis.averageTime,
                        )}ms</div>
                        <div class="text-sm text-gray-600">Average Time</div>
                    </div>
                    <div class="stat-item text-center p-3 bg-orange-50 rounded">
                        <div class="text-2xl font-bold text-orange-600">${
                            analysis.consistency
                        }%</div>
                        <div class="text-sm text-gray-600">Consistency</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Performance by Test Type:</h4>
                    ${Object.entries(analysis.testTypePerformance)
                        .map(
                            ([type, perf]) => `
                        <div class="flex justify-between items-center py-2 border-b">
                            <span class="capitalize">${type}</span>
                            <span>${perf.average}ms avg (${perf.count} tests)</span>
                        </div>
                    `,
                        )
                        .join("")}
                </div>
                
                ${
                    analysis.improvement !== 0
                        ? `
                    <div class="text-center p-3 ${
                        analysis.improvement > 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                    } rounded">
                        ${analysis.improvement > 0 ? "📈 Improved" : "📉 Declined"} by ${Math.abs(
                              analysis.improvement,
                          )}% over time
                    </div>
                `
                        : ""
                }
                
                <button 
                    class="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    onclick="this.parentElement.parentElement.remove()"
                >
                    Close Report
                </button>
            </div>
        `;

        // Create overlay
        const overlay = document.createElement("div");
        overlay.className =
            "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";
        overlay.innerHTML = reportHTML;

        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        if (window.logger) {
            window.logger.info("Performance report displayed");
        }
    }

    clearResults() {
        if (confirm("This will permanently delete all your test results. Are you sure?")) {
            if (window.storage) {
                window.storage.clearAllData();
            }

            this.updateDisplay();

            if (window.logger) {
                window.logger.info("Results cleared");
            }
        }
    }
}

// Create global results manager instance
const resultsManager = new ResultsManager();
window.resultsManager = resultsManager;
