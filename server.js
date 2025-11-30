const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// STORE CONNECTED CLIENTS
let clients = [];

// On websocket connection
wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

// Receive donation POST from Roblox
app.post("/donation", async (req, res) => {
  const donation = req.body;

  // Generate TTS MP3
  const ttsURL = await generateTTS(
    `${donation.Username} donated ${donation.Amount} Robux via Developer Donate. ${donation.Message}`
  );

  donation.TTS = ttsURL; // Attach the MP3 URL

  // Broadcast to overlay clients
  clients.forEach(ws => {
    ws.send(JSON.stringify(donation));
  });

  res.json({ status: "ok" });
});

// FREE TTS API (returns MP3 URL)
async function generateTTS(text) {
  try {
    const response = await axios.post(
      "https://api.streamelements.com/kappa/v2/speech",
      {
        voice: "Brian",
        text: text
      }
    );
    return response.data.speak_url; // URL to MP3
  } catch (err) {
    console.error("TTS API Error:", err);
    return null;
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
