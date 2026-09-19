const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const studentId = "6aacfaca91438596fb36964b";

socket.on("connect", () => {

    console.log(
        "Connected to server:",
        socket.id
    );

    socket.emit(
        "join-user-room",
        studentId
    );
});

socket.on("new-assignment", (data) => {

    console.log(
        "🔔 NEW ASSIGNMENT!"
    );

    console.log(data);
});

socket.on("disconnect", () => {

    console.log(
        "Disconnected from server"
    );
});