function getNormalizedEndpoints(endpoints) {
    return Array.from(endpoints).map(endpoint => {
        const [method, ...urlParts] = endpoint.split(' ');
        const fullUrl = urlParts.join(' ');
        const normalized = normalizeUrl(fullUrl);
        return {method, url: normalized};
    });
}

function extractQueryParams(url) {
    try {
        const parsed = new URL(url);
        const params = [];

        parsed.searchParams.forEach((value, key) => {
            params.push({
                name: key,
                in: 'query',
                required: false,
                schema: {type: 'string'},
                example: value
            });
        });

        return params;
    } catch (e) {
        return [];
    }
}

function normalizeUrl(url) {
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname;
        return pathname.replace(/\/\d+(?=\/|$)/g, '/{id}');
    } catch (e) {
        return url;
    }
}

module.exports = {normalizeUrl, extractQueryParams};