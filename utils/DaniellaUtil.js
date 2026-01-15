const fs = require('fs').promises;
const path = require('path');
const logger = require('../logger');

const DB_PATH = path.join(__dirname, 'students.json');

/**
 * Member A - CREATE Feature
 * Handles student account creation
 */

// Create new student account
const createStudent = async (req, res) => {
  try {
    const { id, rapid, blitz, bullet } = req.body;

    // Validation 1: Check if all required fields are provided
    if (
      !id ||
      rapid === undefined ||
      rapid === '' ||
      blitz === undefined ||
      blitz === '' ||
      bullet === undefined ||
      bullet === ''
    ) {
      logger.warn(`Create Student Failed: Missing fields`, { id });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide ID, Rapid, Blitz, and Bullet scores.',
      });
    }

    // Validation 2: Check ID format (7 digits + letter a-e)
    const idPattern = /^\d{7}[a-e]$/;
    if (!idPattern.test(id)) {
      logger.warn(`Create Student Failed: Invalid ID format`, { id });
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Must be 7 digits followed by a letter (a-e), e.g., 2403880d',
      });
    }

    // Validation 3: Check score ranges (0-3000)
    const rapidNum = parseInt(rapid);
    const blitzNum = parseInt(blitz);
    const bulletNum = parseInt(bullet);

    if (
      rapidNum < 0 ||
      rapidNum > 3000 ||
      blitzNum < 0 ||
      blitzNum > 3000 ||
      bulletNum < 0 ||
      bulletNum > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scores. All ratings must be between 0 and 3000.',
      });
    }

    // Read existing students
    const data = await fs.readFile(DB_PATH, 'utf8');
    const students = JSON.parse(data);

    // Validation 4: Check if student ID already exists
    const existingStudent = students.students.find((s) => s.id === id);
    if (existingStudent) {
      logger.warn(`Create Student Failed: Duplicate ID`, { id });
      return res.status(409).json({
        success: false,
        message: 'Student ID already exists. Please use a different ID.',
      });
    }

    // Create new student object
    const newStudent = {
      id: id,
      rapid: rapidNum,
      blitz: blitzNum,
      bullet: bulletNum,
      createdAt: new Date().toISOString(),
    };

    // Add new student to array
    students.students.push(newStudent);

    // Write back to file
    await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));

    res.status(201).json({
      success: true,
      message: 'Student account created successfully!',
      student: newStudent,
    });
    logger.info(`Student Created Successfully`, { id, rapid: rapidNum, blitz: blitzNum });
  } catch (error) {
    logger.error('Error creating student:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to create student account',
      error: error.message,
    });
  }
};

module.exports = {
  createStudent,
};
