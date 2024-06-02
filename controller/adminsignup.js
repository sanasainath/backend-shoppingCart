// const path = require('path');
// const { body, validationResult } = require('express-validator');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config({ path: './config.env' });
// const AdminModel = require('../model/adminmodel'); // Use AdminModel for the admin
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// exports.AdminSignIng = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     // Find the admin based on the provided email
//     const admin = await AdminModel.findOne({ email }).exec();
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     // Check if the provided password matches the stored hashed password
//     const passwordMatches = await admin.authenticate(password);
//     if (passwordMatches) {
//       const token = jwt.sign(
//         { userId: admin._id, role: admin.role, email: admin.email },
//         process.env.JWT_SECRET,
//         { expiresIn: '10h' }
//       );
//       return res.status(200).json({
//         token: token,
//         expiresIn: 10000, // Expiration time in seconds
//         profile: {
//           _id: admin._id,
//           firstName: admin.firstName,
//           lastName: admin.lastName,
//           email: admin.email,
//           role: admin.role
//         }
//       });
//     } else {
//       return res.status(401).json({ message: 'Invalid password' });
//     }
//   } catch (error) {
//     // Handle any errors that occur during the query
//     console.error('Error occurred:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// exports.AdminSignIngUp = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const existingAdmin = await AdminModel.findOne({ email: req.body.email }).exec();
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists' });
//     }

//     const { firstName, lastName, email, password, userName } = req.body;
//     const admin1 = new AdminModel({ firstName, lastName, email, password, userName: Math.random().toString() });

//     await admin1.save();
//     return res.status(201).json({ message: 'Admin created successfully' });
//   } catch (error) {
//     // Handle any errors that occur during the query or save operation
//     console.error('Error occurred:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };
