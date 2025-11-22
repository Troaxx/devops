# Chess Club Ranking System

A web-based student management system for tracking chess club members and their ratings across different game formats.

## Project Overview

This system allows chess club administrators to manage student records with support for creating, viewing, updating, and deleting student profiles. Each student has ratings for three chess formats: Blitz, Rapid, and Classical.

## Features

### CREATE - Student Registration (Daniella)
Files: `utils/DaniellaUtil.js`, `public/js/daniella.js`

- Automatic unique student ID generation
- Student registration with name and email
- Three chess rating categories
- Input validation and duplicate detection

### READ - View Rankings (Dylan)
Files: `utils/DylanUtil.js`, `public/js/dylan.js`

- Display all students in a sortable table
- Sort by different rating types
- Search and filter functionality

### UPDATE - Score Management (Gengyue)
Files: `utils/GengyueUtil.js`, `public/js/gengyue.js`

- Secure student login system
- Update ratings for all three chess formats
- Input validation (0-3000 rating range)

### DELETE - Account Deletion (Danish)
Files: `utils/DanishUtil.js`, `public/js/danish.js`

- Student account deletion
- Confirmation prompts
- Secure deletion process

## Technology Stack

- Backend: Node.js, Express.js
- Frontend: HTML, CSS, JavaScript
- Data Storage: JSON file-based database
- Version Control: Git, GitHub

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Troaxx/devops.git
   cd devops
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the server
   ```bash
   npm start
   ```

4. Access the application at `http://localhost:5000`

## Project Structure

```
chess-club-ranking/
├── public/
│   ├── js/
│   │   ├── daniella.js
│   │   ├── dylan.js
│   │   ├── gengyue.js
│   │   └── danish.js
│   ├── index.html
│   └── styles.css
├── utils/
│   ├── DaniellaUtil.js
│   ├── DylanUtil.js
│   ├── GengyueUtil.js
│   ├── DanishUtil.js
│   └── students.json
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── index.js
├── package.json
└── README.md
```

## API Endpoints

### CREATE
- POST /api/students - Create new student

### READ
- GET /api/students - Get all students
- GET /api/rankings - Get student rankings

### UPDATE
- POST /api/login - Student login
- GET /api/students/:id - Get student by ID
- PUT /api/students/:id - Update student scores

### DELETE
- DELETE /api/students/:id - Delete student account

## Team Members

| Name | Role | Feature | Branch |
|------|------|---------|--------|
| Daniella | Developer | CREATE | create_daniella |
| Dylan | Developer | READ | read_dylan |
| Gengyue | Developer | UPDATE | update_gengyue |
| Danish | Developer | DELETE | delete_danish |

## Development Workflow

### Branching Strategy
- main - Production-ready code
- create_daniella - CREATE feature
- read_dylan - READ feature
- update_gengyue - UPDATE feature
- delete_danish - DELETE feature

### Commit Guidelines
```
type(scope): description

Examples:
feat(create): add student registration form
fix(update): resolve score validation bug
docs(readme): update installation instructions
```

## Data Validation

Student ID Format: YY + 4 digits + letter (a-e)
Example: 241234a

Rating Range: 0-3000 (Blitz, Rapid, Classical)

Email: Must be valid and unique

## Contributing

Use the Pull Request template when submitting changes. Ensure code follows project conventions and all features are tested.

---

Last Updated: November 2024
