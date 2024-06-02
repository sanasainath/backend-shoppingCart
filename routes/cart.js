const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
const { addItemToCart, getCartItems, removeCartItems, updateCartItem } = require("../controller/cart");
dotenv.config({path:'./config.env'});

// const { addCategory, getCategory } = require("../controller/category");
const { requireSignIn, userMiddleware } = require("../middleware/middleware");


// router.post('/category/create', requireSignIn, userMiddleware, addCategory);
router.post('/user/cart/addtocart', requireSignIn, addItemToCart);
// router.post('/user/cart/addtocart',  addItemToCart);
router.get('/user/getCartItems',requireSignIn ,getCartItems);
router.post('/user/cart/removeItem',requireSignIn ,removeCartItems);


module.exports = router;
    