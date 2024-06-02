// cartRoutes.js

const express = require('express');
const router = express.Router();
const {addToWishlist,removeFromWishlist, getWishlistItems} =require('../controller/wishlist')

const {requireSignIn}=require('../middleware/middleware')
router.post('/wishlist/add',requireSignIn, addToWishlist);
router.post('/list/remove', requireSignIn,removeFromWishlist);
router.get('/get/all/wishlist/items',requireSignIn,getWishlistItems)

module.exports = router;
