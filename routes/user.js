    const express=require('express')
    const router=express.Router();  
const nodemailer=require('nodemailer');

    const { validateRequest, validateSignupRequest,validateSignInRequest, validateSignIn } = require('../validators/signupvalid');

  
// ... (rest of your code)


    const { SignIng, SignIngUp } = require('../controller/signupin');
    const { requireSignIn } = require('../middleware/middleware');

    router.post('/login', validateSignInRequest, validateSignIn, SignIng);

    router.post('/signup', validateRequest, validateSignupRequest,SignIngUp);

    router.post('/profile',requireSignIn,(req,res)=>{
        res.status(200).json({user:'profile'})
    });
    module.exports=router;



















