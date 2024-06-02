const Category = require('../model/category');
const Product = require('../model/product');
function createCategories(categories, parentId = null) {
    const categoryList = [];
    let filteredCategories;

    if (parentId === null) {
        filteredCategories = categories.filter((cat) => cat.parentId === undefined || cat.parentId === null || cat.parentId === '');
    } else {
        filteredCategories = categories.filter((cat) => cat.parentId !== undefined && cat.parentId.toString() === parentId.toString());

    }

    for (let cate of filteredCategories) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            parentId: cate.parentId,
            type:cate.type,
            children: createCategories(categories, cate._id),
        });
    }

    return categoryList;
}   
exports.initialData=async (req,res)=>{
    const categories=await Category.find();
    
    const products=await Product.find({}).populate('category').exec();
    res.status(200).json({
        categories:createCategories(categories,null),
        products,
    })
}

