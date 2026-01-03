class TestDashboard {
    constructor() {
        this.isRunning = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTestList();
    }

    setupEventListeners() {
        document.getElementById('run-all').addEventListener('click', () => {
            this.runTests('all', false);
        });

        document.getElementById('run-all-coverage').addEventListener('click', () => {
            this.runTests('all', true);
        });

        document.querySelectorAll('[data-test]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testType = e.target.getAttribute('data-test');
                this.runTests(testType, false);
            });
        });

        document.getElementById('clear-output').addEventListener('click', () => {
            this.clearOutput();
        });
    }

    async loadTestList() {
        try {
            const response = await fetch('/api/tests/list');
            const data = await response.json();

            if (data.success) {
                this.displayTestList(data.tests);
            } else {
                this.showError('Failed to load test list: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            this.showError('Error loading test list: ' + error.message);
        }
    }

    displayTestList(tests) {
        const testListContainer = document.getElementById('test-list');
        testListContainer.innerHTML = '';

        const features = [
            { key: 'create', name: 'Create (Daniella)', color: 'create' },
            { key: 'read', name: 'Read (Dylan)', color: 'read' },
            { key: 'update', name: 'Update (Gengyue)', color: 'update' },
            { key: 'delete', name: 'Delete (Danish)', color: 'delete' }
        ];

        features.forEach(feature => {
            if (tests[feature.key] && tests[feature.key].length > 0) {
                const group = document.createElement('div');
                group.className = 'test-group';
                group.innerHTML = `<h4>${feature.name} (${tests[feature.key].length} tests)</h4>`;

                tests[feature.key].forEach(testName => {
                    const item = document.createElement('div');
                    item.className = `test-item ${feature.color}`;
                    item.textContent = testName;
                    group.appendChild(item);
                });

                testListContainer.appendChild(group);
            }
        });

        if (testListContainer.children.length === 0) {
            testListContainer.innerHTML = '<p class="loading">No tests found</p>';
        }
    }

    async runTests(testType, withCoverage) {
        if (this.isRunning) {
            this.showError('Tests are already running. Please wait...');
            return;
        }

        this.isRunning = true;
        this.updateStatus('running', 'Running tests...');
        this.clearOutput();
        this.appendOutput(`Starting ${testType} tests${withCoverage ? ' with coverage' : ''}...\n`, 'info');
        this.appendOutput('This may take several minutes. Please wait...\n', 'info');

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => btn.disabled = true);

        const statusInterval = setInterval(() => {
            if (this.isRunning) {
                this.appendOutput('Tests still running...\n', 'info');
            }
        }, 30000);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 600000);

            const response = await fetch('/api/tests/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    testType,
                    withCoverage
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            clearInterval(statusInterval);

            if (data.success) {
                this.updateStatus('success', 'Tests completed successfully');
                this.appendOutput(data.stdout, 'success');
                if (data.stderr) {
                    this.appendOutput(data.stderr, 'error');
                }
                this.displayTestResults(data.testResults);
                if (data.coverage) {
                    this.displayCoverage(data.coverage);
                }
            } else {
                this.updateStatus('error', 'Tests failed');
                this.appendOutput(data.stdout || '', 'info');
                this.appendOutput(data.stderr || data.error || 'Unknown error', 'error');
                if (data.testResults) {
                    this.displayTestResults(data.testResults);
                }
                if (data.coverage) {
                    this.displayCoverage(data.coverage);
                }
            }
        } catch (error) {
            clearInterval(statusInterval);
            this.updateStatus('error', 'Error running tests');
            if (error.name === 'AbortError') {
                this.appendOutput('Error: Request timed out. Tests may still be running on the server.\n', 'error');
            } else if (error.message.includes('Failed to fetch')) {
                this.appendOutput('Error: Failed to connect to server. Please ensure the server is running on http://localhost:5000\n', 'error');
            } else {
                this.appendOutput('Error: ' + error.message + '\n', 'error');
            }
        } finally {
            clearInterval(statusInterval);
            this.isRunning = false;
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = false);
        }
    }

    displayTestResults(results) {
        if (!results) return;

        const summary = document.getElementById('test-summary');
        summary.style.display = 'grid';

        const passed = results.passed || (results.stats && results.stats.passed) || 0;
        const failed = results.failed || (results.stats && results.stats.failed) || 0;
        const skipped = results.skipped || (results.stats && results.stats.skipped) || 0;
        const total = results.total || (results.stats && results.stats.total) || (passed + failed + skipped);

        document.getElementById('passed-count').textContent = passed;
        document.getElementById('failed-count').textContent = failed;
        document.getElementById('skipped-count').textContent = skipped;
        document.getElementById('total-count').textContent = total;

        this.appendOutput(`\n=== Test Results ===\n`, 'info');
        this.appendOutput(`Passed: ${passed}\n`, 'success');
        this.appendOutput(`Failed: ${failed}\n`, failed > 0 ? 'error' : 'success');
        this.appendOutput(`Skipped: ${skipped}\n`, 'info');
        this.appendOutput(`Total: ${total}\n`, 'info');
    }

    displayCoverage(coverage) {
        if (!coverage || !coverage.total) return;

        const coverageSection = document.getElementById('coverage-section');
        coverageSection.style.display = 'block';

        const total = coverage.total;

        const statements = total.statements ? total.statements.pct : 0;
        const branches = total.branches ? total.branches.pct : 0;
        const functions = total.functions ? total.functions.pct : 0;
        const lines = total.lines ? total.lines.pct : 0;

        document.getElementById('coverage-statements').textContent = statements.toFixed(1) + '%';
        document.getElementById('coverage-branches').textContent = branches.toFixed(1) + '%';
        document.getElementById('coverage-functions').textContent = functions.toFixed(1) + '%';
        document.getElementById('coverage-lines').textContent = lines.toFixed(1) + '%';

        document.getElementById('coverage-statements-bar').style.width = statements + '%';
        document.getElementById('coverage-branches-bar').style.width = branches + '%';
        document.getElementById('coverage-functions-bar').style.width = functions + '%';
        document.getElementById('coverage-lines-bar').style.width = lines + '%';

        this.appendOutput(`\n=== Code Coverage ===\n`, 'info');
        this.appendOutput(`Statements: ${statements.toFixed(1)}%\n`, 'info');
        this.appendOutput(`Branches: ${branches.toFixed(1)}%\n`, 'info');
        this.appendOutput(`Functions: ${functions.toFixed(1)}%\n`, 'info');
        this.appendOutput(`Lines: ${lines.toFixed(1)}%\n`, 'info');
    }

    updateStatus(status, text) {
        const indicator = document.getElementById('status-indicator');
        const dot = indicator.querySelector('.status-dot');
        const statusText = document.getElementById('status-text');

        dot.className = 'status-dot ' + status;
        statusText.textContent = text;
    }

    appendOutput(text, type = 'info') {
        const output = document.getElementById('output-content');
        if (output.querySelector('.output-placeholder')) {
            output.innerHTML = '';
        }

        const line = document.createElement('div');
        line.className = type;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    clearOutput() {
        const output = document.getElementById('output-content');
        output.innerHTML = '<p class="output-placeholder">Click a button above to run tests...</p>';
    }

    showError(message) {
        this.appendOutput('ERROR: ' + message + '\n', 'error');
        this.updateStatus('error', 'Error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TestDashboard();
});

