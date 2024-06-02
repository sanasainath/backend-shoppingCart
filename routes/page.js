const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const { requireSignIn, adminMiddleware ,userMiddleware} = require("../middleware/middleware");
    
const path = require('path'); 


const multer = require('multer');
const { createPage,deleteAllPages,getPageByCategoryAndType } = require("../controller/page");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/pics');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post('/page/creates',upload.fields([
    {name:'banner',},
    {name:'product'}
]),requireSignIn,createPage)
router.delete('/pages/delete', deleteAllPages);
router.get('/page/:category/:type', getPageByCategoryAndType);
module.exports = router;