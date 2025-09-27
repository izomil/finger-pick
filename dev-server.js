#!/usr/bin/env node

/**
 * Servidor de desenvolvimento simples para Finger Pick
 * 
 * Uso:
 * node dev-server.js
 * ou
 * npm start
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load configuration
const config = require('./config/dev-server.config.js');

const PORT = config.port;
const HOST = config.host;

// Use configuration
const mimeTypes = config.mimeTypes;
const pwaHeaders = config.pwaHeaders;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Remove leading slash
    const filePath = pathname.substring(1);
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    
    // Default to index.html if file doesn't exist
    const fullPath = path.join(__dirname, filePath);
    
    // First check if it's a directory
    fs.stat(fullPath, (statErr, stats) => {
        if (!statErr && stats.isDirectory()) {
            console.log('Directory found, serving listing:', fullPath);
            serveDirectoryListing(fullPath, res);
        } else {
            // Check if it's a file
            fs.access(fullPath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.log('File not found, trying index.html');
                    // Try index.html for SPA routing
                    const indexPath = path.join(__dirname, 'index.html');
                    fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
                        if (indexErr) {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('File not found');
                        } else {
                            serveFile(indexPath, res);
                        }
                    });
                } else {
                    console.log('File found, serving:', fullPath);
                    serveFile(fullPath, res);
                }
            });
        }
    });
});

function serveDirectoryListing(dirPath, res) {
    console.log('Serving directory listing for:', dirPath);
    
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.log('Error reading directory:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Directory read error: ' + err.message);
            return;
        }
        
        console.log('Files found:', files);
        
        // Generate HTML directory listing
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Directory Listing</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        ul { list-style: none; padding: 0; }
        li { margin: 5px 0; }
        a { text-decoration: none; color: #0066cc; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Directory Listing</h1>
    <ul>
        ${files.map(file => `<li><a href="${file}">${file}</a></li>`).join('')}
    </ul>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
}

function serveFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set headers
    const headers = {
        'Content-Type': mimeType,
        'Cache-Control': ext === '.js' || ext === '.css' ? 'no-cache' : 'public, max-age=3600',
        ...pwaHeaders
    };
    
    // Special headers for Service Worker
    if (filePath.endsWith('sw.js')) {
        headers['Cache-Control'] = 'no-cache';
        headers['Service-Worker-Allowed'] = '/';
    }
    
    // Special headers for manifest
    if (filePath.endsWith('manifest.json')) {
        headers['Content-Type'] = 'application/manifest+json';
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
            return;
        }
        
        res.writeHead(200, headers);
        res.end(data);
    });
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Finger Pick Dev Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log(`   http://192.168.0.100:${PORT}`);
    console.log(`\n📱 Para testar no mobile:`);
    console.log(`   1. Acesse http://192.168.0.100:${PORT}`);
    console.log(`   2. Teste a instalação PWA`);
    console.log(`\n🛑 Para parar: Ctrl+C`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use`);
        console.log(`   Try a different port: PORT=3001 node dev-server.js`);
    } else {
        console.log('❌ Server error:', err.message);
    }
    process.exit(1);
});

