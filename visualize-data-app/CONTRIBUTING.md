# Contributing Guidelines

Thank you for your interest in contributing to the **Data Visualizer + QC** project! 🎉

## 📋 What We're Looking For

We welcome issues, suggestions, and improvements in the following areas:

- **Bug Reports**: Problems or unexpected behavior
- **Feature Requests**: New features or enhancements
- **UI/UX Improvements**: Visual updates or usability enhancements
- **Performance Optimizations**: Speed improvements or resource optimization
- **Documentation**: Better guides, examples, or clarifications
- **Version Comparison Enhancements**: Improvements to the core comparison functionality

## 🐛 Reporting Bugs

When reporting a bug, please include:

1. **Clear Title**: A concise description of the issue
2. **Steps to Reproduce**: Detailed steps to recreate the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - OS (macOS, Linux, Windows)
   - Node.js version
   - Browser (if web-related)
6. **Screenshots/Data**: Attach images or sample data if relevant

### Example Bug Report
```
Title: Version comparison table not displaying score values

Steps to reproduce:
1. Load the app with data containing result_v1 and result_v2
2. Scroll to "Version Performance Comparison" section
3. Notice score values appear empty

Expected: All metrics should display numeric values
Actual: Score column shows N/A

Environment: macOS 13, Node.js 18, Chrome 120
```

## ✨ Suggesting Features

When suggesting a feature:

1. **Title**: Clear feature name
2. **Description**: What should this feature do?
3. **Use Case**: Why would this be useful?
4. **Example**: How would users interact with it?
5. **Priority**: Nice-to-have or critical?

### Example Feature Request
```
Title: Add export functionality for comparison reports

Description:
Allow users to export version comparison results as CSV or PDF

Use Case:
Users need to share comparison results with team members

Example:
- Add "Export Report" button
- Formats: CSV, PDF, JSON
- Include all metrics and statistics

Priority: Medium (nice-to-have but valuable)
```

## 🎨 UI/UX Improvements

For visual improvements:

1. **Screenshot**: Before and after (if possible)
2. **Problem**: What's the usability issue?
3. **Solution**: Proposed improvements
4. **Rationale**: Why is this better?

## ⚡ Performance Issues

For performance concerns:

1. **Symptom**: What's slow or unresponsive?
2. **Measurement**: How do you measure the issue? (e.g., "takes 5s to load 1000 images")
3. **Impact**: How does this affect users?
4. **Environment**: Browser, data size, etc.

## 📚 Documentation Requests

Help us improve our docs by:

1. **Identifying**: What's missing or unclear?
2. **Suggesting**: What should be covered?
3. **Examples**: Code samples or use cases?

## 🚀 Version Comparison Enhancements

We're continuously improving the version comparison feature. Suggestions like:

- New comparison metrics
- Advanced filtering options
- Enhanced visualizations
- Export capabilities
- Real-time collaboration features

...are all welcome!

## 🏗️ Development Setup

Want to contribute code?

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/visualize-data-app.git
   cd visualize-data-app
   ```

3. **Install** dependencies:
   ```bash
   cd visualize-data-app
   npm install
   ```

4. **Start** development server:
   ```bash
   npm start
   ```

5. **Make** your changes in `public/app.js` or `server.js`

6. **Test** locally at http://localhost:3000

7. **Commit** with meaningful messages:
   ```bash
   git commit -m "fix: issue description" 
   # or
   git commit -m "feat: new feature description"
   ```

8. **Push** to your fork and **create a Pull Request**

## 📖 Project Structure

```
visualize-data-app/
├── public/
│   ├── index.html          # Main HTML interface
│   ├── app.js              # Frontend logic
│   ├── images_data/        # Sample images
│   └── styles/             # CSS (if added)
├── server.js               # Express.js backend
├── package.json            # Dependencies
├── README.md               # Project overview
└── .github/
    └── workflows/          # GitHub Actions automation
```

## 🤖 Automated Workflow

Our GitHub Actions automatically:

1. **Classify** issues based on keywords
2. **Add labels** (bug, enhancement, ui-improvement, etc.)
3. **Create branches** for bug fixes
4. **Generate documentation** updates
5. **Track progress** in milestones

## 💬 Communication

- Issues: Use GitHub Issues for feature requests and bug reports
- Discussions: Use GitHub Discussions for questions and ideas
- Pull Requests: Link related issues in PR descriptions

### Issue Labeling Guide

Our auto-labeling system recognizes:

| Keyword | Label |
|---------|-------|
| bug, error, not working | `bug` |
| feature, request, enhancement | `enhancement` |
| performance, slow, optimize | `performance` |
| documentation, docs, readme | `documentation` |
| ui, visual, style | `ui-improvement` |
| version, comparison | `version-comparison` |

## ✅ Code Guidelines

- **Style**: Follow existing code patterns
- **Variables**: Use meaningful, descriptive names
- **Comments**: Explain complex logic
- **Testing**: Test locally before submitting
- **Commits**: Use clear, descriptive messages

### Good Commit Messages

```
# Feature
feat: add export to CSV functionality

# Bug fix
fix: version comparison table not displaying scores

# Documentation
docs: update API endpoint documentation

# Refactor
refactor: simplify version aggregation logic

# Performance
perf: optimize data filtering for large datasets
```

## 🎯 What Happens Next

1. **Acknowledgment**: We'll acknowledge your issue within 48 hours
2. **Triage**: Issues are classified and prioritized
3. **Discussion**: We may ask clarifying questions
4. **Development**: Issues are assigned to team members
5. **Implementation**: Changes are made in feature branches
6. **Review**: Code review and testing
7. **Merge**: Approved changes are merged to main
8. **Release**: Changes are included in next release

## 📝 Issue Templates

When creating an issue, we provide templates for:

- Bug Report
- Feature Request
- Performance Improvement
- Documentation Update

Please use the appropriate template when available!

## 🙏 Thank You!

Your contributions help make this project better for everyone. We truly appreciate your time and effort!

---

**Have questions?** Feel free to open a discussion or comment on an existing issue.

**Ready to contribute?** Start by exploring [open issues](../../issues) or proposing something new!

Happy coding! 🚀
