function generateMarkdown(schemas) {
    let md = `# API Documentation\n\n`;

    schemas.forEach(entry => {
        const { method, url, status, schema } = entry;
        if (schema) {
            md += `## ${method.toUpperCase()} ${url} (Status: ${status})\n\n`;

            md += `### Schema:\n\n`;

            md += `\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`;
        }
    });

    return md;
}

function generateOpenAPI(schemas) {
    const openApi = {
        openapi: '3.0.0',
        info: {
            title: 'API Endpoints',
            version: '1.0.0',
        },
        paths: {},
    };

    schemas.forEach(entry => {
        const { method, url, status, schema } = entry;
        if (schema) {
            const path = url.replace(/^https?:\/\/[^/]+/, ''); // מסירים את ה־host

            openApi.paths[path] = openApi.paths[path] || {};

            openApi.paths[path][method.toLowerCase()] = {
                summary: `${method} ${url}`,
                responses: {
                    [status]: {
                        description: `Response for ${method} ${url}`,
                        content: {
                            'application/json': {
                                schema: schema,
                            },
                        },
                    },
                },
            };
        }
    });

    return openApi;
}

module.exports = { generateMarkdown, generateOpenAPI };
