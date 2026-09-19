const { createClient } = require("redis");

const publisher = createClient({
    url: "redis://localhost:6379"
});

const subscriber = publisher.duplicate();

publisher.on("error", console.error);
subscriber.on("error", console.error);

const start = async () => {
    await publisher.connect();
    await subscriber.connect();

    console.log("Both Redis clients connected");

    await subscriber.subscribe("assignment-created", (message) => {
        console.log("Received message:", message);
    });

    console.log("Subscribed to assignment-created");

    setTimeout(async () => {
        await publisher.publish(
            "assignment-created",
            JSON.stringify({
                assignmentId: "123",
                teacherId: "456",
                title: "Operating Systems Assignment"
            })
        );

        console.log("Message published");
    }, 2000);
};

start();