exports.getCategory = async (req, res) => {
    try {
      const categories = await Category.find();
      console.log('Fetched Categories:', categories);
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
        children: createCategories(categories, cate._id),
      });
    }
  
    return categoryList;
  }
  