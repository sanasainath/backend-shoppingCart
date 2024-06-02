const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const JWT_SECRET = 'your-secret-key';

// Generate a JWT token for a user
app.post('/generateToken', (req, res) => {
  const userData = {
    userId: '12345',
    email: 'user@example.com',
  };

  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};

// Protected route that requires a valid token
app.get('/protectedRoute', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
