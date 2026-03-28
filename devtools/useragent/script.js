(function() {
    'use strict';

    // UserAgent Presets Data
    const presets = {
        desktop: [
            {
                name: 'Chrome (Windows)',
                desc: 'Windows 10 / Chrome 120',
                ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            {
                name: 'Chrome (macOS)',
                desc: 'macOS Sonoma / Chrome 120',
                ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            {
                name: 'Firefox (Windows)',
                desc: 'Windows 10 / Firefox 121',
                ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
            },
            {
                name: 'Firefox (macOS)',
                desc: 'macOS Sonoma / Firefox 121',
                ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
            },
            {
                name: 'Safari (macOS)',
                desc: 'macOS Sonoma / Safari 17',
                ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
            },
            {
                name: 'Edge (Windows)',
                desc: 'Windows 10 / Edge 120',
                ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
            },
            {
                name: 'Opera (Windows)',
                desc: 'Windows 10 / Opera 106',
                ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0'
            },
            {
                name: 'Linux Chrome',
                desc: 'Ubuntu / Chrome 120',
                ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        ],
        mobile: [
            {
                name: 'Safari (iPhone)',
                desc: 'iOS 17 / Safari',
                ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            },
            {
                name: 'Safari (iPad)',
                desc: 'iPadOS 17 / Safari',
                ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            },
            {
                name: 'Chrome (Android)',
                desc: 'Android 14 / Chrome 120',
                ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
            },
            {
                name: 'Samsung Internet',
                desc: 'Android 14 / Samsung',
                ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'
            },
            {
                name: 'Firefox (Android)',
                desc: 'Android 14 / Firefox 121',
                ua: 'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0'
            },
            {
                name: 'WeChat (Android)',
                desc: 'Android 14 / WeChat',
                ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x2800303F) Process/tools WeChat/arm64 WeChat NetType/4G Language/zh_CN ABI/arm64'
            },
            {
                name: 'WeChat (iOS)',
                desc: 'iOS 17 / WeChat',
                ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x1800302f) NetType/4G Language/zh_CN'
            },
            {
                name: 'QQ Browser',
                desc: 'Android 14 / QQ',
                ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 V1_AND_SQ_9.0.15_4166_YYB_D QQ/9.0.15.8150 NetType/4G WebP/0.3.0 Pixel/1440 StatusBarHeight/132 SimpleUISwitch/0 QQTheme/1000 InMagicWin/0 StudyMode/0 CurrentMode/0 CurrentFontScale/1.0 GlobalDensityScale/0.9999999 AppId/537124927'
            }
        ],
        crawler: [
            {
                name: 'Googlebot',
                desc: 'Google 搜索爬虫',
                ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            },
            {
                name: 'Bingbot',
                desc: 'Bing 搜索爬虫',
                ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
            },
            {
                name: 'Baiduspider',
                desc: '百度搜索爬虫',
                ua: 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
            },
            {
                name: 'YandexBot',
                desc: 'Yandex 搜索爬虫',
                ua: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'
            },
            {
                name: 'Twitterbot',
                desc: 'Twitter 爬虫',
                ua: 'Mozilla/5.0 (compatible; Twitterbot/1.0)'
            },
            {
                name: 'Facebook Bot',
                desc: 'Facebook 爬虫',
                ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
            },
            {
                name: 'LinkedIn Bot',
                desc: 'LinkedIn 爬虫',
                ua: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)'
            },
            {
                name: 'GPTBot',
                desc: 'OpenAI 爬虫',
                ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)'
            }
        ]
    };

    // Browser patterns for parsing
    const browserPatterns = [
        { name: 'Edge', pattern: /Edg\/([\d.]+)/, nameMatch: /Edg\// },
        { name: 'Opera', pattern: /OPR\/([\d.]+)/, nameMatch: /OPR\// },
        { name: 'Samsung Internet', pattern: /SamsungBrowser\/([\d.]+)/, nameMatch: /SamsungBrowser\// },
        { name: 'WeChat', pattern: /MicroMessenger\/([\d.]+)/, nameMatch: /MicroMessenger\// },
        { name: 'QQ Browser', pattern: /QQ\/([\d.]+)/, nameMatch: /QQ\// },
        { name: 'Chrome', pattern: /Chrome\/([\d.]+)/, nameMatch: /Chrome\// },
        { name: 'Firefox', pattern: /Firefox\/([\d.]+)/, nameMatch: /Firefox\// },
        { name: 'Safari', pattern: /Version\/([\d.]+)/, nameMatch: /Safari\// },
        { name: 'Googlebot', pattern: /Googlebot\/([\d.]+)/, nameMatch: /Googlebot\// },
        { name: 'Bingbot', pattern: /bingbot\/([\d.]+)/, nameMatch: /bingbot\// },
        { name: 'Baiduspider', pattern: /Baiduspider\/?([\d.]*)/, nameMatch: /Baiduspider\// },
        { name: 'YandexBot', pattern: /YandexBot\/([\d.]+)/, nameMatch: /YandexBot\// },
        { name: 'Twitterbot', pattern: /Twitterbot\/([\d.]+)/, nameMatch: /Twitterbot\// },
        { name: 'Facebook Bot', pattern: /facebookexternalhit\/([\d.]+)/, nameMatch: /facebookexternalhit\// },
        { name: 'LinkedIn Bot', pattern: /LinkedInBot\/([\d.]+)/, nameMatch: /LinkedInBot\// },
        { name: 'GPTBot', pattern: /GPTBot\/([\d.]+)/, nameMatch: /GPTBot\// }
    ];

    // OS patterns for parsing
    const osPatterns = [
        { name: 'Windows 11', pattern: /Windows NT 10\.0.*Win64/ },
        { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
        { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
        { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
        { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
        { name: 'Windows Vista', pattern: /Windows NT 6\.0/ },
        { name: 'Windows XP', pattern: /Windows NT 5\.[12]/ },
        { name: 'macOS', pattern: /Mac OS X ([\d_]+)/, version: true },
        { name: 'iOS', pattern: /iPhone OS ([\d_]+)/, version: true },
        { name: 'iPadOS', pattern: /iPad.*OS ([\d_]+)/, version: true },
        { name: 'Android', pattern: /Android ([\d.]+)/, version: true },
        { name: 'Linux', pattern: /Linux/ },
        { name: 'Chrome OS', pattern: /CrOS/ }
    ];

    // Engine patterns
    const enginePatterns = [
        { name: 'Blink', pattern: /Chrome\/[\d.]+/ },
        { name: 'WebKit', pattern: /AppleWebKit\/([\d.]+)/, version: true },
        { name: 'Gecko', pattern: /Gecko\/([\d.]+)/, version: true },
        { name: 'Trident', pattern: /Trident\/([\d.]+)/, version: true }
    ];

    // State
    let currentCategory = 'desktop';

    // DOM Elements
    const currentUAEl = document.getElementById('currentUA');
    const uaInputEl = document.getElementById('uaInput');
    const parseBtnEl = document.getElementById('parseBtn');
    const clearBtnEl = document.getElementById('clearBtn');
    const copyCurrentUAEl = document.getElementById('copyCurrentUA');
    const copyResultsEl = document.getElementById('copyResults');
    const presetListEl = document.getElementById('presetList');
    const resultsSectionEl = document.getElementById('resultsSection');
    const browserResultEl = document.getElementById('browserResult');
    const osResultEl = document.getElementById('osResult');
    const deviceResultEl = document.getElementById('deviceResult');
    const engineResultEl = document.getElementById('engineResult');
    const rawUAEl = document.getElementById('rawUA');
    const toastEl = document.getElementById('toast');

    // Initialize
    function init() {
        // Display current browser's UA
        currentUAEl.textContent = navigator.userAgent;

        // Render preset list
        renderPresets(currentCategory);

        // Event listeners
        parseBtnEl.addEventListener('click', handleParse);
        clearBtnEl.addEventListener('click', handleClear);
        copyCurrentUAEl.addEventListener('click', () => copyToClipboard(navigator.userAgent));
        copyResultsEl.addEventListener('click', handleCopyResults);

        // Preset tab switching
        document.querySelectorAll('.preset-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.preset-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentCategory = tab.dataset.category;
                renderPresets(currentCategory);
            });
        });

        // Auto-parse on Enter
        uaInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                handleParse();
            }
        });
    }

    // Render presets
    function renderPresets(category) {
        const items = presets[category] || [];
        presetListEl.innerHTML = items.map(item => `
            <div class="preset-item" data-ua="${escapeHtml(item.ua)}">
                <div class="preset-name">${escapeHtml(item.name)}</div>
                <div class="preset-desc">${escapeHtml(item.desc)}</div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.preset-item').forEach(item => {
            item.addEventListener('click', () => {
                uaInputEl.value = item.dataset.ua;
                handleParse();
            });
        });
    }

    // Parse UserAgent
    function parseUA(ua) {
        const result = {
            browser: { name: '未知', version: '' },
            os: { name: '未知', version: '' },
            device: { type: '桌面设备' },
            engine: { name: '未知', version: '' }
        };

        // Parse browser
        for (const bp of browserPatterns) {
            if (bp.nameMatch.test(ua)) {
                result.browser.name = bp.name;
                const match = ua.match(bp.pattern);
                if (match && match[1]) {
                    result.browser.version = match[1];
                }
                break;
            }
        }

        // Special handling for Safari (must check after Chrome to avoid false positive)
        if (result.browser.name === 'Safari' && /Chrome\//.test(ua)) {
            result.browser.name = '未知';
            result.browser.version = '';
            // Re-check for other browsers
            for (const bp of browserPatterns) {
                if (bp.nameMatch.test(ua) && bp.name !== 'Safari') {
                    result.browser.name = bp.name;
                    const match = ua.match(bp.pattern);
                    if (match && match[1]) {
                        result.browser.version = match[1];
                    }
                    break;
                }
            }
        }

        // Parse OS
        for (const op of osPatterns) {
            if (op.pattern.test(ua)) {
                result.os.name = op.name;
                if (op.version) {
                    const match = ua.match(op.pattern);
                    if (match && match[1]) {
                        result.os.version = match[1].replace(/_/g, '.');
                    }
                }
                break;
            }
        }

        // Determine device type
        if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
            if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
                result.device.type = '平板设备';
            } else {
                result.device.type = '移动设备';
            }
        } else if (/TV|SmartTV|SMART-TV/i.test(ua)) {
            result.device.type = '智能电视';
        } else if (/bot|crawler|spider|crawling/i.test(ua)) {
            result.device.type = '爬虫/机器人';
        } else {
            result.device.type = '桌面设备';
        }

        // Parse engine
        // Gecko-based browsers (Firefox)
        if (/Firefox\//.test(ua)) {
            result.engine.name = 'Gecko';
            const match = ua.match(/rv:([\d.]+)/);
            if (match) {
                result.engine.version = match[1];
            }
        }
        // Blink-based browsers (Chrome, Edge, Opera)
        else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) {
            result.engine.name = 'Blink';
            const match = ua.match(/Chrome\/([\d.]+)/);
            if (match) {
                result.engine.version = match[1];
            }
        }
        // Edge with Blink
        else if (/Edg\//.test(ua)) {
            result.engine.name = 'Blink';
            const match = ua.match(/Edg\/([\d.]+)/);
            if (match) {
                result.engine.version = match[1];
            }
        }
        // Safari with WebKit
        else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
            result.engine.name = 'WebKit';
            const match = ua.match(/AppleWebKit\/([\d.]+)/);
            if (match) {
                result.engine.version = match[1];
            }
        }
        // Generic WebKit
        else if (/AppleWebKit\//.test(ua)) {
            result.engine.name = 'WebKit';
            const match = ua.match(/AppleWebKit\/([\d.]+)/);
            if (match) {
                result.engine.version = match[1];
            }
        }

        return result;
    }

    // Handle parse
    function handleParse() {
        const ua = uaInputEl.value.trim();
        if (!ua) {
            showToast('请输入 UserAgent 字符串');
            return;
        }

        const result = parseUA(ua);

        // Display results
        browserResultEl.textContent = result.browser.version
            ? `${result.browser.name} ${result.browser.version}`
            : result.browser.name;

        osResultEl.textContent = result.os.version
            ? `${result.os.name} ${result.os.version}`
            : result.os.name;

        deviceResultEl.textContent = result.device.type;

        engineResultEl.textContent = result.engine.version
            ? `${result.engine.name} ${result.engine.version}`
            : result.engine.name;

        rawUAEl.textContent = ua;

        // Show results section
        resultsSectionEl.style.display = 'block';

        // Scroll to results
        resultsSectionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Handle clear
    function handleClear() {
        uaInputEl.value = '';
        resultsSectionEl.style.display = 'none';
        browserResultEl.textContent = '-';
        osResultEl.textContent = '-';
        deviceResultEl.textContent = '-';
        engineResultEl.textContent = '-';
        rawUAEl.textContent = '';
    }

    // Handle copy results
    function handleCopyResults() {
        const browser = browserResultEl.textContent;
        const os = osResultEl.textContent;
        const device = deviceResultEl.textContent;
        const engine = engineResultEl.textContent;
        const rawUA = rawUAEl.textContent;

        const text = `浏览器: ${browser}
操作系统: ${os}
设备类型: ${device}
渲染引擎: ${engine}

原始 UserAgent:
${rawUA}`;

        copyToClipboard(text);
    }

    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制到剪贴板');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('已复制到剪贴板');
        });
    }

    // Show toast notification
    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add('show');
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 2000);
    }

    // Escape HTML
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
