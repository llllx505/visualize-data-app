# 🚀 Continuous Issue Monitoring - Quick Start Guide

## 📊 Monitoring System is Now Active!

Your project now has **24/7 automatic issue monitoring**. Here's how to use it:

## ⚙️ Two Ways to Monitor

### 方式 1️⃣: GitHub Actions (Automatic Hourly)

**No action needed!** 

- ✅ Automatically runs every hour
- ✅ Detects new issues within 1 hour
- ✅ Auto-classifies and responds
- ✅ Generates weekly reports

**Location**: `.github/workflows/issue-monitor.yml`

### 方式 2️⃣: Local Real-Time Monitor (Recommended)

For **real-time monitoring** while developing:

```bash
# Start the local monitor
npm run monitor

# Or directly:
node scripts/issue-monitor.js
```

**Output**:
```
🚀 Starting Issue Monitor...
📍 Repository: llllx505/visualize-data-app
⏱️  Check interval: 60s
Press Ctrl+C to stop

🤖 Issue Monitor - Continuous Monitoring
═══════════════════════════════════════════════════════
🔍 Fetching open issues...
✅ Found 2 open issues

📝 Processing Issue #1: "界面太丑了"
   Labels: ui-improvement
   Priority: medium

📊 === Monitoring Summary ===
Total open issues: 2
Processed in this cycle: 1

⏰ Next check in 60 seconds...
```

## 📋 How It Works

### Issue Detection & Classification

When someone creates a GitHub issue:

```
GitHub Issue
    ↓
15 seconds (local) or 1 hour (GitHub Actions)
    ↓
Auto-classify by keywords
    ↓
🏷️ Add labels
💬 Post response comment
📊 Generate report
```

### Automatic Label Assignment

Based on keywords in title & description:

| 关键词 | 标签 |
|-------|------|
| bug, error, crash | 🐛 `bug` |
| feature, add, implement | ✨ `enhancement` |
| slow, optimize, faster | ⚡ `performance` |
| doc, guide, readme | 📚 `documentation` |
| ui, visual, design, ugly | 🎨 `ui-improvement` |
| version, comparison | 📊 `version-comparison` |

## 🎯 Test the System

### Test 1: Quick Local Test

```bash
# Terminal 1: Start monitor
npm run monitor

# Terminal 2: Check the logs (in another terminal)
tail -f issue-monitor.log

# Terminal 3: Create a test issue on GitHub with:
# Title: "Test: This is a test issue"
# Body: "Testing the monitoring system"

# Watch: The local monitor should detect it within 60 seconds!
```

### Test 2: Create Real GitHub Issue

Go to: https://github.com/llllx505/visualize-data-app/issues

Click "New Issue" and create:

```
Title: [TEST] Monitoring system works

Body: This is a test to verify monitoring system

Expected result:
- Labels: enhancement, triage-needed
- Auto-response comment posted
- Issue logged in monitor
```

## 📊 Monitoring Dashboard

### Real-time Logs

```bash
# Watch live logs
tail -f issue-monitor.log

# View last 50 events
tail -50 issue-monitor.log

# Count processed issues
grep "Processing Issue" issue-monitor.log | wc -l
```

### State Tracking

The system remembers which issues it processed:

```bash
# Check processed issues
cat .issue-monitor-state.json | jq '.processedIssues'

# Expected output:
# ["1", "2", "3", ...]
```

## 🔧 Configuration

### Change Check Interval

Edit `scripts/issue-monitor.js`:

```javascript
const CONFIG = {
  owner: 'llllx505',
  repo: 'visualize-data-app',
  checkInterval: 30 * 1000,  // Change from 60 to 30 seconds
};
```

### Change GitHub Credentials (if using private repos)

Add to your environment or script:

```bash
export GITHUB_TOKEN=your_token_here
npm run monitor
```

## 📈 What Gets Monitored

✅ **Tracked**:
- New issues
- Issue titles and descriptions
- Labels and metadata
- Classification results
- Processing timestamps

❌ **Not Tracked**:
- Pull Requests (filtered out)
- Closed issues (only open issues)
- Comments (only issue body)

## 🎨 Customization

### Add Custom Keywords

Edit `scripts/issue-monitor.js`, find `keywords` object:

```javascript
const keywords = {
  'critical': ['urgent', 'asap', 'blocker', 'production'],  // Add custom category
  bug: ['bug', 'error', 'your new keyword'],              // Add new keyword
  // ... rest of keywords
};
```

### Add Custom Processing Logic

In `processIssue()` function:

```javascript
// After classification, add:
if (classification.labels.includes('bug')) {
  // Create automated PR
  // Send Slack notification
  // Update project board
  // Your custom logic here
}
```

## 🚨 Troubleshooting

### Monitor not detecting issues?

```bash
# Check if script is running
lsof -i :3000  # Check port

# Check for errors
cat issue-monitor.log | tail -20

# Verify config
node -e "require('./scripts/issue-monitor.js')"

# Check GitHub API access
curl https://api.github.com/repos/llllx505/visualize-data-app/issues?per_page=1
```

### Too many false positives?

Refine `keywords` in `scripts/issue-monitor.js` to be more specific.

### Want to stop monitoring?

```bash
# Press Ctrl+C in the terminal running the monitor

# Or kill the process:
pkill -f "issue-monitor.js"
```

## 📚 Files Overview

| File | Purpose |
|------|---------|
| `.github/workflows/issue-monitor.yml` | Hourly automated monitoring |
| `scripts/issue-monitor.js` | Local real-time monitor |
| `ISSUE_MONITORING.md` | Complete documentation |
| `issue-monitor.log` | Event logs |
| `.issue-monitor-state.json` | Processed issues state |

## ✅ Features Summary

- 🤖 **Automatic**: No manual setup needed
- 🚀 **Real-time**: Detects issues within 1 minute locally
- 🏷️ **Smart Classification**: 8+ categories automatically
- 💬 **Auto-Response**: Posts helpful acknowledgments
- 📊 **Reporting**: Weekly summaries and statistics
- 🔧 **Customizable**: Easy to extend with custom logic
- 📝 **Logged**: Complete audit trail
- 🔒 **Safe**: No unauthorized actions

## 🎯 Next Steps

1. **Start the monitor**:
   ```bash
   npm run monitor
   ```

2. **Create a test issue** on GitHub

3. **Watch it get processed** in real-time

4. **Customize as needed** for your workflow

## 💡 Pro Tips

✓ Run monitor in a separate terminal while developing  
✓ Keep local monitor running during development sprint  
✓ Check `issue-monitor.log` for debugging  
✓ Use GitHub Actions for backup/scheduled monitoring  
✓ Extend classification for your specific needs  

---

**System Status**: ✅ **ACTIVE**

**Monitoring Mode**: 
- 🟢 GitHub Actions: Every hour
- 🟢 Local Script: Ready to start with `npm run monitor`

**Need help?** Check [ISSUE_MONITORING.md](ISSUE_MONITORING.md) for detailed documentation.
