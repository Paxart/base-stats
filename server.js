const http = require('http');
const fs = require('fs');
const path = require('path');

// Función para servir archivos JSON
function serveJson(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Función para servir archivos HTML
function serveHtml(res, filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error interno del servidor');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(data);
  });
}

// Datos de ejemplo de Base blockchain
const mockBaseStats = {
  success: true,
  data: {
    latestBlockNumber: 12345678,
    latestBlockTimestamp: new Date().toISOString(),
    diem: {
      totalTransactions: 1250,
      totalVolume: "45678.123456789",
      transactions: [
        {
          hash: "0xabc123...",
          from: "0xdef456...",
          to: "0xghi789...",
          value: "123.456789",
          timestamp: new Date().toISOString()
        }
      ]
    }
  }
};

// Función para generar estadísticas de usuario
function generateUserStats(username) {
  // Generar una dirección Ethereum ficticia basada en el nombre de usuario
  const addressHash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const address = '0x' + addressHash.toString(16).padStart(40, '0').slice(0, 40);
  
  // Generar estadísticas aleatorias pero consistentes para el mismo usuario
  const randomSeed = addressHash % 1000;
  const diemBalance = (randomSeed / 100).toFixed(4);
  const transactions24h = Math.floor(randomSeed / 10);
  const volume24h = (randomSeed * 0.5).toFixed(4);
  
  // Generar transacciones recientes
  const recentTransactions = [];
  for (let i = 0; i < Math.min(5, transactions24h); i++) {
    const isOutgoing = i % 2 === 0;
    recentTransactions.push({
      type: isOutgoing ? 'Enviado' : 'Recibido',
      value: (Math.random() * 10).toFixed(4),
      timestamp: new Date(Date.now() - i * 3600000).toISOString()
    });
  }
  
  return {
    username,
    address,
    diemBalance,
    transactions24h,
    volume24h,
    recentTransactions
  };
}

// Crear el servidor
const server = http.createServer((req, res) => {
  // Configurar CORS para todas las respuestas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Soporte para Farcaster Frames
  res.setHeader('X-Farcaster-Frames', 'vNext');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Enrutamiento básico
  if (req.url === '/api/stats' && req.method === 'GET') {
    serveJson(res, mockBaseStats);
  } else if (req.url.startsWith('/api/user/') && req.url.endsWith('/stats') && req.method === 'GET') {
    // Extraer el nombre de usuario de la URL
    const urlParts = req.url.split('/');
    const username = decodeURIComponent(urlParts[3]);
    
    if (!username) {
      serveJson(res, { success: false, error: 'Nombre de usuario no proporcionado' });
      return;
    }
    
    // Generar estadísticas para el usuario
    const userStats = generateUserStats(username);
    serveJson(res, { success: true, data: userStats });
  } else if (req.url === '/' && req.method === 'GET') {
    // Servir el HTML principal
    const indexPath = path.join(__dirname, 'index.html');
    serveHtml(res, indexPath);
  } else if (req.url === '/.well-known/farcaster.json' && req.method === 'GET') {
    // Servir el manifiesto de Farcaster
    const manifestPath = path.join(__dirname, 'manifest.json');
    fs.readFile(manifestPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Error al cargar el manifiesto' }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  } else if (req.url.endsWith('.css') && req.method === 'GET') {
    // Servir archivos CSS
    const cssPath = path.join(__dirname, req.url);
    serveHtml(res, cssPath);
  } else if (req.url.endsWith('.js') && req.method === 'GET') {
    // Servir archivos JavaScript
    const jsPath = path.join(__dirname, req.url);
    serveHtml(res, jsPath);
  } else if (req.url === '/favicon.ico' && req.method === 'GET') {
    // Ignorar solicitud de favicon
    res.writeHead(204);
    res.end();
  } else {
    // Para cualquier otra ruta, intentar servir el archivo estático
    const staticPath = path.join(__dirname, req.url);
    
    fs.readFile(staticPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Ruta no encontrada" }));
        return;
      }
      
      // Determinar el tipo de contenido basado en la extensión del archivo
      const ext = path.extname(staticPath);
      let contentType = 'text/plain';
      
      if (ext === '.html') contentType = 'text/html';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api/stats`);
  console.log(`🌐 Interfaz web disponible en http://localhost:${PORT}`);
  console.log(`📦 Manifiesto de Farcaster disponible en http://localhost:${PORT}/.well-known/farcaster.json`);
});