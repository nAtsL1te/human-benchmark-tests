# Human Benchmark Tests

A web-based application to test and measure human reaction time and other cognitive benchmarks.

## Features

- **Visual Reaction Test:** Test your reaction time to a visual stimulus.
- **Audio Reaction Test:** Test your reaction time to an auditory stimulus.
- **Choice Reaction Test:** Test your ability to make a quick decision based on a choice.
- **Results Tracking:** View your test history and statistics.
- **Modern UI:** A clean and intuitive user interface for a seamless testing experience.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You need a modern web browser that supports JavaScript.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/human-benchmark-tests.git
   ```
2. Open `index.html` in your browser.

## Usage

1. Open the application in your web browser.
2. Select the desired test from the main menu.
3. Follow the on-screen instructions to complete the test.
4. After each test, your results will be displayed.
5. You can view your overall statistics and test history in the results section.

## Project Structure

```
human-benchmark-tests/
|-- assets/                 # Static assets like images and sounds
|-- index.html              # Main HTML file
|-- package.json            # Project metadata and dependencies
|-- README.md               # Project README file
|-- src/
|   |-- app.js              # Main application logic
|   |-- components/
|   |   |-- ResultsManager.js # Manages test results and statistics
|   |   |-- TestEngine.js     # Core logic for running the benchmark tests
|   |   |-- UIManager.js      # Handles UI updates and interactions
|   |-- tests/                # Test files
|   |-- utils/
|   |   |-- animations.js   # UI animations
|   |   |-- logger.js       # Application logger
|   |   |-- storage.js      # Local storage for results
```
