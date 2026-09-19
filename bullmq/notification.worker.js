const { Worker } = require("bullmq");
require("dotenv").config();
const User = require("../models/user.model.js");
const Notification = require("../models/notification.model.js");

const { createClient } = require("redis");
const connectDB = require("../config/db.js");


const connection = {
    host:  process.env.REDIS_HOST,
    port: 6379
};

const publisher = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

publisher.on("error", (error) => {
    console.error("Worker Redis Publisher Error:", error);
});

const startWorker = async () => {

    await connectDB();
    console.log("Worker MongoDB connected");

    await publisher.connect();


    console.log("Worker Redis publisher connected");

    const worker = new Worker(
        "notification-queue",

        async (job) => {

            console.log(
                `Processing job ${job.id}`
            );

            const {
                assignmentId,
                teacherId,
                title
            } = job.data;

            const students = await User.find({
                teacherId,
                role: "STUDENT"
            });

            console.log(
                `Found ${students.length} students`
            );

            for (const student of students) {

                const notification =
                    await Notification.create({
                        studentId: student._id,
                        assignmentId,
                        message: `New assignment: ${title}`
                    });

                await publisher.publish(
                    "assignment-notification",
                    JSON.stringify({
                        notificationId:
                            notification._id.toString(),

                        studentId:
                            student._id.toString(),

                        assignmentId,

                        message:
                            notification.message
                    })
                );

                console.log(
                    `Notification published for ${student.name}`
                );
            }

            return {
                success: true,
                studentsNotified: students.length
            };
        },

        {
            connection
        }
    );

    worker.on("completed", (job, result) => {
        console.log(
            `Job ${job.id} completed`,
            result
        );
    });

    worker.on("failed", (job, error) => {
        console.error(
            `Job ${job?.id} failed:`,
            error.message
        );
    });

    console.log("Notification worker started");
};

startWorker();