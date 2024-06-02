const { createBlog, getBlogs, blogId } = require("../controller/blog");

router.post('/post/blog',createBlog);
router.get('/get/blogs',getBlogs);
router.get('/blogs/:id',blogId)