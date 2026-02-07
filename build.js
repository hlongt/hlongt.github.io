const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// 读取源码
const dataJson = fs.readFileSync('data.json', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

// 注入数据并移除 fetch 逻辑
// 这里的正则会匹配从 fetch 开始到 .then(data => { 的所有内容
const injection = `const data = ${dataJson}; (function(data) {`;
html = html.replace(/fetch\('data\.json'\)[\s\S]+?\.then\(data => {/, injection);

// 修复结尾处的闭合
html = html.replace(/\}\)\s+\.catch\(err => console\.error\("Error loading data:", err\)\);/, '})(data);');

// 混淆 JavaScript
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const match = html.match(scriptRegex);
if (match && match[1]) {
    const obfuscatedJs = JavaScriptObfuscator.obfuscate(match[1], {
        compact: true,
        controlFlowFlattening: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1
    }).getObfuscatedCode();
    html = html.replace(match[1], obfuscatedJs);
}

// 输出到 dist 目录
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', html);
if (fs.existsSync('favicon.png')) fs.copyFileSync('favicon.png', 'dist/favicon.png');
