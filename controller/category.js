const slugify = require("slugify"); // Import the slugify library
const Category = require('../model/category');
const Product = require('../model/product');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const shortid=require('shortid');
function createCategories(categories, parentId = null) {
  const categoryList = [];
  let filteredCategories;

  if (parentId === null) {
    filteredCategories = categories.filter((cat) => cat.parentId === undefined || cat.parentId === null || cat.parentId === '');
  } else {
    filteredCategories = categories.filter((cat) => 
  cat.parentId !== undefined &&
  cat.parentId !== null &&
  cat.parentId.toString() === parentId.toString()
);

  }

  for (let cate of filteredCategories) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
      categoryImg:cate.categoryImg,
      type:cate.type,
      
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}


exports.addCategory = (req, res) => {
    console.log('Category Name:', req.body);

    const { name, slug, parentId ,type} = req.body;


   
    console.log('Req Body:', req.body);
console.log('Req File:', req.file);


    const categoryObj = {
        name: String(name),
        slug: `${slugify(String(name))}-${shortid.generate()}`,
   
        parentId: parentId,
        type:type,
    };
    if (req.file) {
      console.log(req.file);
   categoryObj.categoryImg=process.env.APP_API + '/public/images/' + req.file.filename;
    }

    const cat = new Category(categoryObj);

    cat.save()
        .then((savedCategory) => {
            if (savedCategory) {
                return res.status(200).json(savedCategory);
            } else {
                return res.status(400).json({ message: 'Document already saved' });
            }
        })
        .catch((error) => {
            return res.status(400).json({ message: error.message });
        });
};


exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
   
    if (categories) {
      const categoryList = createCategories(categories, null);

      // Fetch products for each category
      const categoriesWithProducts = await Promise.all(
        categoryList.map(async (category) => {
          const products = await Product.find({ category: category._id });
          return {
            ...category,
            products,
          };
        })
      );

      return res.status(200).json({ categoryList: categoriesWithProducts });
    } else {
      return res.status(404).json({ message: 'No categories found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// exports.deleteCategory = async (req, res) => {
// try {
//     const categoryId = req.params.categoryId;

//     // Delete the category
//     const deletedCategory = await Category.findByIdAndDelete(categoryId);

//     if (!deletedCategory) {
//         return res.status(404).json({ message: 'Category not found' });
//     }

//     // Also, delete the products associated with this category
//     await Product.deleteMany({ category: categoryId });

//     return res.status(200).json({ message: 'Category deleted successfully' });
// } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal Server Error' });
// }
// };
// controllers/categoryController.js


// Update the backend controller to return the deleted categories
exports.deleteCategories = async (req, res) => {

  const { Ids } = req.body.payload; 
  const ArrayDelete=[];
  for(let i=0;i<Ids.length;i++)
  {
    const deleteCategoryDatas=await Category.findOneAndDelete({_id:Ids[i]._id});
    ArrayDelete.push(deleteCategoryDatas);
  }
  console.log(ArrayDelete);
  if(ArrayDelete.length==Ids.length)
  {
    return res.status(200).json({message:"catgeories remo ved ah how"})
  }

};



exports.deleteAllCategories = async (req, res) => {
try {

  const deletedCategories = await Category.deleteMany();

  return res.status(200).json({ message: 'All categories deleted successfully' });
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Internal Server Error' });
}
};




exports.getCategoryById = async (req, res) => {
try {
  const categoryId = req.params.categoryId;

  // Find the category by ID
  const category = await Category.findById(categoryId);

  if (!category) {
    // If not found, check if it's a nested subcategory
    const categories = await Category.find();
    const nestedCategory = findNestedCategory(categories, categoryId);

    if (!nestedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json(nestedCategory);
  }

  return res.status(200).json(category);
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Internal Server Error' });
}
};

function findNestedCategory(categories, targetId) {
for (const category of categories) {
  if (category._id.toString() === targetId) {
    return category;
  }

  if (category.children && category.children.length > 0) {
    const nestedCategory = findNestedCategory(category.children, targetId);
    if (nestedCategory) {
      return nestedCategory;
    }
  }
}

return null;
}
exports.updateCategoryData = async (req, res) => {
  const { _id, name, parentId, type } = req.body;
  const updatedCategories = [];

  console.log('Received data:', req.body);

  try {
    if (
      Array.isArray(name) &&
      Array.isArray(parentId) &&
      name.length === parentId.length
    ) {
      for (let i = 0; i < name.length; i++) {
        // Handle the "name" field based on its type
        const categoryName = Array.isArray(name) ? name[i] : name;
        const category = {
          name: categoryName,
          type: type[i],
        };

        if (parentId[i] !== "") {
          category.parentId = parentId[i];
        }

        console.log('Processing category:', category);

        const updatedCategory = await Category.findOneAndUpdate(
          { _id: _id[i] },
          category,
          { new: true }
        );
        updatedCategories.push(updatedCategory);
      }

      console.log('Updated categories:', updatedCategories);

      return res.status(201).json({ updatedCategories });
    } else if (!(name instanceof Array) && !(type instanceof Array)) {
      // Handle the "name" field based on its type
      const categoryName = name instanceof Array ? name[0] : name;
      
      const category = {
        name: categoryName || '', // Add a default value if undefined
        type: type || '',
      };

      if (parentId !== "") {
        category.parentId = parentId;
      }

      console.log('Processing single category:', category);

      const updatedCategory = await Category.findOneAndUpdate(
        { _id },
        category,
        { new: true }
      );
      return res.status(201).json({ updatedCategories: [updatedCategory] });
    } else {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  } catch (error) {
    console.error('Error updating categories:', error);

    // Check if the error object has a response property before destructuring
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Internal Server Error';

    return res.status(status).json({ message: errorMessage });
  }
};

