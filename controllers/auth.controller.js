const User = require("../models/user.model.js")

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!["TEACHER", "STUDENT"].includes(role)) {
            return res.status(400).json({
                message: "Role must be TEACHER or STUDENT"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        res.status(201).json({
            message: `${role} created successfully`,
            user
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const assignStudent = async (req, res) => {
    try {
        const { teacherId, studentId } = req.body;

        // Check required fields
        if (!teacherId || !studentId) {
            return res.status(400).json({
                message: "teacherId and studentId are required"
            });
        }

        // Check teacher
        const teacher = await User.findOne({
            _id: teacherId,
            role: "TEACHER"
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        // Check student
        const student = await User.findOne({
            _id: studentId,
            role: "STUDENT"
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Assign student to teacher
        student.teacherId = teacherId;

        await student.save();

        res.status(200).json({
            message: "Student assigned successfully",
            student: {
                id: student._id,
                name: student.name,
                teacherId: student.teacherId
            }
        });

    } catch (error) {
        console.error("Assign student error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



module.exports = {
    createUser,assignStudent
};