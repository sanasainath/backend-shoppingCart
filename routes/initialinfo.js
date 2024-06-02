const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
const initialDataController = require("../controller/intitalData"); // Import the entire module
dotenv.config({ path: './config.env' });
router.post('/initialdata', initialDataController.initialData); // Use the imported module
module.exports = router;
