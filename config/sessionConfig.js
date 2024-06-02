// sessionConfig.js
const session = require('express-session');

const sessionConfig = session({
  secret: 'your_secret_here',
  resave: false,
  saveUninitialized: false,
});

module.exports = sessionConfig;
