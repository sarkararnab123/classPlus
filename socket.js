const { Server } = require("socket.io");

let io;

const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-user-room", (userId) => {
            socket.join(`student:${userId}`);

            console.log(
                `User ${userId} joined student:${userId}`
            );
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};