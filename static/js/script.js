const urls = [
    { url: 'https://blog.cmliussss.com', name: 'Cloudflare CDN' },
    { url: 'https://fastly.blog.cmliussss.com', name: 'Fastly CDN' },
    { url: 'https://gcore.blog.cmliussss.com', name: 'Gcore CDN' },
    { url: 'https://vercel.blog.cmliussss.com', name: 'Vercel CDN' },
    { url: 'https://xn--1uto7rutmzjk.us.kg', name: '备用地址' }
];

const timeout = 3000; // Timeout for latency test

// Helper function to test latency
async function testLatency(url) {
    const start = Date.now();
    try {
        const response = await fetch(url, { method: 'HEAD', timeout });
        const latency = Date.now() - start;
        if (response.ok) {
            return { url, latency };
        } else {
            return { url, latency: `Status Code: ${response.status}` };
        }
    } catch (error) {
        return { url, latency: error.message };
    }
}

// Function to generate HTML content
function generateHTML(results, visitCount) {
    let listItems = results.map((result, index) => {
        const latencyText = typeof result.latency === 'number' ? `${result.latency}ms` : result.latency;
        const latencyColor = getLatencyColor(result.latency);
        const fastestBadge = result.isFastest ? ' ✅' : '';
        return `<li id="result${index}" style="color: ${latencyColor};">${result.name} ${latencyText}${fastestBadge}</li>`;
    }).join('');

    return `
    <ul class="description" id="urls">${listItems}</ul>
    <span class="minifont">📢杨幂只是xp~ 🤣CM才是id!!! 📈今日访问人数:${visitCount}</span>
    `;
}

// Get latency color based on response time
function getLatencyColor(latency) {
    if (typeof latency === 'number') {
        if (latency <= 100) return 'rgb(36, 170, 29)';
        if (latency <= 200) return 'rgb(142, 161, 40)';
        if (latency <= 500) return 'rgb(246, 152, 51)';
        if (latency <= 1000) return 'rgb(242, 118, 42)';
        return 'rgb(236, 70, 28)';
    }
    return 'rgb(230, 22, 16)';
}

// Cloudflare Worker fetch event handler
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Fetch the visit count from your API
    let visitCount = '加载中...'; // Default text for visit count
    try {
        const response = await fetch('https://tongji.090227.xyz/?id=blog.cmliussss.com');
        const data = await response.json();
        visitCount = data.visitCount;
    } catch (error) {
        visitCount = '加载失败';
    }

    // Test the latency of the URLs
    const results = await Promise.all(urls.map(async (urlObj, index) => {
        const result = await testLatency(urlObj.url);
        return {
            ...result,
            name: urlObj.name,
            isFastest: false
        };
    }));

    // Find the fastest CDN and mark it
    const fastest = results.reduce((prev, current) => (prev.latency < current.latency ? prev : current), results[0]);
    results.forEach(result => {
        if (result.latency === fastest.latency) {
            result.isFastest = true;
        }
    });

    // Generate HTML content
    const html = generateHTML(results, visitCount);

    // Return HTML response
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}
