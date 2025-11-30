import express from "express";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocketServer({ server });

// Broadcast to all clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
}

// HTTP POST endpoint for Roblox
app.post("/donation", (req, res) => {
  const data = req.body;
  console.log("Donation received:", data);
  broadcast(data);
  res.send({ status: "ok" });
});

// Optional: send test messages every 30 seconds
setInterval(() => {
  broadcast({
    UserId: 0,
    Username: "TestUser",
    Amount: Math.floor(Math.random() * 100),
    Message: "Test donation"
  });
}, 30000);
