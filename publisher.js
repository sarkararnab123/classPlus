const { createClient } = require("redis");

const publisher = createClient({
    url: process.env.REDIS_URL
});

publisher.on("error", (error) => {
    console.error("Redis Publisher Error:", error);
});

const connectPublisher = async () => {
    await publisher.connect();

    console.log("Redis Publisher connected");
};

module.exports = {
    publisher,
    connectPublisher
};