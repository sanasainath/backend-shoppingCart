
const path = require('path');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const model = require('../model/usermodel');
const jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer')
exports.SignIng = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Find the user based on the provided email
    const user = await model.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the provided password matches the stored hashed password
    const passwordMatches = await user.authenticate(password);
    if (passwordMatches) {
      // Check if the provided role matches the role stored in the database
      if (user.role === role) {
        const token = jwt.sign(
          { userId: user._id, role: user.role, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '10h' }
        );

        return res.status(200).json({
          token: token,
          expiresIn: 10000, // Expiration time in seconds
          profile: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid role' });
      }
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    // Handle any errors that occur during the query
    console.error('Error occurred:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.SignIngUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
console.log("checking signup time ",req.body);
    const existingUser = await model.findOne({ email: req.body.email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const { firstName, lastName, email, password, userName,role } = req.body;
    const user1 = new model({
      firstName,
      lastName,
      email,
      password,
      userName: Math.random().toString(),
      role,
    });

    await user1.save();

    // Sending welcome email to the user
    const transporter = nodemailer.createTransport({
      // Configure your email transport here
    });

    // const mailOptions = {
    //   from: '"Your App" <noreply@yourapp.com>',
    //   to: user1.email,
    //   subject: 'Welcome to Your App',
    //   text: `Hello ${user1.firstName},\n\nWelcome to Your App!`,
    // };

    // await transporter.sendMail(mailOptions);

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    // Handle any errors that occur during the query or save operation
    console.error('Error occurred:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};