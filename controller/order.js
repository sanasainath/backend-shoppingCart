
  const Order = require("../model/order");
  const Cart = require('../model/cart');
 

  exports.addOrders = async (req, res) => {
      try {
      

          const userId = req.body.user;

          // Delete the user's cart
          const deleteResult = await Cart.deleteOne({ user: userId });

          if (deleteResult.deletedCount === 0) {
              console.log('Cart not found or already deleted');
              // Handle this case based on your application's requirements
              // You can choose to proceed with the order creation or send a different response.
          }

          // Extract relevant order information from the request body
          const { addressId, totalAmount, items, paymentStatus, paymentType } = req.body;
          const OrderedDate = new Date();
          // Create the orderStatus array with the initial status
          const orderStatus = [
            { type: "ordered", isCompleted: true },
              { type: "packed", isCompleted: false },
              { type: "shipped", isCompleted: false },
              { type: "delivered", isCompleted: false },
          ];
        

          // Create the new order object
          const order = new Order({
              user: userId,
              addressId,
              totalAmount,
              items,
              paymentStatus,
              paymentType,
              orderStatus,
              OrderedDate,
          });

          // Save the order to the database
          const savedOrder = await order.save();

          // Log the saved order to the console
          console.log('Saved Order:', savedOrder);

          // Send a success response with the saved order
          res.status(201).json({ success: true, order: savedOrder });
      } catch (error) {
          // Handle any errors that occur during the process
          console.error('Error in addOrders:', error);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
  };





exports.getOrders = async (req, res) => {
    try {
        // Assuming userId is part of the request parameters or body
        const userId = req.user.userId;
        console.log("user",userId);

        const orders = await Order.find({ user: userId })
        .select("_id paymentStatus items orderStatus OrderedDate") 
            .populate("items.productId", "_id name productPictures");

        res.status(200).json({ success: true, orders });
    }  catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
    
};


exports.getAllAdminOrders = async (req, res) => {
  try {
      const allOrders = await Order.find()
          .select("_id user paymentStatus items orderStatus OrderedDate") 
          .populate("items.productId", "_id name productPictures");
          console.log("order there ah",allOrders);

      res.status(200).json({ success: true, allOrders });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};



exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.updateOne(
      { _id: req.body.orderId, "orderStatus.type": req.body.type },
      {
        $set: {
          "orderStatus.$": [
            { type: req.body.type, date: new Date(), isCompleted: true },
          ],
        },
      }
    ).exec();

    if (order) {
      res.status(201).json({ order });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
};


