const express = require("express");

const {
    createUser,
    assignStudent
} = require("../controllers/auth.controller");

const authrouter = express.Router();

authrouter.post("/create-user", createUser);
authrouter.post("/assign-student",assignStudent);

module.exports = authrouter;