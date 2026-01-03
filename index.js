const express = require('express');
const path = require('path');

// Import utility modules for each CRUD operation
const CreateStudentUtil = require('./utils/DaniellaUtil');
const ViewRankingsUtil = require('./utils/DylanUtil');
const UpdateStudentUtil = require('./utils/GengyueUtil');
const DeleteAccountUtil = require('./utils/DanishUtil');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ===== Daniella - CREATE API Endpoints =====
app.post('/api/students', CreateStudentUtil.createStudent);

// ===== Dylan - READ API Endpoints =====
app.get('/api/rankings', ViewRankingsUtil.getRankings);

// ===== Gengyue - UPDATE API Endpoints =====
app.post('/api/login', UpdateStudentUtil.loginStudent);
app.get('/api/students/:id', UpdateStudentUtil.getStudentById);
app.put('/api/students/:id', UpdateStudentUtil.updateScores);

// ===== Danish- DELETE API Endpoints =====
app.delete('/api/students/:id', DeleteAccountUtil.deleteStudent);

// ===== Test Dashboard API Endpoints =====
const TestRunner = require('./utils/TestRunner');

app.get('/api/tests/list', async (req, res) => {
    try {
        const result = await TestRunner.getTestList();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/tests/run', async (req, res) => {
    res.setTimeout(600000);
    try {
        const { testType = 'all', withCoverage = false } = req.body;
        const result = await TestRunner.runTests(testType, withCoverage);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/tests/coverage', async (req, res) => {
    try {
        const result = await TestRunner.getCoverageReport();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve test dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Chess Club Ranking System running on http://localhost:${PORT}`);
    console.log(`Server started at ${new Date().toLocaleString()}`);
});
