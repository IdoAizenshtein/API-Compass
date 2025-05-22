const {normalizeUrl, extractQueryParams} = require('./utils/normalizeUrl');

function parseCookies(cookieHeader) {
    if (!cookieHeader) return [];
    const cookies = Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader];

    return cookies.flatMap(cookieStr =>
        cookieStr.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            return {
                name,
                value: rest.join('=')
            };
        })
    );
}


function generateOpenAPI(endpoints, originUrl) {
    if (!Array.isArray(endpoints) || endpoints.length === 0) {
        console.error('Invalid or empty endpoints');
        return null;
    }

    const paths = endpoints.reduce((acc, endpoint) => {
        const {
            url,
            method,
            requestHeaders,
            responseBody,
            body,
            responseHeaders,
            status
        } = endpoint;

        if (!url || !method) {
            console.error(`Missing url or method for endpoint: ${JSON.stringify(endpoint)}`);
            return acc;
        }

        const normalizedUrl = url; //normalizeUrl(url);
        const queryParams = extractQueryParams(url);

        const methodObject = {
            description: `Endpoint for ${method.toUpperCase()} ${normalizedUrl}`,
            parameters: queryParams,
            requestBody: body && Object.keys(body).length > 0 ? {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            example: body
                        }
                    }
                }
            } : undefined,
            responses: {
                [status || 200]: {
                    description: 'Successful response',
                    headers: responseHeaders && Object.keys(responseHeaders).length > 0 ? Object.fromEntries(
                        Object.entries(responseHeaders).map(([name, value]) => [name, {
                            schema: {type: 'string'},
                            example: value
                        }])
                    ) : undefined,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                example: responseBody || {}
                            }
                        }
                    }
                }
            }
        };

        Object.keys(methodObject).forEach(key => {
            if (methodObject[key] === undefined) {
                delete methodObject[key];
            }
        });
        if (originUrl) {
            acc[normalizedUrl] = {
                ...acc[normalizedUrl],
                [method.toLowerCase()]: methodObject
            };
        } else {
            acc['/proxy' + '?target=' + normalizedUrl] = {
                ...acc['/proxy' + '?target=' + normalizedUrl],
                [method.toLowerCase()]: methodObject
            };
        }

        return acc;
    }, {});
    const uniqueOrigins = [...new Set(endpoints.map(ep => {
        try {
            return new URL(ep.url).origin;
        } catch (e) {
            return null;
        }
    }).filter(Boolean))];
    return {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Auto-generated API documentation'
        },
        // servers: uniqueOrigins.map(origin => ({
        //     url: origin,
        //     description: `Server at ${origin}`
        // })),
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Proxy Server'
            }
        ],
        paths
    };
}


function generateMarkdown(endpoints) {
    let markdown = `# API Documentation\n\n`;
    endpoints.forEach((endpoint, index) => {
        const {
            method,
            url,
            status,
            requestHeaders,
            responseHeaders,
            body,
            responseBody,
            cookiesSent,
            cookiesReceived
        } = endpoint;

        if (!method || !url) return;

        markdown += `**Origin**: \`${new URL(url).origin}\`\n\n`;
        markdown += `## ${index + 1}. \`${method.toUpperCase()} ${url}\`\n\n`;
        markdown += `**Status**: ${status || 200}\n\n`;

        // Curl example
        markdown += `### Example Curl:\n`;
        markdown += '```bash\n';
        markdown += `curl -X ${method.toUpperCase()} "${url}"`;
        if (requestHeaders && Object.keys(requestHeaders).length) {
            Object.entries(requestHeaders).forEach(([key, value]) => {
                markdown += ` \\\n  -H "${key}: ${value}"`;
            });
        }
        if (body && Object.keys(body).length) {
            markdown += ` \\\n  -d '${JSON.stringify(body)}'`;
        }
        markdown += '\n```\n\n';

        // Request headers
        if (requestHeaders && Object.keys(requestHeaders).length) {
            markdown += `### Request Headers:\n`;
            for (const [key, value] of Object.entries(requestHeaders)) {
                markdown += `- ${key}: ${value}\n`;
            }
            markdown += `\n`;
        }

        // Cookies Sent
        if (cookiesSent) {
            const parsed = parseCookies(cookiesSent);
            if (parsed?.length) {
                markdown += `### Cookies Sent:\n`;
                parsed.forEach(({name, value}) => {
                    markdown += `- ${name}: ${value}\n`;
                });
                markdown += `\n`;
            }
        }

        // Request Body
        if (body && Object.keys(body).length) {
            markdown += `### Request Body:\n`;
            markdown += '```json\n' + JSON.stringify(body, null, 2) + '\n```\n\n';
        }

        // Response Headers
        if (responseHeaders && Object.keys(responseHeaders).length) {
            markdown += `### Response Headers:\n`;
            for (const [key, value] of Object.entries(responseHeaders)) {
                markdown += `- ${key}: ${value}\n`;
            }
            markdown += `\n`;
        }

        // Cookies Received
        if (cookiesReceived) {
            const parsed = parseCookies(cookiesReceived);
            if (parsed?.length) {
                markdown += `### Cookies Received:\n`;
                parsed.forEach(({name, value}) => {
                    markdown += `- ${name}: ${value}\n`;
                });
                markdown += `\n`;
            }
        }

        // Response Body
        if (responseBody && Object.keys(responseBody).length) {
            markdown += `### Response Body:\n`;
            markdown += '```json\n' + JSON.stringify(responseBody, null, 2) + '\n```\n\n';
        }

        markdown += `---\n\n`;
    });

    return markdown;
}


module.exports = {generateOpenAPI, generateMarkdown};