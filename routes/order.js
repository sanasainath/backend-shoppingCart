const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const { requireSignIn, userMiddleware, adminMiddleware } = require("../middleware/middleware");
const { getOrders, addOrders, updateOrder, updateOrderStatus, getAllAdminOrders } = require("../controller/order");


router.get('/get/orders',requireSignIn,getOrders);
router.get('/get/admin/all/orders',requireSignIn,getAllAdminOrders);
router.post('/add/order',requireSignIn,addOrders);
router.post('/update/order',requireSignIn,updateOrder);
// router.put('/orders/:id',updateOrderStatus);
module.exports = router;