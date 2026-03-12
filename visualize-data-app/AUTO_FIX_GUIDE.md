# 🤖 自动修复系统指南

## 概述

监听系统现已支持**自动修复建议**功能。当检测到 GitHub issue 时，系统会：

1. ✅ 自动分类 issue 类型
2. 📝 生成针对性的修复建议
3. 💬 发送自动回复评论（需要 GITHUB_TOKEN）
4. 📌 标记相关标签

## 支持的 Issue 类型

### 🎨 UI 改进 (ui-improvement)

**自动建议包括：**
- 检查样式文件
- 现代化设计建议
- 响应式设计测试
- 动画和效果优化

**示例 UI Issue 被检测：**
```
📝 Processing Issue #5: "界面美化"
   Labels: ui-improvement
   Priority: medium
   🔧 生成自动修复建议...
   📨 发送自动回复...
   ✅ 回复已发送
```

**自动生成的建议评论：**
```
## 🤖 自动修复建议

### 🎨 UI 改进
- [ ] 检查 `public/index.html` 的样式
- [ ] 更新 CSS 考虑现代化设计
- [ ] 使用 gradient、shadow 等现代效果
- [ ] 测试响应式设计
```

### 🐛 Bug 修复 (bug)

**自动建议包括：**
- 如何重现问题
- 调试步骤
- 完整的修复工作流程
- Git 分支和提交规范

**示例 Bug Issue 被检测：**
```
📝 Processing Issue #4: "🧪 Test Bug: Performance issue"
   Labels: bug
   Priority: high ⚠️
   🔧 生成自动修复建议...
   ✅ 回复已发送
```

**自动生成的建议评论：**
```
### 🐛 Bug 修复步骤
1. 重现问题
2. 检查浏览器控制台，查看错误
3. 快速修复流程：
   - 创建分支 `git checkout -b fix/issue-4`
   - 进行修复
   - 提交 `git commit -m "fix: Issue #4"`
   - 创建 PR
```

### ⚡ 性能优化 (performance)

**自动建议包括：**
- API 响应时间检查
- 性能分析工具使用
- 缓存优化
- 包大小优化

### 📚 文档更新 (documentation)

**自动建议包括：**
- README 更新
- API 文档检查
- 使用示例补充

## 工作流程

### 1️⃣ Issue 创建
```
用户在 GitHub 上创建 issue
↓
Issue 标题和内容包含特定关键词
```

### 2️⃣ 自动检测和分类
```
监听脚本每 60 秒检查一次
↓
使用关键词匹配分析 issue 类型
↓
自动生成修复建议
```

### 3️⃣ 自动回复（需要认证）
```
如果配置了 GITHUB_TOKEN
↓
自动在 issue 评论中发送建议
↓
添加相关标签
```

### 4️⃣ 记录跟踪
```
Issue 标记为已处理
↓
保存到 .issue-monitor-state.json
↓
完整日志记录在 issue-monitor.log
```

## 关键词分类

系统使用以下关键词来自动分类 issue：

```javascript
bug: ['bug', 'error', 'broken', 'crash', 'fail', 'not working']
enhancement: ['feature', 'request', 'add', 'implement']
performance: ['slow', 'optimize', 'faster', 'lag']
documentation: ['doc', 'readme', 'guide', 'tutorial']
ui-improvement: ['ui', 'visual', 'style', 'design', 'ugly', 'beautiful']
question: ['how', 'why', 'what', '?']
```

## 启用自动回复（可选）

要让系统在 GitHub 上自动发布回复，需要设置 GitHub Token：

### 步骤 1: 生成 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token"
3. 选择作用域：`issues`、`contents`、`pull-requests`
4. 复制 token

### 步骤 2: 配置环境变量

```bash
export GITHUB_TOKEN=your_token_here
npm run monitor
```

### 步骤 3: 验证

- 创建新 issue 或修改现有 issue
- 60 秒内应该看到自动回复评论
- 检查日志确认：`✅ 回复已发送`

## 监听脚本日志

### 正常输出示例

```
🤖 Issue Monitor - Continuous Monitoring
═════════════════════════════════════════════════════

🔍 Fetching open issues...
✅ Found 5 open issues

📝 Processing Issue #4: "🧪 Test Bug: Performance issue"
   Labels: bug
   Priority: high
   🔧 生成自动修复建议...
   📨 发送自动回复...
   ✅ 回复已发送
   📌 标签: bug

📊 === Monitoring Summary ===
Total open issues: 5
Bugs: 1
Processed in this cycle: 5

⏰ Next check in 60 seconds...
```

### 文件位置

- **监听日志**: `issue-monitor.log`
- **状态跟踪**: `.issue-monitor-state.json`
- **脚本文件**: `scripts/issue-monitor.js`

## 自动修复不能做的事

⚠️ 当前系统**不会自动**：
- 修改代码文件
- 创建 Commits（需要手动）
- 合并 Pull Requests（需要审核）
- 部署更改

✅ 系统**会**：
- 分析问题
- 生成建议
- 发送帮助性评论
- 标记和分类

## 扩展和自定义

### 添加自定义修复建议

编辑 `scripts/issue-monitor.js`，在 `generateAutoFixComment()` 函数中添加：

```javascript
// 例如：添加自定义类别
if (labels.includes('custom-label')) {
  suggestions += '### 🔧 自定义建议\n';
  suggestions += '- [ ] 您的自定义步骤\n\n';
}
```

### 添加自动操作

在 `processIssue()` 函数中添加：

```javascript
// 例如：自动为 bug 创建分支
if (classification.labels.includes('bug')) {
  // 您的自动化逻辑
}
```

## 统计和报告

### 查看已处理的 Issues

```bash
cat .issue-monitor-state.json | jq '.processedIssues'
```

### 查看最近的日志

```bash
tail -50 issue-monitor.log
```

### 获取处理统计

```bash
grep "Processing Issue" issue-monitor.log | wc -l
grep "bug\|performance" issue-monitor.log | wc -l
```

## 常见问题

### Q: 为什么没有看到自动回复？
A: 需要配置 `GITHUB_TOKEN` 环境变量。不配置时系统会跳过回复发送。

### Q: 如何禁用某个 issue 的自动处理？
A: 在 issue 中添加 `skip-auto-fix` 标签，系统会跳过处理。

### Q: 脚本如何区分新旧 issue？
A: 系统会记录已处理的 issue ID 在 `.issue-monitor-state.json` 中。

### Q: 能改变检查间隔吗？
A: 是的，编辑 `scripts/issue-monitor.js` 中的 `CONFIG.checkInterval` 值。

## 启动监听系统

```bash
# 启动本地监听（60 秒检查一次）
npm run monitor

# 或直接使用
node scripts/issue-monitor.js
```

---

**系统状态**: ✅ **Active**  
**最后更新**: 2026-03-12  
**所有 Issues 被检测并生成自动建议** 🚀
