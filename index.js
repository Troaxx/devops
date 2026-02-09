//for demo
throw new Error("Simulated Failure for Helm Rollback Test");
// kubectl get pods,svc,deployments
// minikube delete
// minikube start --ports=127.0.0.1:30080:30080


const express = require('express');
const path = require('path');

// Import utility modules for each CRUD operation
const CreateStudentUtil = require('./utils/DaniellaUtil');
const ViewRankingsUtil = require('./utils/DylanUtil');
const UpdateStudentUtil = require('./utils/GengyueUtil');
const DeleteAccountUtil = require('./utils/DanishUtil');

const logger = require('./logger');
const app = express();
const PORT = process.env.PORT || 5050;

const statusMonitor = require('express-status-monitor');
app.use(statusMonitor());



// Middleware
app.use(express.json());
app.use(express.static('public'));

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

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

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve test dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

const server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${
    address.address == '::' ? 'localhost' : address.address
  }:${address.port}`;
  console.log(`Chess Club Ranking System at: ${baseUrl}`);
  logger.info(`Express Status at: ${baseUrl}/status`);
});
module.exports = { app, server };
