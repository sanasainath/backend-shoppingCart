const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

    
const path = require('path'); 
const { addCategory, getCategory ,getCategoryById,deleteAllCategories, updateCategoryData, deleteCategories} = require("../controller/category");
const { requireSignIn, userMiddleware, adminMiddleware } = require("../middleware/middleware");

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });
// router.use('/uploads', express.static(path.join(__dirname,'routes', 'uploads')));
// const upload=multer({dest: 'up   loads/'}); 
// router.post('/category/create',requireSignIn,userMiddleware, upload.single('categoryImg'),addCategory);

router.post('/category/create', upload.single('categoryImg'),requireSignIn,adminMiddleware,addCategory);
// router.post('/category/create', addCategory);
router.get('/categories', getCategory);
// router.delete('/category/:categoryId', requireSignIn, userMiddleware, deleteCategory);
router.delete('/categories', deleteAllCategories);
router.get('/category/:categoryId', getCategoryById);
router.delete('/category/delete',deleteCategories)
router.post('/category/update', upload.single('categoryImg'),updateCategoryData);
module.exports = router;
    //requireSignIn, adminMiddleware, upload.single("categoryImg"),