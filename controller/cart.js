const Cart = require('../model/cart');
    


function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    if (!condition || !updateData) {
      reject(new Error('Invalid update operation'));
      return;
    }

    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve())
      .catch((err) => reject(err));
  });
}

 
    exports.addItemToCart = async (req, res) => {
    try {
      console.log("User ID:", req.user.userId);

        const cart = await Cart.findOne({ user: req.user.userId });
        console.log("is cart exist",cart);

        if (cart) {
        let promiseArray = [];

        if (Array.isArray(req.body.cartItems)) {
            req.body.cartItems.forEach((cartItem) => {
            const product = cartItem.product;
            const item = cart.cartItems.find((c) => c.product == product);
            let condition, update;

            if (item) {
                condition = { user: req.user.userId, "cartItems.product": product };
                update = {
                $set: {
                    "cartItems.$.quantity": cartItem.quantity
                },
                };
            } else {
                condition = { user: req.user.userId };
                update = {
                $push: {
                    cartItems: cartItem,
                },
                };
            }

            promiseArray.push(runUpdate(condition, update));
            });

            await Promise.all(promiseArray);
            const updatedCart = await Cart.findOne({ user: req.user.userId });
            res.status(201).json({ cart: updatedCart });
        } else {
            res.status(400).json({ error: 'Invalid request payload' });
        }
        } else {
        const newCart = new Cart({
            user: req.user.userId,
            cartItems: req.body.cartItems,

        });

        const savedCart = await newCart.save();
        res.status(201).json({ cart: savedCart });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
    };



    exports.getCartItems = async (req, res) => {
      try {
        console.log("User ID:", req.user.userId);
        const cart = await Cart.findOne({ user: req.user.userId })
          .populate("cartItems.product", "_id name price productPictures")
          .exec();
    
        console.log("Cart:", cart);
    
        if (cart) {
          let cartItems = {};
          cart.cartItems.forEach((item) => {
            // Add a check to ensure item.product is not null
            if (item.product) {
              cartItems[item.product._id.toString()] = {
                _id: item.product._id.toString(),
                name: item.product.name,
                img: item.product.productPictures[0].img,
                price: item.product.price,
                qty: item.quantity,
              };
            }
          });
    
          res.status(200).json({ cartItems });
        } else {
          res.status(200).json({ cartItems: {} });
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    };
    


exports.removeCartItems = async (req, res) => {
  try {
    const { productId } = req.body.payload;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await Cart.updateOne(
      { user: req.user.userId },
      {
        $pull: {
          cartItems: {
            product: productId,
          },
        },
      }
    );

    if (result) {
      return res.status(202).json({ result });
    } else {
      return res.status(500).json({ error: 'Failed to update cart' });
    }
  } catch (error) {
    console.error('Error removing cart items:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};






