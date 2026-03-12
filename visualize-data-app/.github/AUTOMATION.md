# 🤖 Automated Workflow Documentation

This project uses GitHub Actions to automatically handle issues and improvements. Here's how it works:

## 📋 Workflows Overview

### 1. **Issue Handler** (`issue-handler.yml`)
**Trigger**: When an issue is created or edited

**What it does:**
- ✅ Automatically classifies issues based on keywords
- 🏷️ Adds relevant labels:
  - `bug` - for bug reports
  - `enhancement` - for feature requests
  - `performance` - for performance issues
  - `documentation` - for docs updates
  - `ui-improvement` - for UI/UX work
  - `version-comparison` - for comparison features

- 💬 Posts automated welcome comment
- 🔧 Creates bugfix branches for critical issues
- 🎯 Assigns milestones based on issue type

### 2. **Auto-Fix Issues** (`auto-fix.yml`)
**Trigger**: When issues are labeled or on schedule (Mondays at 9 AM UTC)

**What it does:**
- 🎨 **UI Improvements**: Enhances styling for UI issues
- ⚡ **Performance**: Optimizes code for performance issues
- 📚 **Documentation**: Creates/updates documentation

**Creates Pull Requests** with fixes and links to the original issue

### 3. **Version Comparison Improvements** (`version-improvements.yml`)
**Trigger**: When issues mention "version" or "comparison"

**What it does:**
- 🔍 Analyzes enhancement needs
- 📊 Identifies requested features
- 🚀 Creates enhancement branches
- 📖 Generates comparison reports
- 📚 Suggests helpful resources

## 🏷️ Label System

Our automated system recognizes these keywords:

| Keyword | Label | Action |
|---------|-------|--------|
| bug, error, not working | `bug` | Create bugfix branch |
| feature, request, enhancement | `enhancement` | Create feature PR |
| performance, slow, optimize | `performance` | Performance PR |
| documentation, docs, readme | `documentation` | Docs improvement |
| ui, visual, style | `ui-improvement` | UI enhancement |
| version, comparison | `version-comparison` | Comparison improvement |

## 🚀 How to Trigger Workflows

### Create an Issue
1. Go to Issues tab on GitHub
2. Click "New Issue"
3. Choose a template:
   - **Bug Report**
   - **Feature Request**
   - **Version Comparison Improvement**
   - **Performance Improvement**

### Examples

#### Report a Bug
```
Title: Version comparison crashes with large datasets
Body: When loading more than 1000 images, the app freezes...
```
→ Label: `bug` → Creates bugfix branch

#### Request a Feature
```
Title: Add export to CSV functionality
Body: Users need to export comparison results...
```
→ Label: `enhancement` → Creates feature branch

#### Performance Issue
```
Title: Slow histogram rendering with 10k+ data points
Body: Rendering takes 30+ seconds...
```
→ Label: `performance` → Performance optimization PR

#### Version Comparison Improvement
```
Title: Need better filtering in version comparison
Body: Would like to filter by metric ranges...
```
→ Label: `version-comparison` → Enhancement analysis

## 📊 Workflow Process

```
Issue Created
    ↓
Auto-classified by keywords
    ↓
Labels applied automatically
    ↓
Welcome comment posted
    ↓
Branch created (if applicable)
    ↓
PR created with fixes
    ↓
You review and merge
    ↓
Feature/fix deployed
```

## 🔗 GitHub Actions Files

All workflows are stored in `.github/workflows/`:

- `issue-handler.yml` - Classification and labeling
- `auto-fix.yml` - Automated improvements
- `version-improvements.yml` - Version comparison enhancements

## 💡 Tips for Using This System

1. **Be Specific**: Use clear, descriptive titles and descriptions
2. **Use Templates**: Choose the right template for your issue type
3. **Include Data**: Attach screenshots, data samples, or error logs
4. **Check Existing**: Search for similar issues before creating new ones
5. **Link Related**: Reference related issues with #123 syntax

## 🔄 Supported Milestones

Issues are automatically assigned to milestones:

| Issue Type | Milestone |
|-----------|-----------|
| Bug | `v1.1.0 - Bug Fixes` |
| Enhancement | `v1.2.0 - New Features` |
| UI Improvement | `v1.1.1 - UI Polish` |
| Performance | `v1.3.0 - Performance` |

## 📈 Monitoring Progress

1. **Issues Tab**: Track all reported issues
2. **Projects Tab**: See features in development
3. **Projects**: Organized by milestone
4. **PRs Tab**: Review proposed changes

## ⚙️ Configuration

### Environment Variables
None required! The workflows use:
- GitHub's built-in authentication
- Standard GitHub REST API
- No external service dependencies

### Permissions Required
The workflows use:
- `issues: write` - To add labels and comments
- `contents: write` - To create branches and commits
- `pull-requests: write` - To create PRs

## 🐛 Troubleshooting

### Workflow not running?
- Check workflow is enabled in `.github/workflows/`
- Verify repository has Actions enabled
- Check trigger conditions are met

### Labels not applied?
- Verify keywords match the label patterns
- Check issue body (not just title)
- Some labels are applied manually by maintainers

### Branch not created?
- Branch might already exist
- Check git permissions
- Review workflow logs for errors

## 📝 Manual Overrides

You can manually:
1. **Add labels** even if auto-classification didn't
2. **Create PRs** without waiting for automation
3. **Update milestones** for priority changes
4. **Close issues** if duplicates or resolved

## 🔄 Feedback Loop

1. **User reports issue** → Workflow processes it
2. **Maintainer reviews** → Can adjust labels/milestone
3. **PR created** → Workflow or maintainer
4. **Tests run** → Automated validation
5. **Merge** → Feature/fix deployed
6. **Issue closed** → With release notes

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Issue Templates](.github/ISSUE_TEMPLATE/)
- [Project README](README.md)

## 🎯 Key Metrics Tracked

- Issue response time
- Time to first PR
- Time to merge
- Issue types distribution
- Most requested features
- Performance improvements impact

## 🤝 Contributing to Workflows

Want to improve the workflows?

1. All workflows are in `.github/workflows/`
2. They're written in YAML format
3. Modify, test, submit PR
4. Add comments explaining changes

## 📞 Support

Have questions about the automation?
- Check this documentation first
- Search existing issues
- Create a question issue
- Comment on related issues

---

**Last Updated**: 2026-03-12
**Version**: 1.0
**Status**: Active ✅
