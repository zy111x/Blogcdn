// Static visit count for demonstration on GitHub Pages (as no dynamic API can be used here)
document.getElementById('visitCount').innerText = "1234"; // Static number for GitHub Pages

const urls = [
    "https://blog.cmliussss.com#Cloudflare CDN", 
    "https://fastly.blog.cmliussss.com#Fastly CDN", 
    "https://gcore.blog.cmliussss.com#Gcore CDN", 
    "https://vercel.blog.cmliussss.com#Vercel CDN", 
    "https://xn--1uto7rutmzjk.us.kg#备用地址"
];

// Generate URL list
const ul = document.getElementById("urls");
urls.forEach((url, index) => {
    const [testUrl, name] = url.split('#');
    const li = document.createElement("li");
    li.id = `result${index}`;
    li.innerHTML = `${name} <span id="latency${index}" class="latency">测速中...</span>`;
    ul.appendChild(li);
});

const timeout = 3000;

// Mock Latency Test Function for demonstration
function testLatency(url) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const latency = Math.floor(Math.random() * 1000); // Mock latency for GitHub Pages
            resolve({ url, latency });
        }, timeout);
    });
}

// Get Latency Class
function getLatencyClass(latency) {
    if (latency <= 100) return 'latency-fast';
    if (latency <= 200) return 'latency-medium';
    if (latency <= 500) return 'latency-slow';
    return 'latency-error';
}

// Run latency tests and show results
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
        latencySpan.textContent = `${result.latency}ms`;
        latencySpan.className = getLatencyClass(result.latency);
    });

    const validResults = results.filter(result => typeof result.latency === 'number');
    if (validResults.length > 0) {
        const fastest = validResults.reduce((prev, current) => (prev.latency < current.latency ? prev : current), validResults[0]);

        // Mark fastest CDN
        results.forEach((result, index) => {
            if (result.name === fastest.name) {
                const li = document.getElementById(`result${index}`);
                li.innerHTML += ' <span class="checkmark">✅</span>';
            }
        });

        // Show redirecting message
        document.getElementById('redirectingMessage').style.display = 'block';

        // Redirect to the fastest CDN
        setTimeout(() => {
            window.location.href = fastest.url;
        }, 2000); // Wait for 2 seconds before redirecting
    }
}

window.onload = runTests;
