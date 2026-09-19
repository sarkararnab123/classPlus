const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.js");
const { connectRedis } = require("./redis.js");
const { initializeSocket } = require("./socket.js");

const assignmentRoutes = require("./routes/assignment.routes.js");
const {startNotificationSubscriber} = require("./bullmq/notification.subscriber.js");
const authrouter = require("./routes/auth.routes.js");

const app = express();

const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

connectDB();
connectRedis();
startNotificationSubscriber();

//routes


app.use("/api/auth", authrouter)
app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "ClassPlus Backend is running"
    });
});

initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});