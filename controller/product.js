const shortid = require('shortid');
const productModel = require('../model/product');
const slugify = require('slugify');
const Category = require('../model/category');
const product = require('../model/product');
const mongoose = require('mongoose'); 
const { isValidObjectId } = mongoose; 
const Review=require('../model/review')
exports.createProducts = async (req, res) => {
  const { name, price, description, category, createdBy, quantity ,isFeatured} = req.body;
  const existingProduct = await productModel.findOne({ name: name });

  if (existingProduct) {
    return res.status(400).json({ message: 'Product with the same name already exists' });
  }

  let productPictures = [];
  if (req.files && req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img:process.env.APP_API + '/public/pictures/' +file.filename};
    });
  }



  const product = new productModel({
    name: name,
    slug: slugify(name),
    price,  
    description,
    productPictures:productPictures,
    category,
    quantity,
    isFeatured,
    createdBy: req.user.userId,
  });
  
  try {
    const savedProduct = await product.save();
    if (savedProduct) {
      res.status(201).json({ product: savedProduct });
    } else {
      res.status(400).json({ message: 'Failed to save product' });
    }
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// exports.getProductsOne=async (req, res) => {
//   try {
//     const product = await productModel.findById(req.params.id).populate({
//       path: 'category',
//       model: 'Categorynew' // Use the correct model name here
//     });

//     if (!product) {
//       return res.status(500).json({ error: 'Product not found' });
//     }

//     res.send(product);
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
exports.getallProducts=async (req, res) => {
  try {
    const products = await productModel.find().populate({
      path: 'category',
      model: 'Categorynew',
      averageRating:productModel.averageRating,
    });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await productModel.find({ isFeatured: true }).populate({
      path: 'category',
      model: 'Categorynew'
    });
    

    return res.status(200).json({ featuredProducts });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Add security check - verify if the user has the necessary permissions to delete
    // For example, check if the user is the creator of the product or has admin rights

    const deletedProduct = await productModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update your getProductsByCategory controller to accept minPrice and maxPrice in the query params
exports.getProductsByCategory = async (req, res) => {
  const { category: categoryId } = req.params;
  const { minPrice, maxPrice } = req.query;



  try {
    // Find the category based on the slug
    const foundCategory = await Category.findOne({ _id: categoryId }).select('_id');

    console.log('Category found:', foundCategory);

    if (!foundCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch products based on the category ID, its subcategories, and the price range
    const products = await fetchProductsRecursive(foundCategory._id, minPrice, maxPrice);

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update your fetchProductsRecursive function to accept minPrice and maxPrice
const fetchProductsRecursive = async (categoryId, minPrice, maxPrice) => {
  try {
    // Build the price filter object based on the provided minPrice and maxPrice
    const priceFilter = {};
    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
    

    // Fetch products based on the category ID and the price filter
    const products = await productModel.find({ category: categoryId, price: priceFilter }).populate('category');

    // Fetch subcategories of the current category
    const subcategories = await Category.find({ parentId: categoryId }).select('_id');

    // Fetch products for each subcategory recursively
    const subcategoryProducts = await Promise.all(subcategories.map(async (subcategoryId) => {
      return fetchProductsRecursive(subcategoryId, minPrice, maxPrice);
    }));

    // Flatten the array of subcategory products
    const flattenedSubcategoryProducts = subcategoryProducts.flat();

    // Combine the current category products with subcategory products
    const allProducts = [...products, ...flattenedSubcategoryProducts];

    return allProducts;
  } catch (error) {
    console.error('Error fetching products recursively:', error);
    throw error; // Rethrow the error to be caught by the calling function
  }
};

exports.getRelatedProducts = async (req, res) => {
  const { category: categoryId } = req.params;

 

  try {
    // Find the category based on the slug
    const foundCategory = await Category.findOne({ _id: categoryId }).select('_id');

  

    if (!foundCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch products based on the category ID and its subcategories
    const products = await fetchRelatedProductsRecursive(foundCategory._id);

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const fetchRelatedProductsRecursive = async (categoryId) => {
  try {
   

    // Fetch products based on the category ID
    const products = await productModel.find({ category: categoryId }).populate('category');

 

    // Fetch subcategories of the current category
    const subcategories = await Category.find({ parentId: categoryId }).select('_id');



    // Fetch products for each subcategory recursively
    const subcategoryProducts = await Promise.all(subcategories.map(async (subcategoryId) => {
      return fetchRelatedProductsRecursive(subcategoryId);
    }));

    // Flatten the array of subcategory products
    const flattenedSubcategoryProducts = subcategoryProducts.flat();

    // Combine the current category products with subcategory products
    const allProducts = [...products, ...flattenedSubcategoryProducts];

    return allProducts;
  } catch (error) {
    console.error('Error fetching products recursively:', error);
    throw error; // Rethrow the error to be caught by the calling function
  }
};





exports.getProductsBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    // Use the slug to query the database for the corresponding category
    const category = await Category.findOne({ slug }).select('_id type').exec();
    

    // If the category doesn't exist, send a 404 response
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Use async/await for the second query to fetch products
    const products = await productModel.find({ category: category._id }).exec();

    // Send the products in the response
    if(category.type)
    {
    if(products.length>0)
    {
      res.status(200).json({
        products,
        productsByPrice:{
          under5k:products.filter(product=>product.price<=5000),
          under10k:products.filter(product=>product.price>5000&&product.price<=10000),
          under15k:products.filter(product=>product.price>10000&&product.price<=15000),
          under20k:products.filter(product=>product.price>15000&&product.price<=20000),
          above20k:products.filter(product=>product.price>20000),
  
        }
  
       } );
    }
  }else{
    res.status(200).json({products});
  }
  
  } catch (error) {
    console.error('Error fetching category and products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};







exports.getProductById = async (req, res) => {  
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId
    if (mongoose.isValidObjectId(id)) {
      // If it's a valid ObjectId, proceed with finding by ID
      const product = await productModel.findById(id).populate('category');

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const averageRating = product.averageRating;
      console.log("checking average rating",averageRating);
      return res.status(200).json({ product,averageRating });
    }

    // If not a valid ObjectId, assume it's a slug and query by slug
    const product = await productModel.findOne({ slug: id }).populate('category');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const averageRating = product.averageRating;
    console.log("checking average rating",averageRating);
    return res.status(200).json({ product,averageRating });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await productModel.find({ isFeatured: true }).populate('category');

    return res.status(200).json({ featuredProducts });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// exports.createProductReview = async (req, res) => {
//   const { rating, comment, productId } = req.body;

//   try {
//     const review = new Review({
//       user: req.user.userId,
//       name: req.user.name,
//       rating: Number(rating),
//       comment,
//     });

//     const product = await productModel.findById(productId);

//     // Handle existing reviews and update or add a new one
//     const existingReview = product.reviews.find((r) => r.user.toString() === req.user.userId.toString());

//     if (existingReview) {
//       existingReview.comment = comment;
//       existingReview.rating = rating;
//     } else {
//       product.reviews.push(review);
//       product.numOfReviews = product.reviews.length;
//     }
   

//     await product.save();

//     res.status(201).json({ message: 'Review added successfully' });
//   } catch (error) {
//     console.error('Error adding review:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.createProductReview = async (req, res) => {
  const { rating, comment, productId } = req.body;

  try {
    // Find the product by its ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user has already reviewed this product
    const existingReview = product.reviews.find(
      (r) => r.user._id.toString() === req.user.userId.toString()
    );

    if (existingReview) {
      // If the review exists, update the comment and rating
      existingReview.comment = comment;
      existingReview.rating = rating;
    } else {
      // If the review does not exist, create a new review object
      const review = {
        user: req.user.userId,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        rating: Number(rating),
        comment,
      };
      // Add the new review to the product's reviews array
      product.reviews.push(review);
      // Update the number of reviews
      product.numOfReviews = product.reviews.length;
    }

    // Recalculate the average rating
    product.rating = (
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / 
      product.reviews.length
    ).toFixed(1);

    // Save the updated product
    await product.save();

    res.status(201).json({ message: 'Review added or updated successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getAllReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await productModel.findById(productId).populate('reviews.user', 'firstName lastName');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = product.reviews;
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteReviews= async (req, res) => {
  const { productId, reviewId } = req.params;

  try {
    // Find the product by ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the index of the review in the product's reviews array
    const reviewIndex = product.reviews.findIndex((review) => review._id.toString() === reviewId);

    // If the review is not found, return a 404 error
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Remove the review from the product's reviews array
    product.reviews.splice(reviewIndex, 1);

    // Optionally, update the number of reviews if needed
    product.numOfReviews = product.reviews.length;

    // Save the product with the updated reviews array
    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// product.js

exports.searchProduct = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm.toLowerCase();

    // Modify the query to find products with name or description containing the search term
    const products = await productModel.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// This assumes you have a route in your Express app for handling product searches



exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, description, category, quantity, isFeatured,rating } = req.body;

    // Validate if the provided ID is a valid ObjectId
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Find the product by ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product details
    product.name = name;
    product.price = price;
    product.description = description;
    product.category = category;
    product.quantity = quantity;
    product.isFeatured = isFeatured;
    product.rating=rating;
    console.log("checking of filesssssssssssss",req.file);
    if (req.file) {
      // Assuming your product model has a property `productPictures` that holds an array of image URLs
      product.productPictures.push(req.file.path);
    }

    // Generate a new slug based on the updated name
    const updatedSlug = slugify(name, { lower: true });
    product.slug = updatedSlug;

    // Save the updated product
    const updatedProduct = await product.save();

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
