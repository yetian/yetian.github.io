/**
 * AI Agent 安装决策与安全指南
 * 核心逻辑脚本
 */

// 检测当前语言
const currentLang = document.documentElement.lang || 'zh-CN';
const isEnglish = currentLang.startsWith('en');

// 翻译文本
const i18n = {
    // 评分标签
    scoreLabel: isEnglish ? 'pts' : '分',
    notApplicable: isEnglish ? 'N/A' : 'N/A',

    // 目标
    goalCode: isEnglish ? 'Develop App / Write Code' : '开发 App / 写代码',
    goalAutomation: isEnglish ? 'Automate Web Tasks' : '自动化操作网页/任务',

    // 实现方式
    implAgent: isEnglish ? 'Use AI Agent' : '使用 AI Agent',
    implExpert: isEnglish ? 'Seek Expert Help' : '寻求专家帮助',
    implTools: isEnglish ? 'Use Existing Tools' : '使用现有工具',

    // 环境
    envMain: isEnglish ? 'Main Work Computer' : '主力办公电脑',
    envIsolated: isEnglish ? 'Isolated Environment (Docker/VM)' : '隔离环境 (Docker/虚拟机)',

    // 审计
    auditYes: isEnglish ? '具备' : '具备',
    auditNo: isEnglish ? 'Not familiar' : '不太熟悉',

    // 成本
    costYes: isEnglish ? 'Set' : '已设置',
    costNo: isEnglish ? 'Not set' : '未设置',

    // 预算
    budgetLow: isEnglish ? 'Low Budget' : '预算有限',
    budgetMedium: isEnglish ? 'Medium Budget' : '预算适中',
    budgetHigh: isEnglish ? 'High Budget' : '预算充足',

    // 复杂度
    complexityLow: isEnglish ? 'Simple Task' : '简单任务',

    // 安全评估相关
    noSecurityScore: isEnglish ? 'This option does not require a security assessment' : '此方案不需要进行安全评估',
    complexityMedium: isEnglish ? 'Medium Complexity' : '中等复杂度',
    complexityHigh: isEnglish ? 'Complex Task' : '较复杂任务',

    // Q6 标题和描述
    q6BudgetTitle: isEnglish ? "What's your project budget?" : '你的项目预算范围？',
    q6BudgetDesc: isEnglish ? 'This helps recommend suitable expert services' : '这有助于推荐合适的专家服务',
    q6ComplexityTitle: isEnglish ? "What's your task complexity?" : '你的任务复杂度？',
    q6ComplexityDesc: isEnglish ? 'This helps recommend suitable tools' : '这有助于推荐合适的工具',

    // 预算文字
    budgetTextLow: isEnglish ? 'Low Budget' : '预算有限',
    budgetTextMedium: isEnglish ? 'Medium Budget' : '预算适中',
    budgetTextHigh: isEnglish ? 'High Budget' : '预算充足',

    // 专家建议标题
    expertTitle: isEnglish ? '👨‍💼 Recommendation: Seek Expert Help' : '👨‍💼 推荐: 寻求专家帮助',
    expertDesc: isEnglish
        ? `Based on your needs (${isEnglish ? 'Low Budget' : '预算有限'}), we recommend seeking professional developer help. Experts can provide customized solutions and reduce technical risks.`
        : `根据您的需求（${isEnglish ? 'Low Budget' : '预算有限'}），建议您寻求专业开发者的帮助。专家可以提供定制化的解决方案，降低技术风险。`,

    // 专家建议 - 低预算
    expertLowTitle: isEnglish ? 'Low Budget Suggestions:' : '预算有限建议:',
    expertLowSuggestions: isEnglish
        ? '<li>Seek free help from tech communities (e.g., V2EX, GitHub Issues)</li><li>Use open source project support channels</li><li>Find students or junior developers for affordable consulting</li>'
        : '<li>考虑加入技术社区寻求免费帮助（如 V2EX、GitHub Issues）</li><li>使用开源项目的免费支持渠道</li><li>寻找学生或新手开发者提供低价咨询</li>',

    // 专家建议 - 中等预算
    expertMediumTitle: isEnglish ? 'Medium Budget Suggestions:' : '预算适中建议:',
    expertMediumSuggestions: isEnglish
        ? '<li>Hire freelancers on Upwork, Freelancer, etc.</li><li>Contact tech consulting companies for quotes</li><li>Use Codementor for hourly expert consultation</li>'
        : '<li>在 Upwork、Freelancer 等平台聘请自由开发者</li><li>联系技术咨询公司获取报价</li><li>使用 Codementor 等平台按小时咨询专家</li>',

    // 专家建议 - 高预算
    expertHighTitle: isEnglish ? 'High Budget Suggestions:' : '预算充足建议:',
    expertHighSuggestions: isEnglish
        ? '<li>Hire professional development teams or tech consultants</li><li>Use enterprise-level technical support services</li><li>Consider customized solutions</li>'
        : '<li>聘请专业开发团队或技术顾问</li><li>使用企业级技术支持服务</li><li>考虑定制化的解决方案</li>',

    // 工具建议标题
    toolsTitle: isEnglish ? '🛠️ Recommendation: Use Existing Tools' : '🛠️ 推荐: 使用现有工具',
    toolsDesc: isEnglish
        ? `Based on your task complexity (${isEnglish ? 'Simple Task' : '简单任务'}), we recommend using existing no-code/low-code tools.`
        : `根据您的任务复杂度（${isEnglish ? 'Simple Task' : '简单任务'}），建议使用现有的无代码/低代码工具。`,

    // 工具建议 - 简单
    toolsLowTitle: isEnglish ? 'Simple Task Suggestions:' : '简单任务建议:',
    toolsLowSuggestions: isEnglish
        ? '<li>Use Zapier or Make (Integromat) for workflow automation</li><li>Try no-code platforms like Airtable or Notion</li><li>Use browser extensions for repetitive tasks</li>'
        : '<li>使用 Zapier 或 Make (Integromat) 进行工作流自动化</li><li>尝试 Airtable 或 Notion 等无代码平台</li><li>使用浏览器扩展处理重复性任务</li>',

    // 工具建议 - 中等
    toolsMediumTitle: isEnglish ? 'Medium Complexity Suggestions:' : '中等复杂度建议:',
    toolsMediumSuggestions: isEnglish
        ? '<li>Use Bubble or Glide for app development</li><li>Try Microsoft Power Apps or Google AppSheet</li><li>Consider using API integration services</li>'
        : '<li>使用 Bubble 或 Glide 进行应用开发</li><li>尝试 Microsoft Power Apps 或 Google AppSheet</li><li>考虑使用 API 集成服务</li>',

    // 工具建议 - 复杂
    toolsHighTitle: isEnglish ? 'Complex Task Suggestions:' : '较复杂任务建议:',
    toolsHighSuggestions: isEnglish
        ? '<li>Consider low-code platforms with more customization</li><li>Use n8n for self-hosted automation</li><li>Hire a developer for one-time customization</li>'
        : '<li>考虑具有更多定制化的低代码平台</li><li>使用 n8n 进行自托管自动化</li><li>聘请开发者进行一次性定制</li>',

    // 评分等级
    scoreHigh: isEnglish ? 'High' : '高',
    scoreMedium: isEnglish ? 'Medium' : '中',
    scoreLow: isEnglish ? 'Low' : '低',

    // 推荐
    recClaudeCode: isEnglish ? 'Claude Code - Focus on code development, debugging, and refactoring' : 'Claude Code - 专注于代码开发、调试和重构',
    recOpenClaw: isEnglish ? 'OpenClaw - Focus on web automation and task execution' : 'OpenClaw - 专注于网页自动化和任务执行',

    // Agent 推荐详情
    agentClaudeTitle: isEnglish ? '🤖 Recommendation: Claude Code' : '🤖 推荐: Claude Code',
    agentClaudeDesc: isEnglish
        ? "Based on your needs, <strong>Claude Code</strong> is the best choice. It focuses on code development, debugging, and refactoring, can understand project context and provide intelligent code suggestions. Especially suitable for writing applications, fixing bugs, and refactoring code."
        : "根据您的需求，<strong>Claude Code</strong> 是最佳选择。它专注于代码开发、调试和重构，能够理解项目上下文并提供智能代码建议。特别适合编写应用程序、修复 bug 和重构代码。",
    agentOpenClawTitle: isEnglish ? '🔄 Recommendation: OpenClaw' : '🔄 推荐: OpenClaw',
    agentOpenClawDesc: isEnglish
        ? "Based on your needs, <strong>OpenClaw</strong> is the best choice. It is designed for web automation and task execution, can simulate mouse operations, fill forms, and extract data. Suitable for automation scenarios that need to interact with web interfaces."
        : "根据您的需求，<strong>OpenClaw</strong> 是最佳选择。它专为网页自动化和任务执行设计，可以模拟鼠标操作、填写表单、提取数据。适合需要与网页界面交互的自动化场景。",

    // 低安全评分建议
    lowScoreTitle: isEnglish
        ? '⚠️ Security Risk Too High: Not Recommended'
        : '⚠️ 安全风险过高：不建议使用',
    lowScoreDesc: isEnglish
        ? 'Based on your security assessment results (Score: <strong style="color: #f5222d;">${scoreData.score} pts</strong>), your current security risk is too high. It is not recommended to use AI Agent directly.'
        : '根据您的安全评估结果（综合评分：<strong style="color: #f5222d;">${scoreData.score} 分</strong>），您当前的安全风险过高，不建议直接使用 AI Agent。',
    lowScoreIssues: isEnglish ? 'Your environment has the following issues:' : '您的环境配置存在以下问题：',
    lowScoreSuggestions: isEnglish ? 'Recommended approaches:' : '建议方案：',
    lowScoreOption1: isEnglish ? 'Seek professional security expert help to configure a secure environment' : '寻求专业安全专家帮助，由专家协助配置安全环境',
    lowScoreOption2: isEnglish ? 'Use web-based AI services (like Claude Web, ChatGPT) to avoid local installation' : '使用网页版 AI 服务（如 Claude Web、ChatGPT 等），避免本地安装',
    lowScoreOption3: isEnglish ? 'Resolve the above security issues before considering local AI Agent' : '先解决上述安全问题后，再考虑使用本地 AI Agent',
    recExpert: isEnglish ? 'Seek Expert Help' : '寻求专家帮助',
    recTools: isEnglish ? 'Use Existing Tools' : '使用现有工具',

    // 不推荐
    notRecommendedTitle: isEnglish ? '⚠️ Not Recommended - Security Risk Too High' : '⚠️ 不建议使用 - 安全风险过高',
    notRecommendedScore: isEnglish ? 'Your security score' : '您的安全评分为',
    notRecommendedIssues: isEnglish ? 'Your configuration has the following issues:' : '您的环境配置存在以下问题：',
    notRecommendedSuggestions: isEnglish ? 'Recommended approaches:' : '建议方案：',
    notRecommendedOption1: isEnglish ? 'Seek professional security expert help to configure a secure environment' : '寻求专业安全专家帮助，由专家协助配置安全环境',
    notRecommendedOption2: isEnglish ? 'Use web-based AI services (like Claude Web, ChatGPT) to avoid local installation' : '使用网页版 AI 服务（如 Claude Web、ChatGPT 等），避免本地安装',
    notRecommendedOption3: isEnglish ? 'Resolve the above security issues before considering local AI Agent' : '先解决上述安全问题后，再考虑使用本地 AI Agent',

    // 警告
    envWarning: isEnglish ? 'Warning: Running AI Agent on main work computer poses security risks. Please follow the security recommendations below.' : '警告: 在主力电脑上运行 AI Agent 存在安全风险，请务必按照以下安全建议操作。',

    // PDF标题
    pdfTitle: isEnglish ? 'AI Agent Installation Decision & Security Report' : 'AI Agent 安装决策与安全报告',
    pdfYourChoices: isEnglish ? 'Your Choices' : '您的选择',
    pdfUseGoal: isEnglish ? 'Use Goal' : '使用目标',
    pdfImplementation: isEnglish ? 'Implementation' : '实现方式',
    pdfRecommendation: isEnglish ? 'Recommendation' : '推荐方案',
    pdfEnvironment: isEnglish ? 'Environment Configuration' : '环境配置',
    pdfRuntime: isEnglish ? 'Runtime Environment' : '运行环境',
    pdfAuditAbility: isEnglish ? 'Code Audit Ability' : '代码审计能力',
    pdfAPILimit: isEnglish ? 'API Limit' : 'API 限额',
    pdfSecurityScore: isEnglish ? 'Security Score' : '安全评分',
    pdfSecurityWarnings: isEnglish ? 'Security Warnings' : '安全警告',
    pdfActionItems: isEnglish ? 'Recommended Actions' : '建议行动项',
    pdfRecommendationDetails: isEnglish ? 'Recommendation Details' : '推荐方案详情',
    pdfSecurityAlerts: isEnglish ? 'Security Alerts' : '安全警示',
    pdfFooter: isEnglish ? '— AI Agent Installation Decision & Security Guide —' : '— AI Agent 安装决策与安全指南 —',
    pdfRef: isEnglish ? 'References: ' : '更多安全参考：',

    // 行动建议
    actionRegularUpdate: isEnglish ? 'Regularly update AI Agent to latest version' : '定期更新 AI Agent 到最新版本',
    actionLogAudit: isEnglish ? 'Enable logging and audit for all operations' : '启用日志审计，记录所有执行的操作',
    actionSensitiveInfo: isEnglish ? 'Do not enter sensitive info (passwords, API keys) in AI Agent sessions' : '不要在 AI Agent 会话中输入敏感信息',
    actionMigrateEnv: isEnglish ? 'Consider migrating to Docker or VM environment' : '优先考虑迁移到 Docker 或虚拟机隔离环境',
    actionDedicatedBrowser: isEnglish ? 'Use dedicated browser profile to avoid cookie leaks' : '使用专用浏览器配置，避免 Cookie 泄露',
    actionBackup: isEnglish ? 'Regularly backup isolated environment snapshots' : '定期备份隔离环境快照',
    actionLimitNetwork: isEnglish ? 'Limit network access to necessary domains only' : '限制网络访问权限，仅允许必要域名',
    actionTestFirst: isEnglish ? 'Test scripts in a test environment before production' : '在正式使用前，先在测试环境验证脚本行为',
    actionSeekHelp: isEnglish ? 'Seek experienced developers to review automation scripts' : '寻求有经验开发者协助审核自动化脚本',
    actionReviewCode: isEnglish ? 'Regularly review AI-generated code and operations' : '定期审查 AI Agent 生成的代码和操作',
    actionSetLimit: isEnglish ? 'Set up daily API spending limit in provider console' : '立即在 API 提供商控制台设置每日消费限额',
    actionEnableAlert: isEnglish ? 'Enable billing alerts and notifications' : '启用费用提醒通知',
    actionChooseExpert: isEnglish ? 'Choose appropriate expert service channel based on budget' : '根据预算选择合适的专家服务渠道',
    actionVerifyExpert: isEnglish ? 'Verify expert credentials before signing contract' : '在签订合同前验证专家资质',
    actionDefineRequirements: isEnglish ? 'Define clear project requirements and deliverables' : '明确项目需求和交付标准',
    actionResearchTools: isEnglish ? 'Research suitable existing tools or services' : '调研适合的现有工具或服务',
    actionEvaluateLearning: isEnglish ? 'Evaluate tools learning curve and maintenance costs' : '评估工具的学习成本',
    actionConsiderSupport: isEnglish ? 'Consider long-term support and maintenance' : '考虑长期维护和支持',

    // 安全警示 - PDF
    pdfAlertConfig: isEnglish ? 'Security Issues from Misconfiguration' : '错误配置导致的安全问题',
    pdfAlertNetwork: isEnglish ? 'Network Interface Exposure: Bind to 127.0.0.1, use firewall rules' : '网络接口暴露: 强制绑定到 127.0.0.1，使用防火墙规则',
    pdfAlertCredential: isEnglish ? 'Sensitive Credential Leak: Use secret management services, avoid hardcoding' : '敏感凭证泄露: 使用密钥管理服务，避免硬编码',
    pdfAlertPermission: isEnglish ? 'Excessive Permissions: Follow least privilege principle' : '权限过度开放: 遵循最小权限原则',
    pdfAlertSupply: isEnglish ? 'Supply Chain Security Issues' : '供应链安全问题',
    pdfAlertMalicious: isEnglish ? 'Malicious Packages: Download from official repos, verify GPG signatures' : '恶意安装包: 仅从官方仓库下载，验证 GPG 签名',
    pdfAlertDependency: isEnglish ? 'Dependency Chain Attack: Update dependencies, use security scanners' : '依赖链攻击: 定期更新依赖，使用安全扫描工具',
    pdfAlertPrompt: isEnglish ? 'Prompt Injection: Use separate browser profile, review sessions' : '提示词注入: 使用独立浏览器配置，定期审查会话',
    pdfAlertCognitive: isEnglish ? 'Issues from Misconceptions' : '错误认知导致的问题',
    pdfAlertUnderestimate: isEnglish ? 'Underestimating Risk: Understand AI Agent capabilities' : '低估技术风险: 充分了解 AI Agent 的能力边界',
    pdfAlertOvertrust: isEnglish ? 'Over-trusting: Always review AI-generated content' : '过度信任自动化: 始终审查 AI 生成的代码和操作',
    pdfAlertPrivacy: isEnglish ? 'Ignoring Privacy: Avoid entering sensitive data' : '忽视数据隐私: 避免输入敏感数据',
    pdfAlertCost: isEnglish ? 'Cost-Related Issues' : '成本认知导致的问题',
    pdfAlertAPI: isEnglish ? 'API Cost Overrun: Set daily/monthly spending limits' : 'API 费用失控: 设置每日/每月消费上限',
    pdfAlertHidden: isEnglish ? 'Hidden Costs: Evaluate total cost of ownership' : '隐性成本忽视: 评估总拥有成本',
    pdfAlertIncident: isEnglish ? 'Security Incidents: Include security in budget planning' : '安全事故成本: 将安全投入纳入预算规划',

    // 安全评分详情
    detailEnvMain: isEnglish ? 'Main work computer installation' : '主力办公电脑安装',
    detailEnvIsolated: isEnglish ? 'Isolated environment (Docker/VM)' : '隔离环境安装 (Docker/VM)',
    detailAuditYes: isEnglish ? 'Has code audit capability' : '具备代码审计能力',
    detailAuditNo: isEnglish ? 'Lacks code audit capability' : '不具备代码审计能力',
    detailCostYes: isEnglish ? 'API limit set' : '已设置 API 限额',
    detailCostNo: isEnglish ? 'API limit not set' : '未设置 API 限额',
    detailEnvMainNeg: isEnglish ? 'Main work computer installation' : '主力办公电脑安装',
    detailAuditNoNeg: isEnglish ? 'Lacks code audit capability' : '不具备代码审计能力',
    detailCostNoNeg: isEnglish ? 'API limit not set' : '未设置 API 限额',

    // 警告详情
    warnHighEnv: isEnglish ? 'High Risk: Main computer installation' : '高风险: 主力机安装',
    warnHighEnvContent: isEnglish ? 'Running AI Agent on main computer has high security risks. Consider using isolated environment.' : '在主力电脑上直接运行 AI Agent 存在较高安全风险，建议使用隔离环境。',
    warnMedAudit: isEnglish ? 'Medium Risk: Lack of audit capability' : '中等风险: 缺乏代码审计',
    warnMedAuditContent: isEnglish ? 'Use under experienced guidance or choose safer managed services.' : '建议在有经验的人员指导下使用，或选择更安全的托管服务。',
    warnCost: isEnglish ? 'Attention: API cost control' : '需关注: API 成本控制',
    warnCostContent: isEnglish ? 'Strongly recommend setting daily API limit to prevent unexpected billing.' : '强烈建议设置 API 每日限额，防止意外超额导致财务损失。',

    // 建议项
    recommendationYes: isEnglish ? 'Yes' : '可以',
    recommendationNo: isEnglish ? 'No' : '不太熟悉',
    recommendationCanAudit: isEnglish ? 'Can understand code logic and risks' : '能看懂代码逻辑和潜在风险',
    recommendationNeedMore: isEnglish ? 'Need more security measures' : '需要更多安全防护措施',
    recommendationHaveLimit: isEnglish ? 'Has daily spending limit' : '有每日消费上限保护',
    recommendationNeedConfig: isEnglish ? 'Need to configure' : '需要提醒配置'
};

// 动态翻译辅助函数
function getBudgetText(budget) {
    switch(budget) {
        case 'low': return i18n.budgetTextLow;
        case 'medium': return i18n.budgetTextMedium;
        case 'high': return i18n.budgetTextHigh;
        default: return isEnglish ? 'Not specified' : '未指定';
    }
}

function getComplexityText(complexity) {
    switch(complexity) {
        case 'low': return i18n.complexityLow;
        case 'medium': return i18n.complexityMedium;
        case 'high': return i18n.complexityHigh;
        default: return isEnglish ? 'Not specified' : '未指定';
    }
}

function getExpertSuggestions(budget) {
    const suggestions = {
        low: {
            title: i18n.expertLowTitle,
            items: i18n.expertLowSuggestions
        },
        medium: {
            title: i18n.expertMediumTitle,
            items: i18n.expertMediumSuggestions
        },
        high: {
            title: i18n.expertHighTitle,
            items: i18n.expertHighSuggestions
        }
    };
    return suggestions[budget] || suggestions.low;
}

function getToolsSuggestions(complexity) {
    const suggestions = {
        low: {
            title: i18n.toolsLowTitle,
            items: i18n.toolsLowSuggestions
        },
        medium: {
            title: i18n.toolsMediumTitle,
            items: i18n.toolsMediumSuggestions
        },
        high: {
            title: i18n.toolsHighTitle,
            items: i18n.toolsHighSuggestions
        }
    };
    return suggestions[complexity] || suggestions.low;
}

// 状态管理
const state = {
    currentStep: 0,
    isAgentPath: true, // true = code/automation (需要做安全评估), false = expert/tools
    answers: {
        q1: null, // 目标: 'code' | 'automation' | 'expert' | 'tools'
        q2: null, // 实现方式: 'agent' | 'expert' | 'tools'
        q3: null, // 环境: 'main' | 'isolated'
        q4: null, // 审计: 'yes' | 'no'
        q5: null, // 成本: 'yes' | 'no'
        q6: null  // 预算/复杂度: 'low' | 'medium' | 'high'
    }
};

// 卡片元素引用
const cards = {
    welcome: document.getElementById('welcomeCard'),
    q1: document.getElementById('q1Card'),
    q2: document.getElementById('q2Card'),
    q3: document.getElementById('q3Card'),
    q4: document.getElementById('q4Card'),
    q5: document.getElementById('q5Card'),
    q6: document.getElementById('q6Card'),
    result: document.getElementById('resultCard')
};

// 进度条元素
const progressFill = document.getElementById('progressFill');
const steps = document.querySelectorAll('.progress-steps .step');

/**
 * 显示指定卡片，隐藏其他卡片
 */
function showCard(cardId) {
    // 隐藏所有卡片
    Object.values(cards).forEach(card => {
        if (card) {
            card.classList.add('hidden');
            card.classList.remove('fade-in');
        }
    });

    // 显示目标卡片
    const targetCard = cards[cardId];
    if (targetCard) {
        targetCard.classList.remove('hidden');
        // 触发重绘
        targetCard.offsetHeight;
        targetCard.classList.add('fade-in');
    }
}

/**
 * 更新进度条
 */
function updateProgress(step) {
    const maxStep = state.isAgentPath ? 5 : 2; // Agent路径5步，其他路径2步
    const progress = (step / maxStep) * 100;
    progressFill.style.width = `${progress}%`;

    // 更新步骤指示器
    steps.forEach((el, index) => {
        const stepNum = parseInt(el.dataset.step);
        if (state.isAgentPath) {
            // Agent 路径: 0->1->2->3->4->5->6
            if (stepNum <= step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        } else {
            // 其他路径: 0->1->2->6 (跳过2-5)
            if (stepNum === 0 || stepNum === 1 || stepNum === 2 || stepNum === 6) {
                if (step === 0) {
                    el.classList.toggle('active', stepNum === 0);
                } else if (step === 1) {
                    el.classList.toggle('active', stepNum <= 1);
                } else if (step >= 2) {
                    el.classList.add('active');
                }
            } else {
                el.classList.remove('active');
            }
        }
    });
}

/**
 * 开始评估
 */
function startQuiz() {
    state.currentStep = 1;
    state.isAgentPath = true;
    updateProgress(1);
    showCard('q1');
}

/**
 * 选择选项
 */
function selectOption(question, value) {
    // 保存答案
    state.answers[`q${question}`] = value;

    // 根据问题处理流程
    if (question === 1) {
        // Q1: 目标选择 -> 总是进入 Q2 (实现方式)
        state.currentStep = 2;
        updateProgress(2);
        showCard('q2');
    } else if (question === 2) {
        // Q2: 实现方式选择
        if (value === 'agent') {
            // 使用 AI Agent 路径 -> 进入 Q3 (环境)
            state.isAgentPath = true;
            state.currentStep = 3;
            updateProgress(3);
            showCard('q3');
        } else {
            // 专家帮助/普通工具路径 -> 进入 Q6 (预算/复杂度)
            state.isAgentPath = false;
            state.currentStep = 3;
            updateProgress(3);

            // 根据选择更新 Q6 的标题
            const q6Title = document.getElementById('q6Title');
            const q6Desc = document.getElementById('q6Desc');

            if (value === 'expert') {
                q6Title.textContent = i18n.q6BudgetTitle;
                q6Desc.textContent = i18n.q6BudgetDesc;
            } else {
                q6Title.textContent = i18n.q6ComplexityTitle;
                q6Desc.textContent = i18n.q6ComplexityDesc;
            }

            showCard('q6');
        }
    } else if (question >= 3 && question <= 5 && state.isAgentPath) {
        // Agent 路径的 Q3-Q5
        const nextStep = question + 1;
        if (nextStep <= 5) {
            state.currentStep = nextStep;
            updateProgress(nextStep);
            showCard(`q${nextStep}`);
        } else {
            // Q5 完成后显示结果
            state.currentStep = 6;
            updateProgress(6);
            showResult();
        }
    } else if (question === 6 && !state.isAgentPath) {
        // Expert/Tools 路径的 Q6
        state.currentStep = 6;
        updateProgress(6);
        showResult();
    }
}

/**
 * 显示结果
 */
function showResult() {
    showCard('result');
    generateResult();
}

/**
 * 生成结果内容
 */
function generateResult() {
    const { q1, q2, q3, q4, q5, q6 } = state.answers;
    const securitySection = document.getElementById('securitySection');
    const actionItems = document.getElementById('actionItems');

    if (q2 === 'agent') {
        // AI Agent 路径 - 显示安全评估
        securitySection.style.display = 'block';
        actionItems.style.display = 'block';

        const scoreData = calculateSecurityScore(q3, q4, q5);

        // 检查安全评分是否太低
        if (scoreData.score < 40) {
            // 安全评分太低，修改建议
            generateLowScoreRecommendation(q1, scoreData);
        } else {
            generateAgentRecommendation(q1, q3);
        }

        displaySecurityScore(scoreData);
        generateAgentActionItems(q3, q4, q5);
    } else if (q2 === 'expert') {
        // 专家帮助路径 - 隐藏安全评估
        securitySection.style.display = 'none';
        actionItems.style.display = 'none';
        generateExpertRecommendation(q6);
    } else if (q2 === 'tools') {
        // 普通工具路径 - 隐藏安全评估
        securitySection.style.display = 'none';
        actionItems.style.display = 'none';
        generateToolsRecommendation(q6);
    }
}

/**
 * 生成低安全评分的建议
 */
function generateLowScoreRecommendation(goal, scoreData) {
    const container = document.getElementById('recommendation');
    const agentName = goal === 'code' ? 'Claude Code' : 'OpenClaw';
    const scoreText = isEnglish ? `Your security score (${scoreData.score} pts)` : `综合评分：${scoreData.score} 分`;
    const issuesText = isEnglish ? 'Your configuration has the following issues:' : '您的环境配置存在以下问题：';
    const suggestionsText = isEnglish ? 'Recommended approaches:' : '建议方案：';

    let content = `
        <h3>⚠️ ${isEnglish ? 'Not Recommended - Security Risk Too High' : '安全风险过高：不建议使用 ' + agentName}</h3>
        <p>
            ${isEnglish ? 'Based on your security assessment results,' : '根据您的安全评估结果（'}
            <strong style="color: var(--accent-red);">${scoreText}</strong>），
            ${isEnglish ? 'your current security risk is too high. It is not recommended to use AI Agent directly.' : '您当前的安全风险过高，不建议直接使用 AI Agent。'}
        </p>
        <p style="margin-top: 12px;">
            ${issuesText}
        </p>
        <ul style="margin-top: 8px; padding-left: 20px; color: var(--text-secondary);">
            ${scoreData.warnings.map(w => `<li>${w.title}: ${w.content}</li>`).join('')}
        </ul>
        <p style="margin-top: 16px; color: var(--accent-green);">
            <strong>${suggestionsText}</strong>
        </p>
        <ul style="margin-top: 8px; padding-left: 20px; color: var(--text-secondary);">
            <li><strong>${isEnglish ? 'Option 1:' : '方案一：'}</strong> ${isEnglish ? i18n.notRecommendedOption1 : '寻求专业安全专家帮助，由专家协助配置安全环境'}</li>
            <li><strong>${isEnglish ? 'Option 2:' : '方案二：'}</strong> ${isEnglish ? i18n.notRecommendedOption2 : '使用网页版 AI 服务（如 Claude Web、ChatGPT 等），避免本地安装'}</li>
            <li><strong>${isEnglish ? 'Option 3:' : '方案三：'}</strong> ${isEnglish ? i18n.notRecommendedOption3 : '先解决上述安全问题后，再考虑使用本地 AI Agent'}</li>
        </ul>
    `;

    container.innerHTML = content;
}

/**
 * 生成低安全评分的建议（PDF导出用）
 */
function generateLowScoreRecommendationHTML(goal, scoreData) {
    const agentName = goal === 'code' ? 'Claude Code' : 'OpenClaw';
    const title = isEnglish ? `⚠️ Security Risk Too High: Not Recommended` : `⚠️ 安全风险过高：不建议使用 ${agentName}`;
    const desc = isEnglish
        ? `Based on your security assessment results (Score: <strong style="color: #f5222d;">${scoreData.score} pts</strong>), your current security risk is too high. It is not recommended to use AI Agent directly.`
        : `根据您的安全评估结果（综合评分：<strong style="color: #f5222d;">${scoreData.score} 分</strong>），您当前的安全风险过高，不建议直接使用 AI Agent。`;
    const issuesTitle = isEnglish ? 'Your environment has the following issues:' : '您的环境配置存在以下问题：';
    const suggestionsTitle = isEnglish ? 'Recommended approaches:' : '建议方案：';
    const option1 = isEnglish ? 'Option 1:' : '方案一：';
    const option2 = isEnglish ? 'Option 2:' : '方案二：';
    const option3 = isEnglish ? 'Option 3:' : '方案三：';

    return `
        <h3>${title}</h3>
        <p>${desc}</p>
        <p style="margin-top: 12px;">${issuesTitle}</p>
        <ul style="margin-top: 8px; padding-left: 20px; color: #666;">
            ${scoreData.warnings.map(w => `<li>${w.title}: ${w.content}</li>`).join('')}
        </ul>
        <p style="margin-top: 16px; color: #389e0d;">
            <strong>${suggestionsTitle}</strong>
        </p>
        <ul style="margin-top: 8px; padding-left: 20px; color: #666;">
            <li><strong>${option1}</strong> ${isEnglish ? i18n.lowScoreOption1 : '寻求专业安全专家帮助，由专家协助配置安全环境'}</li>
            <li><strong>${option2}</strong> ${isEnglish ? i18n.lowScoreOption2 : '使用网页版 AI 服务（如 Claude Web、ChatGPT 等），避免本地安装'}</li>
            <li><strong>${option3}</strong> ${isEnglish ? i18n.lowScoreOption3 : '先解决上述安全问题后，再考虑使用本地 AI Agent'}</li>
        </ul>
    `;
}

/**
 * 生成 AI Agent 推荐
 */
function generateAgentRecommendation(goal, environment) {
    const container = document.getElementById('recommendation');
    let content = '';
    const agentName = goal === 'code' ? 'Claude Code' : 'OpenClaw';
    const agentDesc = goal === 'code'
        ? (isEnglish ? 'It focuses on code development, debugging, and refactoring, providing intelligent code suggestions based on project context. Especially suitable for writing applications, fixing bugs, and refactoring code.' : '它专注于代码开发、调试和重构，能够理解项目上下文并提供智能代码建议。特别适合编写应用程序、修复 bug 和重构代码。')
        : (isEnglish ? 'It is designed for web automation and task execution, can simulate mouse operations, fill forms, and extract data. Suitable for automation scenarios requiring web interface interaction.' : '它专为网页自动化和任务执行设计，可以模拟鼠标操作、填写表单、提取数据。适合需要与网页界面交互的自动化场景。');
    const icon = goal === 'code' ? '🤖' : '🔄';
    const title = goal === 'code' ? 'Claude Code' : 'OpenClaw';
    const recText = isEnglish ? 'Recommendation' : '推荐';

    content = `
        <h3>${icon} ${recText}: ${agentName}</h3>
        <p>
            ${isEnglish ? 'Based on your needs,' : '根据您的需求，'}<span class="agent-name">${agentName}</span> ${isEnglish ? 'is the best choice.' : '是最佳选择。'}
            ${agentDesc}
        </p>
    `;

    if (environment === 'main') {
        content += `
            <p style="margin-top: 12px; color: var(--accent-orange);">
                ⚠️ ${i18n.envWarning}
            </p>
        `;
    }

    container.innerHTML = content;
}

/**
 * 生成 AI Agent 推荐（PDF导出用）
 */
function generateAgentRecommendationHTML(goal, environment) {
    let content = '';

    if (goal === 'code') {
        content = `
            <h3>${i18n.agentClaudeTitle}</h3>
            <p>${i18n.agentClaudeDesc}</p>
        `;
    } else {
        content = `
            <h3>${i18n.agentOpenClawTitle}</h3>
            <p>${i18n.agentOpenClawDesc}</p>
        `;
    }

    if (environment === 'main') {
        content += `
            <p style="margin-top: 12px; color: #fa8c16;">
                ${i18n.envWarning}
            </p>
        `;
    }

    return content;
}

/**
 * 生成专家帮助推荐
 */
function generateExpertRecommendation(budget) {
    const container = document.getElementById('recommendation');
    const budgetText = getBudgetText(budget);
    const sugg = getExpertSuggestions(budget);

    const content = `
        <h3>${i18n.expertTitle}</h3>
        <p>
            ${isEnglish
                ? `Based on your needs (${budgetText}), we recommend seeking professional developer help. Experts can provide customized solutions and reduce technical risks.`
                : `根据您的需求（${budgetText}），建议您寻求专业开发者的帮助。专家可以提供定制化的解决方案，降低技术风险。`}
        </p>
        <p style="margin-top: 12px; font-weight: 600; color: var(--text-primary);">${sugg.title}</p>
        <ul style="margin-top: 8px; padding-left: 20px; color: var(--text-secondary);">
            ${sugg.items}
        </ul>
    `;

    container.innerHTML = content;
}

/**
 * 生成专家帮助推荐（PDF导出用）
 */
function generateExpertRecommendationHTML(budget) {
    const budgetText = getBudgetText(budget);
    const sugg = getExpertSuggestions(budget);

    return `
        <h3>${i18n.expertTitle}</h3>
        <p>
            ${isEnglish
                ? `Based on your needs (${budgetText}), we recommend seeking professional developer help. Experts can provide customized solutions and reduce technical risks.`
                : `根据您的需求（${budgetText}），建议您寻求专业开发者的帮助。专家可以提供定制化的解决方案，降低技术风险。`}
        </p>
        <p style="margin-top: 12px; font-weight: 600; color: #333;">${sugg.title}</p>
        <ul style="margin-top: 8px; padding-left: 20px; color: #666;">
            ${sugg.items}
        </ul>
    `;
}

/**
 * 生成普通工具推荐
 */
function generateToolsRecommendation(complexity) {
    const container = document.getElementById('recommendation');
    const complexityText = getComplexityText(complexity);
    const sugg = getToolsSuggestions(complexity);

    const content = `
        <h3>${i18n.toolsTitle}</h3>
        <p>
            ${isEnglish
                ? `Based on your task complexity (${complexityText}), you may not need an AI Agent. Using existing mature tools may be more efficient and secure.`
                : `根据您的任务复杂度（${complexityText}），您可能不需要 AI Agent。使用现有的成熟工具可能更加高效和安全。`}
        </p>
        <p style="margin-top: 12px; font-weight: 600; color: var(--text-primary);">${sugg.title}</p>
        <ul style="margin-top: 8px; padding-left: 20px; color: var(--text-secondary);">
            ${sugg.items}
        </ul>
    `;

    container.innerHTML = content;
}

/**
 * 生成普通工具推荐（PDF导出用）
 */
function generateToolsRecommendationHTML(complexity) {
    const complexityText = getComplexityText(complexity);
    const sugg = getToolsSuggestions(complexity);

    return `
        <h3>${i18n.toolsTitle}</h3>
        <p>
            ${isEnglish
                ? `Based on your task complexity (${complexityText}), you may not need an AI Agent. Using existing mature tools may be more efficient and secure.`
                : `根据您的任务复杂度（${complexityText}），您可能不需要 AI Agent。使用现有的成熟工具可能更加高效和安全。`}
        </p>
        <p style="margin-top: 12px; font-weight: 600; color: #333;">${sugg.title}</p>
        <ul style="margin-top: 8px; padding-left: 20px; color: #666;">
            ${sugg.items}
        </ul>
    `;
}

/**
 * 计算安全评分（仅适用于 Agent 路径）
 */
function calculateSecurityScore(environment, audit, cost) {
    let score = 100;
    const details = [];
    const warnings = [];

    // 环境因素
    if (environment === 'main') {
        score -= 30;
        details.push({ text: i18n.detailEnvMainNeg, positive: false });
        warnings.push({
            level: 'high',
            title: i18n.warnHighEnv,
            content: i18n.warnHighEnvContent
        });
    } else {
        details.push({ text: i18n.detailEnvIsolated, positive: true });
    }

    // 审计能力因素
    if (audit === 'no') {
        score -= 25;
        details.push({ text: i18n.detailAuditNoNeg, positive: false });
        warnings.push({
            level: 'medium',
            title: i18n.warnMedAudit,
            content: i18n.warnMedAuditContent
        });
    } else {
        details.push({ text: i18n.detailAuditYes, positive: true });
    }

    // 成本控制因素
    if (cost === 'no') {
        score -= 15;
        details.push({ text: i18n.detailCostNoNeg, positive: false });
        warnings.push({
            level: 'medium',
            title: i18n.warnCost,
            content: i18n.warnCostContent
        });
    } else {
        details.push({ text: i18n.detailCostYes, positive: true });
    }

    // 确保分数不低于 0
    score = Math.max(0, score);

    // 根据分数确定级别
    let level = 'high';
    let color = 'var(--score-high)';
    if (score < 60) {
        level = 'low';
        color = 'var(--score-low)';
    } else if (score < 80) {
        level = 'medium';
        color = 'var(--score-medium)';
    }

    return { score, details, warnings, level, color };
}

/**
 * 显示安全评分
 */
function displaySecurityScore(scoreData) {
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreValue = document.getElementById('scoreValue');
    const scoreDetails = document.getElementById('scoreDetails');
    const securityWarnings = document.getElementById('securityWarnings');

    // 设置分数 - 处理 N/A 情况
    if (scoreData.score === 'N/A') {
        scoreValue.textContent = 'N/A';
        scoreCircle.style.borderColor = 'var(--text-muted)';
        scoreCircle.style.borderStyle = 'dashed';
        scoreDetails.innerHTML = `<div class="score-item"><span>${i18n.noSecurityScore}</span></div>`;
        securityWarnings.innerHTML = '';
        return;
    }

    // 恢复实线边框
    scoreCircle.style.borderStyle = 'solid';
    scoreValue.textContent = scoreData.score;
    scoreCircle.style.borderColor = scoreData.color;

    // 设置详情
    let detailsHtml = scoreData.details.map(item => `
        <div class="score-item ${item.positive ? 'positive' : 'negative'}">
            <span>${item.positive ? '✓' : '✗'}</span>
            <span>${item.text}</span>
        </div>
    `).join('');
    scoreDetails.innerHTML = detailsHtml;

    // 设置警告
    if (scoreData.warnings.length > 0) {
        let warningsHtml = scoreData.warnings.map(w => `
            <div class="warning-item ${w.level}">
                <span class="warning-icon">${w.level === 'high' ? '🚨' : '⚠️'}</span>
                <div class="warning-content">
                    <strong>${w.title}</strong>
                    <p>${w.content}</p>
                </div>
            </div>
        `).join('');
        securityWarnings.innerHTML = warningsHtml;
    } else {
        securityWarnings.innerHTML = '';
    }
}

/**
 * 生成 AI Agent 行动建议
 */
function generateAgentActionItems(environment, audit, cost) {
    const container = document.getElementById('actionItems');
    const items = [];

    // 通用建议
    items.push(i18n.actionRegularUpdate);
    items.push(i18n.actionLogAudit);
    items.push(i18n.actionSensitiveInfo);

    // 环境相关
    if (environment === 'main') {
        items.push(i18n.actionMigrateEnv);
        items.push(i18n.actionDedicatedBrowser);
    } else {
        items.push(i18n.actionBackup);
        items.push(i18n.actionLimitNetwork);
    }

    // 审计相关
    if (audit === 'no') {
        items.push(i18n.actionTestFirst);
        items.push(i18n.actionSeekHelp);
    } else {
        items.push(i18n.actionReviewCode);
    }

    // 成本相关
    if (cost === 'no') {
        items.push(i18n.actionSetLimit);
        items.push(i18n.actionEnableAlert);
    }

    const title = isEnglish ? '📋 Recommended Actions' : '📋 建议行动项';
    const html = `
        <h4>${title}</h4>
        <ul class="action-list">
            ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;

    container.innerHTML = html;
}

/**
 * 导出 PDF 报告（通过浏览器打印）
 */
function exportToPDF() {
    const { q1, q2, q3, q4, q5, q6 } = state.answers;
    const now = new Date().toLocaleString(isEnglish ? 'en-US' : 'zh-CN');

    let content = '';
    let scoreData = null;

    // 生成目标描述
    const goalText = q1 === 'code' ? i18n.goalCode : i18n.goalAutomation;

    // 生成实现方式描述
    const implementationText = q2 === 'agent' ? i18n.implAgent : (q2 === 'expert' ? i18n.implExpert : i18n.implTools);

    // 生成建议内容
    let recommendationText = '';
    if (q2 === 'agent') {
        recommendationText = q1 === 'code' ? i18n.recClaudeCode : i18n.recOpenClaw;
    } else if (q2 === 'expert') {
        const budgetText = { low: i18n.budgetLow, medium: i18n.budgetMedium, high: i18n.budgetHigh };
        recommendationText = `${i18n.recExpert}（${budgetText[q6] || (isEnglish ? 'Not specified' : '预算未指定')}）`;
    } else if (q2 === 'tools') {
        const complexityText = { low: i18n.complexityLow, medium: i18n.complexityMedium, high: i18n.complexityHigh };
        recommendationText = `${i18n.recTools}（${complexityText[q6] || (isEnglish ? 'Not specified' : '复杂度未指定')}）`;
    }

    if (q2 === 'agent') {
        // AI Agent 路径
        const environment = q3 === 'main' ? i18n.envMain : i18n.envIsolated;
        const auditAbility = q4 === 'yes' ? i18n.auditYes : i18n.auditNo;
        const costLimit = q5 === 'yes' ? i18n.costYes : i18n.costNo;
        scoreData = calculateSecurityScore(q3, q4, q5);

        content = `
            <div class="report-header">
                <h1>${i18n.pdfTitle}</h1>
                <p class="report-time">${isEnglish ? 'Generated:' : '生成时间:'} ${now}</p>
            </div>

            <div class="report-section">
                <h2>${i18n.pdfYourChoices}</h2>
                <ul>
                    <li>${i18n.pdfUseGoal}: ${goalText}</li>
                    <li>${i18n.pdfImplementation}: ${implementationText}</li>
                </ul>
            </div>

            <div class="report-section">
                <h2>${i18n.pdfRecommendation}</h2>
                <p class="highlight">${recommendationText}</p>
            </div>

            <div class="report-section">
                <h2>${i18n.pdfEnvironment}</h2>
                <ul>
                    <li>${i18n.pdfRuntime}: ${environment}</li>
                    <li>${i18n.pdfAuditAbility}: ${auditAbility}</li>
                    <li>${i18n.pdfAPILimit}: ${costLimit}</li>
                </ul>
            </div>

            <div class="report-section">
                <h2>${i18n.pdfSecurityScore}</h2>
                <p class="score">${isEnglish ? 'Score:' : '综合评分:'} <strong>${scoreData.score} ${i18n.scoreLabel}</strong> (${scoreData.level === 'high' ? i18n.scoreHigh : scoreData.level === 'medium' ? i18n.scoreMedium : i18n.scoreLow})</p>
                <ul class="checklist">
                    ${scoreData.details.map(d => `<li class="${d.positive ? 'positive' : 'negative'}">${d.positive ? '✓' : '✗'} ${d.text}</li>`).join('')}
                </ul>
            </div>

            ${scoreData.warnings.length > 0 ? `
            <div class="report-section warnings">
                <h2>${i18n.pdfSecurityWarnings}</h2>
                ${scoreData.warnings.map(w => `
                    <div class="warning-item ${w.level}">
                        <strong>${w.title}</strong>
                        <p>${w.content}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="report-section">
                <h2>${i18n.pdfActionItems}</h2>
                <ul>
                    ${generateActionItemsList(q3, q4, q5).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        // 专家帮助/普通工具路径
        content = `
            <div class="report-header">
                <h1>${i18n.pdfTitle}</h1>
                <p class="report-time">${isEnglish ? 'Generated:' : '生成时间:'} ${now}</p>
            </div>

            <div class="report-section">
                <h2>${i18n.pdfYourChoices}</h2>
                <ul>
                    <li>${i18n.pdfUseGoal}: ${goalText}</li>
                    <li>${i18n.pdfImplementation}: ${implementationText}</li>
                </ul>
            </div>

            <div class="report-section">
                <h2>${i18n.pdfRecommendation}</h2>
                <p class="highlight">${recommendationText}</p>
            </div>
        `;
    }

    // 生成推荐方案的完整内容（确保包含所有情况，包括不推荐）
    let fullRecommendation = '';
    if (q2 === 'agent' && scoreData && scoreData.score < 40) {
        // 安全评分太低，生成不推荐的内容
        fullRecommendation = generateLowScoreRecommendationHTML(q1, scoreData);
    } else if (q2 === 'agent') {
        fullRecommendation = generateAgentRecommendationHTML(q1, q3);
    } else if (q2 === 'expert') {
        fullRecommendation = generateExpertRecommendationHTML(q6);
    } else if (q2 === 'tools') {
        fullRecommendation = generateToolsRecommendationHTML(q6);
    }

    // 添加推荐方案详情
    content += `
        <div class="report-section">
            <h2>${i18n.pdfRecommendationDetails}</h2>
            ${fullRecommendation}
        </div>

        <div class="report-section">
            <h2>${i18n.pdfSecurityAlerts}</h2>

            <div class="alert-group">
                <h3>🔧 ${i18n.pdfAlertConfig}</h3>
                <ul>
                    <li><strong>${isEnglish ? 'Network Interface Exposure' : '网络接口暴露'}:</strong> ${i18n.pdfAlertNetwork}</li>
                    <li><strong>${isEnglish ? 'Sensitive Credential Leak' : '敏感凭证泄露'}:</strong> ${i18n.pdfAlertCredential}</li>
                    <li><strong>${isEnglish ? 'Excessive Permissions' : '权限过度开放'}:</strong> ${i18n.pdfAlertPermission}</li>
                </ul>
            </div>

            <div class="alert-group">
                <h3>📦 ${i18n.pdfAlertSupply}</h3>
                <ul>
                    <li><strong>${isEnglish ? 'Malicious Packages' : '恶意安装包'}:</strong> ${i18n.pdfAlertMalicious}</li>
                    <li><strong>${isEnglish ? 'Dependency Chain Attack' : '依赖链攻击'}:</strong> ${i18n.pdfAlertDependency}</li>
                    <li><strong>${isEnglish ? 'Prompt Injection' : '提示词注入'}:</strong> ${i18n.pdfAlertPrompt}</li>
                </ul>
            </div>

            <div class="alert-group">
                <h3>🧠 ${i18n.pdfAlertCognitive}</h3>
                <ul>
                    <li><strong>${isEnglish ? 'Underestimating Risk' : '低估技术风险'}:</strong> ${i18n.pdfAlertUnderestimate}</li>
                    <li><strong>${isEnglish ? 'Over-trusting' : '过度信任自动化'}:</strong> ${i18n.pdfAlertOvertrust}</li>
                    <li><strong>${isEnglish ? 'Ignoring Privacy' : '忽视数据隐私'}:</strong> ${i18n.pdfAlertPrivacy}</li>
                </ul>
            </div>

            <div class="alert-group">
                <h3>💰 ${i18n.pdfAlertCost}</h3>
                <ul>
                    <li><strong>${isEnglish ? 'API Cost Overrun' : 'API 费用失控'}:</strong> ${i18n.pdfAlertAPI}</li>
                    <li><strong>${isEnglish ? 'Hidden Costs' : '隐性成本忽视'}:</strong> ${i18n.pdfAlertHidden}</li>
                    <li><strong>${isEnglish ? 'Security Incidents' : '安全事故成本'}:</strong> ${i18n.pdfAlertIncident}</li>
                </ul>
            </div>
        </div>

        <div class="report-footer">
            <p>${i18n.pdfFooter}</p>
            <p>${i18n.pdfRef}<a href="https://owasp.org/Top10/2025/">OWASP Top 10 2025</a> | <a href="https://owasp.org/www-project-api-security/">OWASP API Security</a></p>
        </div>
    `;

    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>AI Agent 安全报告 - ${now}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: #fff;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #333;
                }
                .report-header h1 {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                .report-time {
                    color: #666;
                    font-size: 14px;
                }
                .report-section {
                    margin-bottom: 25px;
                }
                .report-section h2 {
                    font-size: 18px;
                    margin-bottom: 12px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid #eee;
                }
                .highlight {
                    font-size: 16px;
                    font-weight: 600;
                    color: #00a855;
                }
                .score {
                    font-size: 16px;
                }
                .score strong {
                    font-size: 24px;
                    color: #00a855;
                }
                ul {
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 6px;
                }
                .checklist li {
                    list-style: none;
                    padding-left: 24px;
                    position: relative;
                }
                .checklist li::before {
                    content: '';
                    position: absolute;
                    left: 0;
                }
                .checklist li.positive::before {
                    content: '✓';
                    color: #00a855;
                }
                .checklist li.negative::before {
                    content: '✗';
                    color: #f5222d;
                }
                .warnings {
                    background: #fff7e6;
                    padding: 15px;
                    border-radius: 4px;
                    border-left: 3px solid #fa8c16;
                }
                .warning-item {
                    margin-bottom: 10px;
                }
                .warning-item strong {
                    color: #d46b08;
                }
                .warning-item p {
                    font-size: 14px;
                    color: #666;
                }
                .alert-group {
                    margin-bottom: 15px;
                }
                .alert-group h3 {
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 8px;
                }
                .report-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #999;
                    font-size: 12px;
                }
                @media print {
                    body {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();

    // 延迟打印，让内容加载完成
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

/**
 * 生成行动项目列表（用于导出）
 */
function generateActionItemsList(environment, audit, cost) {
    const items = [];

    items.push(i18n.actionRegularUpdate);
    items.push(i18n.actionLogAudit);
    items.push(i18n.actionSensitiveInfo);

    if (environment === 'main') {
        items.push(i18n.actionMigrateEnv);
        items.push(i18n.actionDedicatedBrowser);
    } else {
        items.push(i18n.actionBackup);
        items.push(i18n.actionLimitNetwork);
    }

    if (audit === 'no') {
        items.push(i18n.actionTestFirst);
        items.push(i18n.actionSeekHelp);
    }

    if (cost === 'no') {
        items.push(i18n.actionSetLimit);
        items.push(i18n.actionEnableAlert);
    }

    return items;
}

/**
 * 生成行动列表（用于导出）
 */
function generateActionList(environment, audit, cost) {
    const items = [];

    items.push('定期更新 AI Agent 到最新版本');
    items.push('启用日志审计，记录所有执行的操作');
    items.push('不要在 AI Agent 会话中输入敏感信息');

    if (environment === 'main') {
        items.push('优先考虑迁移到 Docker 或虚拟机隔离环境');
        items.push('使用专用浏览器配置');
    } else {
        items.push('定期备份隔离环境快照');
        items.push('限制网络访问权限');
    }

    if (audit === 'no') {
        items.push('在测试环境验证脚本行为');
        items.push('寻求有经验开发者协助审核');
    }

    if (cost === 'no') {
        items.push('立即设置 API 每日消费限额');
        items.push('启用费用提醒通知');
    }

    return items.map(item => `- ${item}`).join('\n');
}

/**
 * 重新开始评估
 */
function restartQuiz() {
    // 重置状态
    state.currentStep = 0;
    state.isAgentPath = true;
    state.answers = {
        q1: null,
        q2: null,
        q3: null,
        q4: null,
        q5: null,
        q6: null
    };

    // 重置进度条
    updateProgress(0);

    // 显示欢迎页面
    showCard('welcome');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Agent 安装决策与安全指南已加载');
    updateProgress(0);
});
