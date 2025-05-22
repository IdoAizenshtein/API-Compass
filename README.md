# API Compass - Automated API Discovery and Documentation Tool

API Compass is an open-source developer tool that automatically discovers, documents, and tests REST API endpoints. Built for API developers, testers, and documentation specialists, it helps you map and understand any web application's API surface without manual tracing.

## What is API Compass?

API Compass automatically scans web applications to detect API endpoints and generates comprehensive documentation in OpenAPI/Swagger format. It eliminates hours of manual API discovery and documentation work with a simple, automated workflow.

**Keywords**: API discovery tool, API documentation generator, Swagger generator, OpenAPI, REST API testing, API mapping, automated API detection, API scanner

### Key Features

- **Automated API Discovery**: Intelligently detects API endpoints from any web application
- **Interactive Documentation**: Generates Swagger UI with endpoint testing capabilities
- **Markdown Documentation**: Creates detailed API reference documentation
- **Normalized Endpoints**: Automatically identifies URL patterns and parameters
- **API Proxy**: Built-in proxy functionality to avoid CORS issues during testing
- **High Performance**: Redis caching and Node.js clustering for production deployments
- **Security-Focused**: Implements rate limiting, XSS protection, and Content Security Policy

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Redis server
- Modern web browser

### Quick Installation

1. Clone the repository:
   git clone https://github.com/IdoAizenshtein/api-compass.git
   cd api-compass

2. Install dependencies:
   npm install

3. Start the application:
   npm start

Visit http://localhost:3000 to access API Compass.

## Documentation

### API Discovery Process

API Compass works by:

1. Launching a headless browser to navigate target websites
2. Capturing network requests to identify API endpoints
3. Analyzing request/response patterns to determine API structure
4. Generating normalized endpoint documentation with parameter detection
5. Creating interactive Swagger UI for exploration and testing

### Usage Examples

Scanning a Single-Page Application:

POST /scan
{
  "url": "https://example.com",
  "delay": 2000,
  "headful": false
}

## Technology Stack

- **Backend**: Node.js, Express, Puppeteer, Redis/IoRedis
- **Frontend**: React, Next.js, Tailwind CSS
- **Documentation**: Swagger UI, OpenAPI 3.0
- **Performance**: Node.js Clustering, Redis Caching
- **Security**: Helmet, XSS Protection, Rate Limiting

## Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions to API Compass are greatly appreciated.

## Related Tools and Comparisons

- **API Compass vs. Postman**: API Compass automatically discovers endpoints, while Postman requires manual endpoint creation
- **API Compass vs. Swagger Inspector**: More comprehensive discovery and persistent documentation
- **API Compass vs. Manual Documentation**: Save hours of API documentation time with automated discovery

## Use Cases

- **API Development**: Quickly map existing APIs during development
- **API Testing**: Automatically discover endpoints to test
- **Documentation**: Generate up-to-date API documentation
- **API Migration**: Document legacy APIs before modernization
- **Security Audit**: Discover and review exposed API endpoints

## License

API Compass is licensed under the ISC License.

## Author

Created by Ido Aizenshtein

## SEO-Optimized Keywords

API discovery, API documentation, Swagger UI, OpenAPI, API testing, API scanner, REST API, API development tools, API endpoints, API mapping, API visualization, API proxy, API catalog, API inventory, headless browser, web crawler, automatic API detection, API documentation generator, REST API documentation, API specification
