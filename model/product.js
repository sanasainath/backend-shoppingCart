const mongoose = require('mongoose');
const Category = require('./category');
const Review = require('./review');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  rating: {
    type: Number, // Change from String to Number
    min: 1,
    max: 5,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  offer: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  productPictures: [
    {
      img: { type: String },
    },
  ],
  reviews: [Review.schema],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Category,
    required: true,
    validate: {
      validator: function (v) {
        return v != null;
      },
      message: 'Category is required',
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedAt: Date,
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

productSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) {
    return 0;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / this.reviews.length;
});

const Product = mongoose.model('Product', productSchema);
productSchema.set('toJSON', { virtual: true });

module.exports = Product;
