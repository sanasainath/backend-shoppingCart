const mongoose = require('mongoose');
const slugify = require("slugify"); 
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  type:{
type:String,
  },
  categoryImg:{type:String},
  parentId: {
    type: String
  }
}, { timestamps: true });

const Category = mongoose.model('Categorynew', categorySchema);

module.exports = Category;
