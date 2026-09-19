const express = require("express");

const {
    createAssignment
} = require("../controllers/assignment.controller.js");

const assignmentrouter = express.Router();

assignmentrouter.post("/", createAssignment);

module.exports = assignmentrouter;