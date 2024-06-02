    const express = require("express");
    const router = express.Router();
    const dotenv = require('dotenv');
 
    const productModel = require('../model/product');
    const path=require('path');
    dotenv.config({path:'./config.env'});
    const Category = require('../model/category');

    // const { addCategory, getCategory } = require("../controller/category");
    const { requireSignIn, adminMiddleware ,userMiddleware} = require("../middleware/middleware");

    const {createProducts, getProductsOne, getallProducts,deleteProduct,getProductsBySlug,getProductById, getProductsByCategory, getRelatedProducts, getFeaturedProducts, createProductReview, getAllReviews, deleteReviews, searchProduct, updateProduct, changeProductImageName}=require('../controller/product');
    const multer = require('multer');
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/pictures');
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
      },
    });
    const upload = multer({ storage: storage });


    // router.post('/category/create', requireSignIn, adminMiddleware, addCategory);
    router.post('/product/create',upload.array("productPictures"),requireSignIn, adminMiddleware, createProducts);
   
     router.delete('/product/delete/:id',deleteProduct);
    router.get('/products',getallProducts );
    router.get('/product/featured',getFeaturedProducts);
      // router.get('/products/:id', getProductsOne);
      router.get('/product/:id',getProductById);
      router.get('/products/:slug',getProductsBySlug);
      router.get('/product/get/:category',getProductsByCategory);
      router.get('/related/product/:category',getRelatedProducts);
      router.put('/product/review',requireSignIn,createProductReview);
      router.get('/products/:productId/reviews',getAllReviews);
      router.delete('/products/:productId/reviews/:reviewId',deleteReviews);
      router.get('/api/products/search',searchProduct);
      router.put('/products/:productId', updateProduct);
      router.put('/updateImageUrls',changeProductImageName);
    

   
    
    module.exports = router;
        