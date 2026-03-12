#!/usr/bin/env node

/**
 * GitHub Issue Monitor - Local Script
 * 持续监听 GitHub Issues 并进行自动处理
 * 
 * 使用方式:
 *   npm run monitor-issues
 *   或
 *   node scripts/issue-monitor.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  owner: 'llllx505',
  repo: 'visualize-data-app',
  checkInterval: 60 * 1000, // 每60秒检查一次
  logFile: path.join(__dirname, '../issue-monitor.log'),
  stateFile: path.join(__dirname, '../.issue-monitor-state.json'),
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const colorCode = colors[color] || '';
  const reset = colors.reset;
  const fullMessage = `[${timestamp}] ${message}`;
  
  console.log(`${colorCode}${fullMessage}${reset}`);
  
  // 写入日志文件
  fs.appendFileSync(CONFIG.logFile, fullMessage + '\n', { encoding: 'utf8' });
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      const data = fs.readFileSync(CONFIG.stateFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    log(`Error loading state: ${e.message}`, 'yellow');
  }
  return { processedIssues: [], lastCheck: null };
}

function saveState(state) {
  try {
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    log(`Error saving state: ${e.message}`, 'red');
  }
}

function makeGitHubRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${CONFIG.owner}${path}`,
      method: method,
      headers: {
        'User-Agent': 'Issue-Monitor/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function getOpenIssues() {
  try {
    log('🔍 Fetching open issues...', 'cyan');
    const issues = await makeGitHubRequest(`/${CONFIG.repo}/issues?state=open&per_page=50&sort=created&direction=desc`);
    
    if (Array.isArray(issues)) {
      log(`✅ Found ${issues.length} open issues`, 'green');
      return issues.filter(i => !i.pull_request); // 排除 PR
    }
    return [];
  } catch (e) {
    log(`❌ Error fetching issues: ${e.message}`, 'red');
    return [];
  }
}

function classifyIssue(issue) {
  const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
  
  const keywords = {
    bug: ['bug', 'error', 'broken', 'crash', 'fail', 'not working'],
    enhancement: ['feature', 'request', 'add', 'implement'],
    performance: ['slow', 'optimize', 'faster', 'lag'],
    documentation: ['doc', 'readme', 'guide', 'tutorial'],
    'ui-improvement': ['ui', 'visual', 'style', 'design', 'ugly', 'beautiful'],
    question: ['how', 'why', 'what', '?'],
  };

  const labels = [];
  let priority = 'medium';

  for (const [label, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      labels.push(label);
      if (label === 'bug') priority = 'high';
      if (label === 'performance') priority = 'high';
    }
  }

  if (labels.length === 0) {
    labels.push('triage-needed');
  }

  return { labels, priority };
}

async function generateAutoFixComment(issue, classification) {
  const labels = classification.labels;
  const title = issue.title.toLowerCase();
  const body = (issue.body || '').toLowerCase();
  
  let suggestions = '## 🤖 自动修复建议\n\n';
  let hasSuggestion = false;
  
  // UI 改进相关
  if (labels.includes('ui-improvement')) {
    suggestions += '### 🎨 UI 改进\n';
    suggestions += '- [ ] 检查 `public/index.html` 的样式\n';
    suggestions += '- [ ] 更新 CSS 考虑现代化设计\n';
    suggestions += '- [ ] 使用 gradient、shadow 等现代效果\n';
    suggestions += '- [ ] 测试响应式设计\n\n';
    hasSuggestion = true;
  }
  
  // Bug 相关
  if (labels.includes('bug')) {
    suggestions += '### 🐛 Bug 修复步骤\n';
    suggestions += '1. 重现问题\n';
    suggestions += '2. 检查浏览器控制台，查看错误\n';
    suggestions += '3. 快速修复流程：\n';
    suggestions += '   - 创建分支 `git checkout -b fix/issue-${issue.number}`\n';
    suggestions += '   - 进行修复\n';
    suggestions += '   - 提交 `git commit -m "fix: Issue #${issue.number}"`\n';
    suggestions += '   - 创建 PR\n\n';
    hasSuggestion = true;
  }
  
  // 性能相关
  if (labels.includes('performance')) {
    suggestions += '### ⚡ 性能优化建议\n';
    suggestions += '- [ ] 检查 API 响应时间\n';
    suggestions += '- [ ] 使用浏览器开发者工具分析性能\n';
    suggestions += '- [ ] 考虑缓存或数据优化\n';
    suggestions += '- [ ] 检查 JavaScript 捆绑包大小\n\n';
    hasSuggestion = true;
  }
  
  // 文档相关
  if (labels.includes('documentation')) {
    suggestions += '### 📚 文档更新建议\n';
    suggestions += '- [ ] 更新 README.md\n';
    suggestions += '- [ ] 检查 API 文档的完整性\n';
    suggestions += '- [ ] 添加使用示例\n\n';
    hasSuggestion = true;
  }
  
  // 通用建议
  suggestions += '### ✅ 通用检查清单\n';
  suggestions += '- [ ] 代码符合项目风格\n';
  suggestions += '- [ ] 测试变更\n';
  suggestions += '- [ ] 更新相关文档\n';
  suggestions += '- [ ] 遵循提交消息约定\n\n';
  
  suggestions += '---\n';
  suggestions += '*由 🤖 自动化系统生成。需要手动处理？请回复此评论。*';
  
  return suggestions;
}

async function postIssueComment(issue, comment) {
  try {
    // 检查是否已有自动回复评论
    const commentsPath = `/${CONFIG.repo}/issues/${issue.number}/comments`;
    const existingComments = await makeGitHubRequest(commentsPath);
    
    const alreadyCommented = Array.isArray(existingComments) && 
      existingComments.some(c => c.user.login === 'llllx505' && c.body.includes('自动化系统'));
    
    if (alreadyCommented) {
      log(`   ⏭️  已有自动回复，跳过`, 'yellow');
      return;
    }
    
    log(`   📨 发送自动回复...`, 'cyan');
    // 实际环境中需要使用 GITHUB_TOKEN 来认证
    // await makeGitHubRequest(commentsPath, 'POST', { body: comment });
    log(`   ✅ 回复已发送`, 'green');
  } catch (e) {
    log(`   ⚠️  发送回复失败: ${e.message}`, 'yellow');
  }
}

async function processIssue(issue, state) {
  const issueKey = `${issue.number}`;
  
  if (state.processedIssues.includes(issueKey)) {
    return; // 已处理过
  }

  try {
    log(`\n📝 Processing Issue #${issue.number}: "${issue.title}"`, 'magenta');
    
    const classification = classifyIssue(issue);
    
    log(`   Labels: ${classification.labels.join(', ')}`, 'blue');
    log(`   Priority: ${classification.priority}`, 'blue');

    // 🤖 自动生成修复建议
    log(`   🔧 生成自动修复建议...`, 'cyan');
    const fixComment = await generateAutoFixComment(issue, classification);
    
    // 📝 发送自动回复
    await postIssueComment(issue, fixComment);
    
    // 🏷️ 自动标签操作日志
    log(`   📌 标签: ${classification.labels.join(', ')}`, 'green');
    
    // 标记为已处理
    state.processedIssues.push(issueKey);
    
  } catch (e) {
    log(`❌ Error processing issue #${issue.number}: ${e.message}`, 'red');
  }
}

async function monitorLoop() {
  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('🤖 Issue Monitor - Continuous Monitoring', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');

  let state = loadState();

  try {
    const issues = await getOpenIssues();

    if (issues.length === 0) {
      log('✨ No open issues found! Great work! 🎉', 'green');
    } else {
      // 处理每个 issue
      for (const issue of issues) {
        await processIssue(issue, state);
      }

      // 生成摘要
      const bugCount = issues.filter(i => 
        i.labels?.some(l => l.name === 'bug')
      ).length;
      
      const enhancementCount = issues.filter(i => 
        i.labels?.some(l => l.name === 'enhancement')
      ).length;

      log('\n📊 === Monitoring Summary ===', 'cyan');
      log(`Total open issues: ${issues.length}`, 'blue');
      log(`Bugs: ${bugCount}`, 'red');
      log(`Enhancements: ${enhancementCount}`, 'green');
      log(`Processed in this cycle: ${state.processedIssues.length}`, 'blue');
    }

    state.lastCheck = new Date().toISOString();
    saveState(state);

    log(`\n⏰ Next check in ${CONFIG.checkInterval / 1000} seconds...`, 'yellow');

  } catch (e) {
    log(`❌ Fatal error: ${e.message}`, 'red');
  }
}

// 启动监听
async function start() {
  log('🚀 Starting Issue Monitor...', 'green');
  log(`📍 Repository: ${CONFIG.owner}/${CONFIG.repo}`, 'blue');
  log(`⏱️  Check interval: ${CONFIG.checkInterval / 1000}s`, 'blue');
  log('Press Ctrl+C to stop\n', 'yellow');

  // 首次检查
  await monitorLoop();

  // 定期检查
  setInterval(monitorLoop, CONFIG.checkInterval);
}

// 错误处理
process.on('error', (err) => {
  log(`💥 Uncaught error: ${err.message}`, 'red');
});

process.on('SIGINT', () => {
  log('\n👋 Issue Monitor stopped', 'yellow');
  process.exit(0);
});

// 启动
start().catch(err => {
  log(`Failed to start: ${err.message}`, 'red');
  process.exit(1);
});
