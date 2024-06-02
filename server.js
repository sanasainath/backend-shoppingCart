const express = require('express');
const app = express();
const path = require('path');
const CategoryRoutes = require('./routes/categorys');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const RouterSignUpIn=require('./routes/user');
const productRouter=require('./routes/product');
const Blog =require('./model/blog')
const cartRoutes=require('./routes/cart');
const initialinfo=require('./routes/initialinfo');
const page=require('./routes/page');
// const admin=require('./routes/admin');
const address=require('./routes/address');
const order=require('./routes/order');
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Razorpay = require("razorpay");
const crypto = require("crypto");
// const sessionConfig=require('./config/sessionConfig')
const cors=require('cors')
const wishlist=require('./routes/wishlist')
const Blog=require('./routes/blog');


dotenv.config({ path: './config.env' }); 
app.use(express.json()); 
app.use(cors(

 
));
// Middleware
// app.use(sessionConfig);
    app.use(express.urlencoded({ extended: true }));
    var bodyParser = require('body-parser');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

// Check if CONN_STR is loaded correctly
if (!process.env.CONN_STR) {
    console.error('CONN_STR is not defined in the environment variables');
    process.exit(1); // Exit the process if the variable is not defined
}
app.use('/public/images', express.static('public/images'));
app.use('/public/pictures', express.static('public/pictures'));
app.use('/public/pics', express.static('public/pics'));

mongoose
    .connect(process.env.CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('MongoDB Connection Error:', error);
    });

app.get('/', (req, res) => {
    res.json({
        message: 'Server is up and running.'
    });
});
app.get('/api/okokok',(req,res)=>{
    res.json({message:'ok ok ok'});
})
app.post("/api/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map(item => {
                return {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: item.name
                        },
                        unit_amount: item.price * 100,
                    },
                    quantity: item.quantity
                }
            }),
            success_url: "http://localhost:3001/ordersplaced",
            cancel_url: "http://localhost:3001/checkout"
        })
        res.json({ url: session.url })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/product/ordering/", async (req, res) => {

    try {

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        if(!req.body){
            return res.status(400).send("Bad Request");

        }
        const options = req.body;

        const order = await razorpay.orders.create(options);

        if(!order){
            return res.status(400).send("Bad Request");
        }

        res.json(order);
        
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})
app.post("/api/validate", async (req, res) => {

    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    // order_id + " | " + razorpay_payment_id

    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

    const digest = sha.digest("hex");

    if (digest!== razorpay_signature) {
        return res.status(400).json({msg: " Transaction is not legit!"});
    }

    res.json({msg: " Transaction is legit!", orderId: razorpay_order_id,paymentId: razorpay_payment_id});
})


app.post('/data', (req, res) => {
    res.status(200).json({
        message: req.body
    });
});
// app.use('/public',express.static('C:\\Users\\sai\\Pictures\\Screenshots'))
// app.use(express.static(path.join(__dirname,'uploads')));
app.use('/api', CategoryRoutes);
app.use('/api',page);
// app.use('/api',admin);
app.use('/api', RouterSignUpIn);
app.use('/api',productRouter);
app.use('/api',cartRoutes);
app.use('/api',initialinfo);
app.use('/api',order);
app.use('/api',Blog);
app.use('/api',wishlist);

app.use('/api',address);



app.listen(3001, () => {
    console.log('Server is running on port 3001.');
});
