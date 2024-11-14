// Fetch visit count
fetch('https://tongji.090227.xyz/?id=hexo.200038.xyz')
    .then(r => r.json())
    .then(d => document.getElementById('visitCount').innerText = d.visitCount)
    .catch(e => document.getElementById('visitCount').innerText = '加载失败');

const urls = [
    "https://hexo.200038.xyz#Cloudflare CDN",
    "https://fastly.hexo.200038.xyz#Fastly CDN",
    "https://blog.200036.xyz#备用地址"
];

const ul = document.getElementById("urls");
urls.forEach((url, index) => {
    const [testUrl, name] = url.split('#');
    const li = document.createElement("li");
    li.id = `result${index}`;
    li.innerHTML = `${name} <span id="latency${index}" class="latency">测速中...</span>`;
    ul.appendChild(li);
});

const timeout = 3000;

function testLatency(url) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const latency = Math.floor(Math.random() * 1000);
            resolve({ url, latency });
        }, timeout);
    });
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
        const latencySpan = document.getElementById(`latency${index}`);
        latencySpan.textContent = `${result.latency}ms`;
        latencySpan.className = `latency`;
    });

    const validResults = results.filter(result => typeof result.latency === 'number');
    if (validResults.length > 0) {
        const fastest = validResults.reduce((prev, current) => (prev.latency < current.latency ? prev : current), validResults[0]);

        results.forEach((result, index) => {
            if (result.name === fastest.name) {
                const li = document.getElementById(`result${index}`);
                li.innerHTML += ' <span class="fastest-label">FASTEST</span>';
            }
        });

        document.getElementById('redirectingMessage').style.display = 'block';

        setTimeout(() => {
            window.location.href = fastest.url;
        }, 2000);
    }
}

window.onload = runTests;
