# API Compass

Automatically discover, document, and test API endpoints with precision. API Compass scans web applications to generate comprehensive OpenAPI specifications and interactive documentation.

## Project Overview

API Compass is a comprehensive full-stack application designed to automatically discover, document, and test API endpoints. It combines a powerful backend scanning engine with an intuitive frontend interface, allowing developers to quickly map out APIs and generate professional documentation with minimal effort.

## Key Features

- **Automated API Discovery**: Scan websites to automatically detect and document API endpoints
- **Documentation Generation**: Create OpenAPI/Swagger specifications and Markdown documentation
- **Interactive Documentation**: Explore APIs through Swagger UI with testing capabilities
- **High Performance**: Redis caching and Node.js clustering for optimal performance
- **Security Focused**: Implements rate limiting, XSS protection, and Content Security Policy
- **Developer Friendly**: Simple interface for scanning and viewing results
- **API Proxy**: Built-in proxy functionality to avoid CORS issues during testing

## Project Structure

The project is organized into two main components:

### Backend (Node.js/Express)
- **Core Modules**:
  - `index.js`: Main Express server with API routes
  - `scanner.js`: Puppeteer-based API scanning engine
  - `swagger.js`: OpenAPI/Swagger specification generator
  - `documentation.js`: Markdown documentation generator
  - `redisClient.js`: Redis caching implementation
  - `server.js`: Multi-core clustering for scalability
  - `utils/normalizeUrl.js`: URL normalization utilities

### Frontend (Next.js/React)
- **Core Components**:
  - `pages/index.js`: Main scanning interface with form controls and results display
  - `pages/_app.js` & `pages/_document.js`: Next.js configuration
  - `styles/`: CSS and styling with TailwindCSS support
  - `public/`: Static assets

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Redis server
- Modern web browser

## Installation & Setup

### Setting Up the Backend

1. Clone the repository:

   git clone <repository-url>
   cd api-compass

2. Install backend dependencies:

   cd backend
   npm install

3. Ensure Redis is running:

   redis-server

4. Start the backend server:

   # For development (single process)
   node index.js
   
   # For production (cluster mode)
   node server.js

   The backend will be available at http://localhost:3000

### Setting Up the Frontend

1. Install frontend dependencies:

   cd frontend
   npm install

2. Start the frontend development server:

   npm run dev

   The frontend will be available at http://localhost:3001 (with Next.js & Turbopack)

3. For production build:

   npm run build
   npm run start

## Usage Guide

### Scanning an API

1. Open the frontend application in your browser
2. Enter the target URL you want to scan in the input field
3. Configure optional settings:
   - **Headful Mode**: Toggle to see the browser during scanning (useful for debugging)
   - **Delay**: Set milliseconds to wait after page load (allows dynamic content to load)
4. Click "Start Scan"
5. View the discovered endpoints in the results section

### Accessing Documentation

After scanning, you can access the generated documentation through:

- **Swagger UI**: Interactive API documentation with testing capabilities
  - URL: http://localhost:3000/docs
- **OpenAPI JSON**: Raw OpenAPI specification
  - URL: http://localhost:3000/docs/openapi.json
- **Markdown**: Detailed Markdown documentation
  - URL: http://localhost:3000/docs/markdown

The frontend provides convenient links to all documentation types.

## API Reference

### Backend Endpoints

#### POST /scan
Scan a website for API endpoints.

**Request Body:**

{
  "url": "https://example.com",
  "delay": 2000,
  "headful": false
}

**Response:** Array of detected API endpoints with request and response details.

#### GET /docs/openapi.json
Get the OpenAPI specification of discovered endpoints.

#### GET /docs/markdown
Get Markdown documentation of discovered endpoints.

#### ALL /proxy?target={targetUrl}
Proxy API requests to avoid CORS issues.

## Technologies Used

### Backend
- **Express.js**: Web framework for RESTful API
- **Puppeteer**: Headless Chrome automation for scanning
- **Redis/IoRedis**: In-memory data store
- **Swagger UI**: Interactive API documentation
- **Helmet**: Security middleware for HTTP headers
- **XSS**: Input sanitization
- **Node.js Cluster**: Process scaling

### Frontend
- **Next.js**: React framework with SSR support
- **React**: UI library (v19.1.0)
- **Axios**: HTTP client for API requests
- **TailwindCSS**: Utility-first CSS framework
- **Turbopack**: Fast bundling for development

## Configuration Options

### Backend Environment Variables
- `PORT`: Server port (default: 3000)

### Frontend Customization
- Edit `next.config.mjs` for Next.js configuration
- Modify TailwindCSS settings in `postcss.config.mjs` and `tailwind.config.js`

## Security Features

- **Rate Limiting**: Prevents abuse with request limits
- **Content Security Policy**: Restricts resource loading to prevent attacks
- **Input Sanitization**: XSS protection for all user inputs
- **Error Handling**: Prevents leaking sensitive information
- **Secure Middleware**: Uses Helmet for security headers

## Performance Optimizations

- **Redis Caching**: Improves response times by caching scan results
- **Node.js Clustering**: Utilizes multiple CPU cores for parallel processing
- **Next.js Optimization**: Frontend uses Turbopack for faster development

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Ido Aizenshtein

## Frontend Interface

The frontend provides an intuitive interface with:

1. **URL Input Form**: Enter the target website to scan
2. **Configuration Options**:
   - Toggle headful mode for browser visibility
   - Set delay duration for dynamic content
3. **Results Display**: View discovered API endpoints with method badges
4. **Documentation Links**: Easy access to Swagger UI, OpenAPI, and Markdown documentation

The UI is built with React and styled using TailwindCSS for a clean, responsive experience.

---

Powered by Node.js, Express, Puppeteer, Redis, Next.js, and React.
