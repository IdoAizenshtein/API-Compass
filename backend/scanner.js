const puppeteer = require('puppeteer');
const IGNORED_EXTENSIONS = [
    '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.css', '.js', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.map',
    '.json'
];
const shouldIgnoreRequest = (url) => {
    return IGNORED_EXTENSIONS.some(ext => url.toLowerCase().includes(ext));
};

async function runScanner(url, delay = 0, headful = false) {
    const browser = await puppeteer.launch({
        headless: !headful,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const trackedRequests = new Map();
    const page = await browser.newPage();

    page.on('request', (request) => {
        const requestUrl = request.url();
        const resourceType = request.resourceType();
        const method = request.method();
        const key = `${method} ${requestUrl}`;

        if (['xhr', 'fetch'].includes(resourceType) && !shouldIgnoreRequest(requestUrl)) {
            const headers = request.headers();
            const postData = request.postData() || null;
            const contentType = headers['content-type'] || '';
            let parsedBody = null;
            try {
                if (contentType.includes('application/json')) {
                    parsedBody = JSON.parse(postData);
                } else if (contentType.includes('application/x-www-form-urlencoded')) {
                    parsedBody = Object.fromEntries(new URLSearchParams(postData));
                }
            } catch (e) {
                parsedBody = postData;
            }
            trackedRequests.set(key,
                {
                    method,
                    url: requestUrl,
                    requestHeaders: headers,
                    body: parsedBody || null,
                    cookiesSent: headers['cookie'] || null,
                }
            );
        }
    });

    page.on('response', async (response) => {
        try {
            const request = response.request();
            const url = request.url();
            const resourceType = request.resourceType();
            const method = request.method();
            const key = `${method} ${url}`;

            if (["xhr", "fetch"].includes(resourceType) && !shouldIgnoreRequest(url)) {
                if (trackedRequests.has(key)) {
                    const existing = trackedRequests.get(key);
                    const status = response.status();
                    const headers = response.headers();
                    const contentType = headers['content-type'] || '';

                    let body = null;
                    if (contentType.includes('application/json')) {
                        try {
                            body = await response.json();
                        } catch (err) {
                            body = await response.text();
                        }
                    } else {
                        body = await response.text();
                    }
                    trackedRequests.set(key, {
                        ...existing,
                        status,
                        responseHeaders: headers,
                        cookiesReceived: headers['set-cookie'] || null,
                        responseBody:body,
                    });
                }
            }
        } catch {
        }
    });

    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    await new Promise(resolve => setTimeout(resolve, delay));

    await browser.close();
    return Array.from(trackedRequests, ([name, value]) => (value));
}

module.exports = {runScanner};
