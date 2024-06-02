// const express=require('express')
// const router=express.Router();  


// const { validateRequest, validateSignupRequest,validateSignInRequest, validateSignIn } = require('../validators/signupvalid');

// // ... (rest of your code)


// const { AdminSignIng, AdminSignIngUp } = require('../controller/adminsignup');
// const { requireSignIn } = require('../middleware/middleware');

// router.post('/login/admin', validateSignInRequest, validateSignIn, AdminSignIng);

// router.post('/signup/admin', validateRequest, validateSignupRequest,AdminSignIngUp);

// router.post('/profile',requireSignIn,(req,res)=>{
//     res.status(200).json({admin:'profile'})
// });
// module.exports=router;