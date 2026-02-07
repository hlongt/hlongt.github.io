const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// 1. 读取原始文件
const dataJson = fs.readFileSync('data.json', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

// 2. 将 fetch('data.json') 逻辑替换为直接注入数据
// 我们匹配脚本中的 fetch 部分并将其替换为变量定义
const injection = `
    const data = ${dataJson};
    (function(data) {
`;

// 移除原有的 fetch 结构，直接执行逻辑
html = html.replace(/fetch\('data\.json'\)\s*\.then\(res => res\.json\(\)\)\s*\.then\(data => \{/, injection);
html = html.replace(/\}\)\s*\.catch\(err => console\.error\("Error loading data:", err\)\);/, '})(data);');

// 3. 提取脚本内容进行混淆
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const match = html.match(scriptRegex);

if (match && match[1]) {
    const originalJs = match[1];
    const obfuscatedJs = JavaScriptObfuscator.obfuscate(originalJs, {
        compact: true,
        controlFlowFlattening: true,
        numbersToExpressions: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: true
    }).getObfuscatedCode();

    html = html.replace(originalJs, obfuscatedJs);
}

// 4. 保存为最终的 index.html
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', html);
// 复制图标文件到发布目录
if (fs.existsSync('favicon.png')) {
    fs.copyFileSync('favicon.png', 'dist/favicon.png');
}
