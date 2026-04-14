import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.ORBITAL_WS_PORT) || 3101;
const wss = new WebSocketServer({ port: PORT });

interface OrbitalMessage {
  type: 'animation' | 'color' | 'brightness' | 'command';
  payload: unknown;
}

const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[Orbital WS] Client connected (${clients.size} total)`);

  ws.on('message', (data) => {
    try {
      const msg: OrbitalMessage = JSON.parse(data.toString());
      console.log(`[Orbital WS] Received:`, msg);

      // Broadcast to all other clients (for ESP32 / HA bridge)
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      }
    } catch (err) {
      console.error('[Orbital WS] Invalid message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[Orbital WS] Client disconnected (${clients.size} total)`);
  });
});

console.log(`[Orbital WS] Server running on ws://localhost:${PORT}`);
console.log(`[Orbital WS] Ready to bridge: Browser <-> ESP32 <-> Home Assistant`);
