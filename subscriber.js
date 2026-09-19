const { createClient } = require("redis");

const subscriber = createClient({
    url: process.env.REDIS_URL
});

subscriber.on("error", (error) => {
    console.error("Redis Subscriber Error:", error);
});

const connectSubscriber = async () => {
    await subscriber.connect();

    console.log("Redis Subscriber connected");
};

module.exports = {
    subscriber,
    connectSubscriber
};