const {getIO}  = require("../socket.js")
const {subscriber,connectSubscriber} =require("../subscriber.js")

const startNotificationSubscriber = async () => {
    await connectSubscriber();

    await subscriber.subscribe(
        "assignment-notification",
        (message) => {

            console.log(
                "Notification event received:",
                message
            );

            const data = JSON.parse(message);

            const io = getIO();

            io.to(`student:${data.studentId}`).emit(
                "new-assignment",
                data
            );

            console.log(
                `Notification sent to student:${data.studentId}`
            );
        }
    );

    console.log(
        "Subscribed to assignment-notification"
    );
};

module.exports = {
    startNotificationSubscriber
};
