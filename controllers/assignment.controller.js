const notificationQueue = require("../bullmq/notification.queue.js");
const assignmentModel = require("../models/assignment.model.js");
const User = require("../models/user.model.js");


const createAssignment = async (req, res) => {
    try {
        const {
            teacherId,
            title,
            description,
            dueDate
        } = req.body;

        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        if (teacher.role !== "TEACHER") {
            return res.status(400).json({
                message: "Only teachers can create assignments"
            });
        }

        const assignment = await assignmentModel.create({
            title,
            description,
            teacherId,
            dueDate
        });

        await notificationQueue.add(
            "assignment-notification",
            {
                assignmentId: assignment._id.toString(),
                teacherId: teacher._id.toString(),
                title: assignment.title
            }
        );
        res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });

    } catch (error) {
        console.error("Create assignment error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createAssignment
};