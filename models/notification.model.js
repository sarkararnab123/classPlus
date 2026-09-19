const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", notificationSchema);