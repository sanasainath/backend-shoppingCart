const express = require('express');
const { requireSignIn, userMiddleware,adminMiddleware } = require('../middleware/middleware');
const { getAddress,  addAddress,updateAddress} = require('../controller/address');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

router.post('/user/address/create', requireSignIn, addAddress);
router.post('/user/getaddress', requireSignIn, getAddress);
router.put('/user/address/update/:addressId', requireSignIn,  updateAddress);

module.exports = router;
