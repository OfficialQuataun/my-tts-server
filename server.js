import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors()); // optional if needed

// Root route
app.get("/", (req, res) => res.send("WebSocket TTS server running"));

// Create HTTP server
const server = app.listen(8080, () => console.log("Server running on port 8080"));

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Broadcast function
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection
wss.on("connection", (ws) => {
  console.log("Client connected");
});

// POST donations from Roblox
app.post("/donation", (req, res) => {
  const { UserId, Username, Amount, Message } = req.body;

  if (!UserId || !Username || !Amount) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Broadcast to all connected overlays
  broadcast({ UserId, Username, Amount, Message });
  console.log(`Donation posted: ${Username} -> ${Amount} Robux`);

  res.status(200).json({ success: true });
});
