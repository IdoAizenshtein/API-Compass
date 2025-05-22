const express = require('express');
const bodyParser = require('body-parser');
const {runScanner} = require('./scanner');
const swaggerUi = require('swagger-ui-express');
const {generateOpenAPI, generateMarkdown} = require('./swagger');
const cors = require('cors');
const xss = require('xss');
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
const {saveToRedis, loadFromRedis} = require('./redisClient');
const swaggerUiDist = require('swagger-ui-dist');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    })
);

function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log the error for debugging
    res.status(500).json({error: 'Something went wrong!'});
}

function sanitizeInput(input) {
    if (typeof input === 'string') {
        return xss(input);
    } else if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    } else if (input !== null && typeof input === 'object') {
        const sanitized = {};
        for (const key in input) {
            sanitized[key] = sanitizeInput(input[key]);
        }
        return sanitized;
    } else {
        return input;
    }
}

function sanitizeMiddleware(req, res, next) {
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);
    next();
}

app.use(sanitizeMiddleware);
app.use(errorHandler);

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

app.use(limiter);
app.use('/swagger-ui', express.static(swaggerUiDist.getAbsoluteFSPath()));

app.get('/', (req, res) => {
    res.send('Hello from worker ' + process.pid);
});

app.post('/scan', async (req, res) => {
    const {url, delay = 0, headful = false} = req.body;
    if (!url) {
        return res.status(400).send({error: 'URL parameter is required'});
    }
    try {
        const result = await runScanner(url, delay, headful);
        const clientId = req.ip;
        await saveToRedis(`endpoints:${clientId}`, result);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

app.get('/docs/openapi', async (req, res) => {
    try {
        const endpoints = await loadFromRedis(`endpoints:${req.ip}`);
        if (!endpoints || endpoints.length === 0) {
            res.status(404).send('No endpoints found');
            return;
        }

        const spec = generateOpenAPI(endpoints, true);
        res.json(spec);
    } catch (err) {
        res.status(500).send('Error generating OpenAPI JSON');
    }
});

app.get('/docs/markdown', async (req, res) => {
    try {
        const endpoints = await loadFromRedis(`endpoints:${req.ip}`);
        if (!endpoints || endpoints.length === 0) {
            res.status(404).send('No endpoints found');
            return;
        }

        const markdown = generateMarkdown(endpoints);
        res.type('text/markdown').send(markdown);
    } catch (err) {
        res.status(500).send('Error generating Markdown');
    }
});
app.get('/docs/openapi.json', async (req, res) => {
    try {
        const endpoints = await loadFromRedis(`endpoints:${req.ip}`);
        if (!endpoints || endpoints.length === 0) {
            return res.status(404).send({error: 'No OpenAPI data available'});
        }

        const spec = generateOpenAPI(endpoints);
        res.json(spec);
    } catch (err) {
        console.error('Error generating OpenAPI spec:', err);
        res.status(500).send({error: 'Failed to generate OpenAPI spec'});
    }
});
app.use('/docs', swaggerUi.serve);
app.get('/docs', (req, res) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}'`);

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Docs</title>
            <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
        </head>
        <body>
        <div id="swagger-ui"></div>
        <script src="/swagger-ui/swagger-ui-bundle.js"></script>
        <script nonce="${nonce}">
          const ui = SwaggerUIBundle({
            url: '/docs/openapi.json',
            dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                 SwaggerUIBundle.presets.apis,
                 SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: 'BaseLayout'
          });
        </script>
        </body>
        </html>
    `);
});

app.all('/proxy', async (req, res) => {
    const targetUrl = req.query.target;

    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).json({error: 'Missing or invalid target URL'});
    }

    const targetHost = new URL(targetUrl).host;
    try {
        const method = req.method.toLowerCase();
        console.log('----------', {
            url: targetUrl,
            method: method,
            headers: {
                ...req.headers,
                host: targetHost,
                origin: `https://${targetHost}`,
                referer: `https://${targetHost}/`,
            },
            data: req.body || {},
            withCredentials: true,
        })

        const response = await axios(method === 'get' ? {
            url: targetUrl,
            method,
            headers: {
                ...req.headers,
                host: targetHost,
            },
            withCredentials: true,
        } : {
            url: targetUrl,
            method: method,
            headers: {
                ...req.headers,
                host: targetHost,
                origin: `https://${targetHost}`,
                referer: `https://${targetHost}/`,
            },
            data: req.body || {},
            withCredentials: true,
        });
        res.set('Access-Control-Allow-Origin', '*');
        res.status(response.status).send(response.data);
    } catch (error) {
        // console.log(error)
        const status = error.response?.status || 500;
        const data = error.response?.data || {error: 'Proxy Error'};
        res.status(status).send(data);
    }
});
app.listen(PORT, () => {
    console.log('🚀 API running on http://localhost:3000');
    console.log(`✅ Worker ${process.pid} listening on port ${PORT}`);
});