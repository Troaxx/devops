const fs = require('fs').promises;
const path = require('path');

const ORIGINAL_DB_PATH = path.join(__dirname, '../../utils/students.json');
const TEST_DB_PATH = path.join(__dirname, '../../utils/students.test.json');
const TEMPLATE_DB_PATH = path.join(__dirname, '../../utils/student.template.json');

class TestDBHelper {
  static async setupTestDB(initialData = null) {
    let data;
    if (initialData) {
      data = JSON.stringify(initialData, null, 2);
    } else {
      const template = await fs.readFile(TEMPLATE_DB_PATH, 'utf8');
      data = template;
    }
    await fs.writeFile(TEST_DB_PATH, data);
    return TEST_DB_PATH;
  }

  static async cleanupTestDB() {
    try {
      await fs.unlink(TEST_DB_PATH);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  static async readTestDB() {
    const data = await fs.readFile(TEST_DB_PATH, 'utf8');
    return JSON.parse(data);
  }

  static async writeTestDB(data) {
    await fs.writeFile(TEST_DB_PATH, JSON.stringify(data, null, 2));
  }

  static getTestDBPath() {
    return TEST_DB_PATH;
  }

  static getOriginalDBPath() {
    return ORIGINAL_DB_PATH;
  }
}

module.exports = TestDBHelper;





