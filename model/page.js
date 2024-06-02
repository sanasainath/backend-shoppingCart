const mongoose = require('mongoose');
const Category = require('./category');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique:true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: String,
  },
  description:{
type:String,
  },
  img: {
    type: String,
  },
  navigateTo: {
    type: String,
  },
});

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

 
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String,
  },
  banner: [
    {
      img: {
        type: String,
      },
      navigateTo: {
        type: String,
      },
    },
  ],
  product: [productSchema], // Using the productSchema defined above
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Category,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return v != null;
      },
      message: 'Category is required',
    },
  },
  type: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
