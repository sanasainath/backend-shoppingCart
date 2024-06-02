const Page = require('../model/page');
const { reset } = require('nodemon');
const shortid = require('shortid');
const Category = require('../model/category');
const Product=require('../model/product');
const slugify = require('slugify');
exports.createPage = async (req, res) => {
  console.log('Received data:', req.body); // Log received data
let isFeatured=false;
let quantity=1;
  const { banner, product } = req.files;
  const { title, description, category, type, createdBy } = req.body;
  console.log("prodddddddddddd",product);

  let bannerImages = [];
  let productImages = [];
  if (banner && banner.length > 0) {
    bannerImages = banner.map((ban, index) => ({
      img: process.env.APP_API + '/public/pics/' + ban.filename,
      navigateTo: `/bannerClicked?categoryId=${category}&type=${type}`,
    }));
  }

  if (product && product.length > 0) {
    productImages = product.map((prod, index) => ({
      img: process.env.APP_API + '/public/pics/' + prod.filename,
      navigateTo: `/productClicked?categoryId=${category}&type=${type}`,
      name: req.body[`productName${index + 1}`], // Assuming the input field name is productName1, productName2, etc.
      price: req.body[`productPrice${index + 1}`], // Assuming the input field name is productPrice1, productPrice2, etc.
      description: req.body[`productDescription${index + 1}`],
      slug:slugify(req.body[`productName${index + 1}`]),
    }));
  }
console.log("prdouct imagesssssssss",productImages);
  try {
    // Check if a page with the same title and category already exists
    const existingPage = await Page.findOne({ title, category });

    if (existingPage) {
      return res.status(400).json({ message: 'Page with the same title and category already exists' });
    }

    // Create a new Page instance and save it to the database
    const newPage = new Page({
      title: title,
      description: description,
      banner: bannerImages,
      product: productImages,
      category,
      type,
      createdBy: req.user.userId,
    });
     
    const savedPage = await newPage.save();

    if (savedPage) {
       console.log("saved page man",savedPage);
       
      



      try {
        // Create products and save them to the database
        const productIds = savedPage.product.map(product => product._id);

        const savedProducts = await Product.create(productImages.map((product, index) => ({
            name: product.name,
            slug: slugify(product.name),
            price: product.price,
            description: product.description,
            category, // Assuming category is the category ID
            createdBy, // Assuming createdBy is the user ID
            productPictures: [{ img: product.img }],
            isFeatured,
            quantity,
            createdBy: req.user.userId,
            _id: productIds[index] // Assigning the corresponding ID
        })));
        console.log("create prdicts",savedProducts);
  
        // Check if all products were saved successfully
        if (savedProducts.length !== productImages.length) {
          return res.status(400).json({ message: 'Failed to save all products' });
        }
      } catch (error) {
        console.error('Error saving products:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    












      res.status(201).json({ page: savedPage });
    } else {
      res.status(400).json({ message: 'Failed to save page' });
    }
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  
exports.deleteAllPages = async (req, res) => {
    try {
        // Delete all pages from the database
        await Page.deleteMany({});

        res.status(200).json({ message: 'All pages deleted successfully' });
    } catch (error) {
        console.error('Error deleting all pages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getPageByCategoryAndType = async (req, res) => {
  try {
    const { category, type } = req.params;

    // Find the page with the specified category and type
    const foundPage = await Page.findOne({ category, type });

    if (foundPage) {
      res.status(200).json({ page: foundPage });
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};