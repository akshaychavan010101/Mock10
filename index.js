const http = require("http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const socketio = require("socket.io");
const { connection } = require("./config/db");
const { UserRouter } = require("./routes/users.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(UserRouter);
const server = http.createServer(app);

const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });
});

server.listen(3000, async () => {
  try {
    await connection;
  } catch (error) {
    console.log(error);
  }
  console.log("server is listening on port 3000");
});
