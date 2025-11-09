# Chess Club Ranking System

**DevOps Essentials - Project Part 1**
TP Mindsport Club - Chess Division

## Project Overview

A web application for managing chess club student accounts and rankings. Students can register, view rankings, update their scores, and leave the club.

## Features (CRUD Operations)

### Daniella - CREATE (Create Account)
- Generate unique student ID (format: YY + 4 digits + letter a-e)
- Register with Rapid, Blitz, and Bullet ratings
- Validation for ID uniqueness and score ranges (0-3000)

### Dylan - READ (View Rankings)
- Display all students in a sortable table
- Sort by Rapid, Blitz, or Bullet ratings
- Show rank, ID, scores, and join date

### Geng Yue C - UPDATE (Update Scores)
- Simple login with student ID (no password required)
- Update own Rapid, Blitz, and Bullet scores
- View current scores before updating

### Danish - DELETE (Leave Club)
- Delete student account with confirmation
- Permanent removal of all student data
- Warning messages for data loss

## Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Database**: JSON file storage
- **Version Control**: Git + GitHub

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Access the application:
```
http://localhost:3000
```

## Project Structure

```
chess-club-ranking/
├── index.js                          # Main server file
├── package.json                      # Dependencies
├── public/
│   ├── index.html                    # Main HTML page
│   ├── css/
│   │   └── styles.css                # Styling
│   └── js/
│       ├── create-student.js         # Member A - Frontend
│       ├── view-rankings.js          # Member B - Frontend
│       ├── update-scores.js          # Member C - Frontend
│       └── delete-account.js         # Member D - Frontend
└── utils/
    ├── students.json                 # Database
    ├── students.template.json        # Template
    ├── CreateStudentUtil.js          # Member A - Backend
    ├── ViewRankingsUtil.js           # Member B - Backend
    ├── UpdateScoresUtil.js           # Member C - Backend
    └── DeleteAccountUtil.js          # Member D - Backend
```

## API Endpoints

### Member A - CREATE
- `POST /api/generate-id` - Generate unique student ID
- `POST /api/students` - Create new student account

### Member B - READ
- `GET /api/students` - Get all students
- `GET /api/rankings?sortBy=rapid|blitz|bullet` - Get sorted rankings

### Member C - UPDATE
- `POST /api/login` - Login with student ID
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student scores

### Member D - DELETE
- `DELETE /api/students/:id` - Delete student account

## Database Schema

```json
{
  "students": [
    {
      "id": "2403800d",
      "rapid": 1200,
      "blitz": 1150,
      "bullet": 1100,
      "createdAt": "2025-01-04T09:30:00Z"
    }
  ]
}
```

## Error Handling

Each CRUD operation handles at least 2 error cases:

- **CREATE**: Duplicate ID, Invalid scores, Missing fields
- **READ**: No data found, Database read error
- **UPDATE**: ID not found, Invalid scores, Update failed
- **DELETE**: ID not found, Deletion failed

## Team Members

- Member A: CREATE functionality
- Member B: READ functionality
- Member C: UPDATE functionality
- Member D: DELETE functionality

## DevOps Practices

- Version control with Git
- Branching strategy (main + feature branches)
- Code collaboration and merge conflict resolution
- JSON-based data persistence
- RESTful API design

---

**© 2025 TP Mindsport Club | DevOps Project**
