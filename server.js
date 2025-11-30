const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", ws => {
  clients.push(ws);
  ws.on("close", () => (clients = clients.filter(c => c !== ws)));
});

app.post("/donation", (req, res) => {
  const donation = req.body;

  if (!donation.Username || !donation.Amount) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Broadcast to all overlays
  clients.forEach(ws => ws.send(JSON.stringify(donation)));

  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
