// 通过fetch获取API并展示visitCount
fetch('https://tongji.090227.xyz/?id=hexo.200038.xyz')
    .then(r => r.json())  // 转换为JSON
    .then(d => document.getElementById('visitCount').innerText = d.visitCount)  // 显示visitCount
    .catch(e => document.getElementById('visitCount').innerText = '加载失败');  // 错误处理

const urls = [
    "https://blog.cmliussss.com#Cloudflare CDN",
    "https://fastly.blog.cmliussss.com#Fastly CDN",
    "https://gcore.blog.cmliussss.com#Gcore CDN",
    "https://vercel.blog.cmliussss.com#Vercel CDN",
    "https://xn--1uto7rutmzjk.us.kg#备用地址"
];

// 动态生成URL列表
const ul = document.getElementById("urls");
urls.forEach((url, index) => {
    const [testUrl, name] = url.split('#');
    const li = document.createElement("li");
    li.id = `result${index}`;
    li.innerHTML = `${name} <span id="latency${index}">测速中...</span>`;
    ul.appendChild(li);
});

const timeout = 3000;

function testLatency(url) {
    return new Promise((resolve) => {
        const start = Date.now();
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.timeout = timeout;

        xhr.onload = function () {
            const latency = Date.now() - start;
            if (xhr.status === 200) {
                resolve({ url, latency });
            } else {
                resolve({ url, latency: `状态码: ${xhr.status}` });
            }
        };

        xhr.ontimeout = function () {
            resolve({ url, latency: `响应超时 ${timeout}ms` });
        };

        xhr.onerror = function () {
            resolve({ url, latency: '请求失败' });
        };

        xhr.send();
    });
}

// 获取延迟的颜色
function getLatencyColor(latency) {
    if (latency <= 100) return 'rgb(36, 170, 29)';
    if (latency <= 200) return 'rgb(142, 161, 40)';
    if (latency <= 500) return 'rgb(246, 152, 51)';
    if (latency <= 1000) return 'rgb(242, 118, 42)';
    if (latency > 1000) return 'rgb(236, 70, 28)';
    return 'rgb(230, 22, 16)';  // 超时或错误
}

async function runTests() {
    const results = await Promise.all(urls.map(url => {
        const [testUrl, name] = url.split('#');
        return testLatency(testUrl).then(result => ({
            ...result,
            name
        }));
    }));

    results.forEach((result, index) => {
        const li = document.getElementById(`result${index}`);
        const latencySpan = document.getElementById(`latency${index}`);
        if (typeof result.latency === 'number') {
            latencySpan.textContent = `${result.latency}ms`;
            latencySpan.style.color = getLatencyColor(result.latency);
        } else {
            latencySpan.textContent = result.latency;
            latencySpan.style.color = 'rgb(230, 22, 16)'; // 超时或错误用红色
        }
    });

    const validResults = results.filter(result => typeof result.latency === 'number');
    if (validResults.length > 0) {
        const fastest = validResults.reduce((prev, current) => (prev.latency < current.latency ? prev : current), validResults[0]);

        // 标记最快的 CDN
        results.forEach((result, index) => {
            if (result.name === fastest.name) {
                const li = document.getElementById(`result${index}`);
                li.innerHTML += ' ✅';
            }
        });

        // 302跳转到最快的地址并保留路径和参数
        const currentPath = '/';
        const currentParams = '';
        const redirectUrl = fastest.url + currentPath + currentParams;

        // 302 跳转
        window.location.href = redirectUrl;
    }
}

window.onload = runTests;
