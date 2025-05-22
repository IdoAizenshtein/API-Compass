'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState([]);
    const [headful, setHeadful] = useState(false);
    const [delay, setDelay] = useState(2000);
    const [loading, setLoading] = useState(false);

    const scanAPI = async () => {
        setLoading(true);
        setResult([]);
        try {
            const response = await axios.post('http://localhost:3000/scan', {
                url,
                headful,
                delay
            });
            setResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <main className="container">
                <header className="main-header text-center">
                    <h1>
                        API <span>Scanner</span>
                    </h1>
                    <p>
                        Discover and analyze API endpoints with precision
                    </p>
                </header>

                <section className="card">
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter URL to scan..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={headful}
                                onChange={(e) => setHeadful(e.target.checked)}
                            />
                            <span>Headful Mode</span>
                        </label>

                        <div className="checkbox-container">
                            <input
                                type="number"
                                className="form-control"
                                value={delay}
                                onChange={(e) => setDelay(parseInt(e.target.value))}
                                placeholder="Delay"
                            />
                            <span style={{ marginLeft: '8px' }}>ms</span>
                        </div>
                    </div>

                    <div className="btn-container">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={scanAPI}
                            disabled={loading}
                        >
                            {loading ? 'Scanning...' : 'Start Scan'}
                        </button>
                    </div>
                </section>

                <section className="card">
                    <h2 className="text-center">Scan Results</h2>
                    {result.length > 0 ? (
                        <ul className="results-list">
                            {result.map((e, i) => (
                                <li key={i} className="result-item">
                                    <span className={`method-badge method-${e.method.toLowerCase()}`}>
                                        {e.method}
                                    </span>
                                    <span className="url-display">
                                        {e.url}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-results">
                            No results yet. Start a scan to see endpoints here.
                        </p>
                    )}
                </section>

                <section className="card">
                    <h2 className="text-center">Documentation</h2>
                    <div className="docs-grid">
                        {[
                            { href: "http://localhost:3000/docs", text: "Swagger UI", desc: "Interactive API docs" },
                            { href: "http://localhost:3000/docs/openapi", text: "OpenAPI", desc: "API specification" },
                            { href: "http://localhost:3000/docs/markdown", text: "Markdown", desc: "MD documentation" }
                        ].map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="doc-link"
                            >
                                <h3>{link.text}</h3>
                                <p>{link.desc}</p>
                            </a>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}