const fetch = require('node-fetch'); // May need to use dynamic import if ES modules are enforced, but trying standard require first for simplicity in scripts or just global fetch in node 18+

async function testConnection() {
    console.log("Testing connection to http://127.0.0.1:8001/ ...");
    try {
        const res = await fetch('http://127.0.0.1:8001/');
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Response:", data);
            console.log("SUCCESS: Backend is reachable!");
        } else {
            console.log("FAILED: Backend returned error status");
        }
    } catch (error) {
        console.error("FATAL ERROR: Could not connect to backend.");
        console.error("Details:", error.cause || error.message);
    }
}

// Check if running in an environment with global fetch (Node 18+)
if (!globalThis.fetch) {
    console.log("Global fetch not found, using minimal http request...");
    const http = require('http');
    http.get('http://127.0.0.1:8001/', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log("Status:", res.statusCode);
            console.log("Response:", data);
        });
    }).on("error", (err) => {
        console.error("Error:", err.message);
    });
} else {
    testConnection();
}
