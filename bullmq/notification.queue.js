const { Queue } = require("bullmq");

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: 6379
};

const notificationQueue = new Queue(
    "notification-queue",
    {
        connection
    }
);
notificationQueue.on("error", (error) => {
    console.error("BullMQ Queue Error:", error);
});

module.exports = notificationQueue;