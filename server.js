import express from "express";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocketServer({ server });

// Keep track of last broadcast per user to prevent duplicates
const lastBroadcast = {};

// Broadcast donation to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
}

// Donation POST endpoint
app.post("/donation", (req, res) => {
  const data = req.body;

  // Ensure required fields
  if (!data.UserId || !data.Username || !data.Amount) return res.status(400).send({status:"ignored"});

  // Convert UserId and Amount to number
  data.UserId = Number(data.UserId);
  data.Amount = Number(data.Amount);

  // Prevent duplicates (if needed)
  const key = `${data.UserId}-${data.Amount}-${data.Message}`;
  if (lastBroadcast[key]) return res.status(200).send({status:"ignored"});
  lastBroadcast[key] = true;

  console.log("Donation received:", data);
  broadcast(data);

  res.send({ status: "ok" });
});
