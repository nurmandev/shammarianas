const Blog = require("../models/Blog");
const sanitizeHtml = require("sanitize-html");
const slugify = require("slugify");

exports.createBlog = async (req, res) => {
  try {
    let { title, content, author, tags, categories, coverImage, status } =
      req.body;

    // Sanitize content to remove harmful HTML
    content = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
        "h3",
      ]),
      allowedAttributes: {
        a: ["href", "name", "target"],
        img: ["src", "alt"],
      },
    });

    // Generate a slug from the title
    let slug = slugify(title, { lower: true, strict: true });

    // Ensure slug uniqueness
    let existingBlog = await Blog.findOne({ slug });
    let counter = 1;
    while (existingBlog) {
      slug = `${slug}-${counter}`;
      existingBlog = await Blog.findOne({ slug });
      counter++;
    }

    const newBlog = new Blog({
      title,
      slug,
      content,
      author,
      tags,
      categories,
      coverImage,
      status,
    });
    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, tags, categories, coverImage, status } = req.body;

    // Find existing blog
    let blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Sanitize content
    if (content) {
      content = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img",
          "h1",
          "h2",
          "h3",
        ]),
        allowedAttributes: {
          a: ["href", "name", "target"],
          img: ["src", "alt"],
        },
      });
    }

    // Update slug only if title is changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = slugify(title, { lower: true, strict: true });

      // Ensure slug uniqueness
      let existingBlog = await Blog.findOne({ slug });
      let counter = 1;
      while (existingBlog && existingBlog._id.toString() !== id) {
        slug = `${slug}-${counter}`;
        existingBlog = await Blog.findOne({ slug });
        counter++;
      }
    }

    // Update blog
    blog = await Blog.findByIdAndUpdate(
      id,
      { title, slug, content, tags, categories, coverImage, status },
      { new: true, runValidators: true }
    );

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Search by title, content, or categories (case-insensitive)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { categories: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 }) // Latest blogs first
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("author", "name email");

    const totalBlogs = await Blog.countDocuments(query);

    res.status(200).json({
      totalBlogs,
      page: parseInt(page),
      totalPages: Math.ceil(totalBlogs / limit),
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query; // Default limit is 5

    // Fetch blogs sorted by views and likes count
    const blogs = await Blog.find({ status: "published" }) // Only fetch published blogs
      .sort({ views: -1, likes: -1 }) // Sort by most views and likes
      .limit(parseInt(limit))
      .populate("author", "name email");

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBlogDetail = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Find blog by ID or slug
    const blog = await Blog.findOne({
      $or: [{ _id: identifier }, { slug: identifier }],
    })
      .populate("author", "name email") // Populate author details
      .populate("comments.user", "name email"); // Populate commenter details

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Increment views count
    blog.views += 1;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the blog
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
