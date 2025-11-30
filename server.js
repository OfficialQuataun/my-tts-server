import express from "express";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const server = app.listen(process.env.PORT || 8080, () =>
  console.log("Server running on port", process.env.PORT || 8080)
);

const wss = new WebSocketServer({ server });

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
}

// Endpoint Roblox calls when a donation happens
app.post("/donation", (req, res) => {
  const { UserId, Username, Amount, Message } = req.body;

  console.log("Donation received:", UserId, Username, Amount, Message);

  broadcast({
    userid: UserId,
    username: Username,
    amount: Amount,
    message: Message,
  });

  res.sendStatus(200);
});
