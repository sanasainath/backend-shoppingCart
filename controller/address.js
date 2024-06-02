const UserAddress = require("../model/address");

exports.addAddress = (req, res) => {
  const { payload } = req.body;
  console.log("checking addres", payload);
  if (payload.address) {
    if (payload.address.userId) {
      UserAddress.findOneAndUpdate(
        { user: req.user.userId, "address._id": payload.address.userId },
        {
          $set: {
            "address.$": payload.address,
          },
        }
      )
        .exec()
        .then((address) => {
          if (address) {
            res.status(201).json({ address });
          }
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    } else {
      UserAddress.findOneAndUpdate(
        { user: req.user.userId },
        {
          $push: {
            address: payload.address,
          },
        },
        { new: true, upsert: true }
      )
        .exec()
        .then((address) => {
          if (address) {
            res.status(201).json({ address });
          }
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    }
  } else {
    res.status(400).json({ error: "Params address required" });
  }
};

exports.getAddress = (req, res) => {
  console.log("chekcing requ",req);
  UserAddress.findOne({ user: req.user.userId })
    .exec()
    .then((userAddress) => {
      if (userAddress) {
        res.status(200).json({ userAddress });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
exports.updateAddress = (req, res) => {
  const { addressId } = req.params;
  const { payload } = req.body;

  if (payload && payload.address) {
    // Construct the $set operator dynamically based on the fields present in payload.address
    const setOperator = {};
    for (const field in payload.address) {
      setOperator[`address.$.${field}`] = payload.address[field];
    }

    UserAddress.findOneAndUpdate(
      { user: req.user.userId, 'address._id': addressId },
      {
        $set: setOperator,
      }
    )
      .exec()
      .then((address) => {
        if (address) {
          res.status(200).json({ address });
        } else {
          res.status(404).json({ error: 'Address not found' });
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else {
    res.status(400).json({ error: 'Params address required' });
  }
};

