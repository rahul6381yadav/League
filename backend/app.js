const express = require("express");
const app = express();
const http = require("http");
const mongoose = require("mongoose");

//Web Sockets
// const setupWebsocket = require('./src/websocket/webSocketServer');
const { WebSocketServer, WebSocket } = require("ws");
const server = http.createServer(app);  // Use the same server for both
const wss = new WebSocketServer({ server });

const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const userRoute = require('./src/routes/userRoutes');
const contestRoutes = require('./src/routes/contestRoutes');
const cors = require('cors');
const path = require('path');
const jwtMiddleware = require("./src/middleware/jwtMiddleware");
const authRoute = require('./src/routes/authRoutes');
const morgan = require('morgan');
const multer = require('multer');
const multerS3 = require('multer-s3');
const S3 = require('./src/config/AwsConfig');
const logger = require('./src/config/logger');
const PORT = process.env.PORT || 4000;
connectDB();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res)
    ].join(' | ');
}, {stream: {write: (msg) => logger.info(msg.trim())}}));

app.use((req, res, next) => {
  const excludedRoutes = ["/user/login", "/user/signup", "/user/forgot-password", "/user/reset-password","/user/leeTrackLogin", "/user/verify-otp", "/user/create-user","/user/profilephoto"];
    if (excludedRoutes.includes(req.path)) {
        return next(); // Skip token verification for excluded routes
    }
    jwtMiddleware.verifyToken(req, res, next);
});

app.use("/api/v1", authRoute);
app.use("/user", userRoute);
app.use("/api/contest", contestRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({message: err.message || "Internal Server Error"});
});


app.get("/", (req, res) => {
    res.send("Hello World");
});

// In server.js
const clients = new Set(); // Track all connected clients

wss.on("connection", (socket) => {
  console.log("WebSocket connected");
  clients.add(socket);
  socket.isAlive = true;

  socket.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      console.log("Received message:", message);

      // Broadcast to all connected clients
      broadcastToAll(message);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on("close", () => {
    console.log("WebSocket disconnected");
    clients.delete(socket);
  });

  // Optional: Add ping/pong for connection health
  socket.on('pong', () => {
    socket.isAlive = true;
  });
});

// Broadcast to all connected clients
function broadcastToAll(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Optional: Ping clients periodically
setInterval(() => {
  clients.forEach(client => {
    if (!client.isAlive) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// setupWebsocket(server);