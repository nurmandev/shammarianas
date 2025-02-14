const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  updateBlog,
  getBlogDetail,
  deleteBlog,
  getPopularBlogs,
} = require("../controllers/blogController");

router.get("/blogs", getAllBlogs);
router.get("/blogs/popular", getPopularBlogs);
router.get("/blogs/:identifier", getBlogDetail);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

module.exports = router;
