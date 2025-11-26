# Contributing Guide

## Team Members

| Name | Feature | Branch | Files |
|------|---------|--------|-------|
| Daniella | CREATE | create_daniella | DaniellaUtil.js, daniella.js |
| Dylan | READ | read_dylan | DylanUtil.js, dylan.js |
| Gengyue | UPDATE | update_gengyue | GengyueUtil.js, gengyue.js |
| Danish | DELETE | delete_danish | DanishUtil.js, danish.js |

## Development Workflow

### 1. Branch Strategy

Each team member works on their own feature branch:
- main - Production code
- create_daniella - CREATE feature
- read_dylan - READ feature
- update_gengyue - UPDATE feature
- delete_danish - DELETE feature

### 2. Making Changes

1. Work on your assigned branch
2. Make commits with clear messages
3. Test your changes locally
4. Push to your branch
5. Create Pull Request to main

### 3. Commit Message Format

Use conventional commit format:

```
type(scope): description

Examples:
feat(create): add student ID validation
fix(update): resolve score range bug
docs(readme): update installation steps
refactor(delete): simplify deletion logic
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- test: Adding tests
- style: Code formatting

### 4. Pull Request Process

1. Use the PR template
2. Fill in all required sections
3. Request review from team members
4. Address review comments
5. Wait for approval before merging

### 5. Code Standards

#### File Naming
- Backend utils: `[Name]Util.js` (e.g., DaniellaUtil.js)
- Frontend scripts: `[name].js` (e.g., daniella.js)

#### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Follow ESLint rules

#### Variable Naming
- Use camelCase for variables and functions
- Use PascalCase for utility module names
- Use descriptive names

### 6. Testing Requirements

Before creating a PR:
- Test your feature manually
- Verify all CRUD operations work
- Check error handling
- Test with valid and invalid inputs
- Ensure no breaking changes to other features

### 7. File Structure

```
project/
├── public/
│   ├── js/
│   │   └── [your-name].js    # Your frontend code
│   ├── index.html
│   └── styles.css
├── utils/
│   └── [YourName]Util.js     # Your backend code
└── index.js                  # Shared server file
```

### 8. API Endpoints

Each feature uses specific endpoints:
- CREATE: POST /api/students
- READ: GET /api/students, GET /api/rankings
- UPDATE: POST /api/login, GET /api/students/:id, PUT /api/students/:id
- DELETE: DELETE /api/students/:id

### 9. Data Validation

Student ID Format: YY + 4 digits + letter (a-e)
Example: 241234a

Rating Range: 0-3000 for Blitz, Rapid, Classical

Email: Must be unique and valid format

### 10. Common Issues

#### Merge Conflicts
If you encounter merge conflicts:
1. Pull latest changes from main
2. Resolve conflicts in your branch
3. Test after resolution
4. Commit and push

#### Server Port Issues
Default port: 5000
If port is in use, change in index.js

#### Database File
All data stored in: utils/students.json
Do not commit this file with test data

## Questions?

Create an issue or ask in team chat.

---

Last Updated: November 2024
