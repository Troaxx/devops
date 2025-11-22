# Chess Club Ranking System

A web-based student management system for tracking chess club members and their ratings across different game formats.

## Project Overview

This system allows chess club administrators to manage student records with support for creating, viewing, updating, and deleting student profiles. Each student has ratings for three chess formats: Blitz, Rapid, and Classical.

## Features

### CREATE - Student Registration (Daniella)
**Files**: `utils/DaniellaUtil.js` | `public/js/daniella.js`

- Automatic unique student ID generation
- Student registration with name and email
- Three chess rating categories (Blitz, Rapid, Classical)
- Input validation and error handling
- Duplicate email detection

### READ - View Rankings (Dylan)
**Files**: `utils/DylanUtil.js` | `public/js/dylan.js`

- Display all students in a sortable table
- Sort by different rating types (Blitz, Rapid, Classical)
- Real-time ranking updates
- Search and filter functionality

### UPDATE - Score Management (Gengyue)
**Files**: `utils/UpdateStudentUtil.js` | `public/js/gengyue.js`

- Secure student login system
- Update ratings for all three chess formats
- Input validation (0-3000 rating range)
- Real-time score updates
- Session management

### DELETE - Account Deletion (Danish)
**Files**: `utils/DanishUtil.js` | `public/js/danish.js`

- Student account deletion
- Confirmation prompts
- Secure deletion process
- Database cleanup

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Data Storage**: JSON file-based database
- **Version Control**: Git, GitHub

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Troaxx/devops.git
   cd devops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # or
   node index.js
   ```

4. **Access the application**
   - Open browser and navigate to `http://localhost:5000`

## Project Structure

```
chess-club-ranking/
├── public/
│   ├── js/
│   │   ├── daniella.js      # CREATE frontend
│   │   ├── dylan.js         # READ frontend
│   │   ├── gengyue.js       # UPDATE frontend
│   │   └── danish.js        # DELETE frontend
│   ├── index.html           # Main page
│   └── styles.css           # Styling
├── utils/
│   ├── DaniellaUtil.js      # CREATE backend
│   ├── DylanUtil.js         # READ backend
│   ├── UpdateStudentUtil.js # UPDATE backend
│   ├── DanishUtil.js        # DELETE backend
│   └── students.json        # Database
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── index.js                 # Main server file
├── package.json
└── README.md
```

## API Endpoints

### CREATE Operations
- `POST /api/students` - Create new student

### READ Operations
- `GET /api/students` - Get all students
- `GET /api/rankings` - Get student rankings

### UPDATE Operations
- `POST /api/login` - Student login
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student scores

### DELETE Operations
- `DELETE /api/students/:id` - Delete student account

## Team Members

| Name | Role | Feature | Branch |
|------|------|---------|--------|
| Daniella | Developer | CREATE | `create_daniella` |
| Dylan | Developer | READ | `read_dylan` |
| Gengyue | Developer | UPDATE | `update_gengyue` |
| Danish | Developer | DELETE | `delete_danish` |

## Development Workflow

### Branching Strategy
- `main` - Production-ready code
- `create_daniella` - Daniella's CREATE feature
- `read_dylan` - Dylan's READ feature
- `update_gengyue` - Gengyue's UPDATE feature
- `delete_danish` - Danish's DELETE feature

### Commit Guidelines
Follow conventional commit format:
```
type(scope): description

Examples:
feat(create): add student registration form
fix(update): resolve score validation bug
docs(readme): update installation instructions
```

### Pull Request Process
1. Create feature branch from `main`
2. Develop and test your feature
3. Use PR template when creating pull request
4. Request review from team members
5. Merge after approval

## Data Validation

### Student ID Format
- Pattern: `YY` + 4 digits + letter (a-e)
- Example: `241234a`
- Automatically generated on creation

### Rating Constraints
- Minimum: 0
- Maximum: 3000
- Applies to: Blitz, Rapid, Classical ratings

### Email Validation
- Must be valid email format
- Must be unique (no duplicates)

## Error Handling

The system includes comprehensive error handling for:
- Invalid input data
- Duplicate entries
- Missing required fields
- Database operation failures
- Network errors

## Contributing

Please refer to our Pull Request template when submitting changes. Ensure:
- Code follows project conventions
- All features are tested
- Documentation is updated
- No breaking changes without discussion

## License

This project is developed as part of a DevOps course assignment.

## Support

For issues or questions, please create an issue in the GitHub repository.

---

**Last Updated**: November 2024
**Version**: 1.0.0
