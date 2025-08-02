const Blog = require('../models/blog');
const { titleToUrl } = require('../utils/slug');
const fs = require('fs');
const path = require('path');


exports.createBlog = async (req, res) => {
  try {
    let {
      title,
      author,
      description,
      products,
      category,
      content,
    } = req.body;

    if (typeof title === 'string') title = JSON.parse(title);
    if (typeof description === 'string') description = JSON.parse(description);
    if (typeof category === 'string') category = JSON.parse(category);
    if (typeof content === 'string') content = JSON.parse(content);

    if (
      !title?.en ||
      !description?.en ||
      !content?.en ||
      !author ||
      !products ||
      !category?.en
    ) {
      return res.status(400).json({
        error:
          "All required fields must be filled (title.en, description.en, content.en, author, products, category.en).",
      });
    }

    const blogpath = titleToUrl(title.en);

    const existing = await Blog.findOne({ blogpath });
    if (existing) {
      return res.status(400).json({ error: "A blog with this title already exists." });
    }

  const blogImages = req.files?.map(file => file.filename) || [];

    const blog = new Blog({
      title,
      blogpath,
      author,
      description,
      products,
      category,
      content,
      blogimage: blogImages,
      publishedAt: new Date(),
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(500).json({
      error: error.message || "Something went wrong while creating the blog.",
    });
  }
};


// Get All Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get Blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Get Blog by Slug
exports.getBlogByTitle = async (req, res) => {
  try {
    const { blogpath } = req.params;
    if (!blogpath) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    const blog = await Blog.findOne({ blogpath });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//  Update Blog 

// exports.updateBlog = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, author, description, products, category, content } = req.body;

//     const existingBlog = await Blog.findById(id);
//     if (!existingBlog) {
//       return res.status(404).json({ error: "Blog not found." });
//     }

//     const updateData = {};

//     if (title && title !== existingBlog.title) {
//       const newPath = titleToUrl(title);
//       const duplicate = await Blog.findOne({ blogpath: newPath, _id: { $ne: id } });
//       if (duplicate) {
//         return res.status(400).json({ error: "Another blog with the same title already exists." });
//       }
//       updateData.blogpath = newPath;
//       updateData.title = title;
//     }

//     if (author) updateData.author = author;
//     if (description) updateData.description = description;
//     if (products) updateData.products = products;
//     if (category) updateData.category = category;

//     if (content) {
//       try {
//         updateData.content = typeof content === 'string' ? JSON.parse(content) : content;
//       } catch {
//         return res.status(400).json({ error: "Invalid JSON format for 'content'." });
//       }
//     }

//     if (req.files && req.files.length > 0) {
//       const deleteImage = (filename) => {
//         const filePath = path.join(__dirname, '../uploads', filename);
//         fs.unlink(filePath, (err) => {
//           if (err && err.code !== 'ENOENT') {
//             console.error('Error deleting old image:', filePath, err);
//           }
//         });
//       };

//       if (existingBlog.blogimage) {
//         if (Array.isArray(existingBlog.blogimage)) {
//           existingBlog.blogimage.forEach(deleteImage);
//         } else if (typeof existingBlog.blogimage === 'string') {
//           deleteImage(existingBlog.blogimage);
//         }
//       }

//       const newImages = req.files.map(file => file.filename);
//       updateData.blogimage = newImages;
//     }

//     updateData.updatedAt = new Date();

//     const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json(updatedBlog);
//   } catch (error) {
//     console.error("Blog update error:", error);
//     if (error.name === 'CastError') {
//       return res.status(400).json({ error: "Invalid blog ID format." });
//     }
//     res.status(400).json({ error: error.message || "Something went wrong while updating the blog." });
//   }
// };

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, author, description, products, category, content } = req.body;

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    // Parse JSON strings if necessary
    if (typeof title === 'string') title = JSON.parse(title);
    if (typeof description === 'string') description = JSON.parse(description);
    if (typeof category === 'string') category = JSON.parse(category);
    if (typeof content === 'string') content = JSON.parse(content);

    // Validate required fields
    if (
      !title?.en ||
      !description?.en ||
      !content?.en ||
      !author ||
      !products ||
      !category?.en
    ) {
      return res.status(400).json({
        error: "All required fields must be filled (title.en, description.en, content.en, author, products, category.en).",
      });
    }

    const updateData = {
      title,
      author,
      description,
      products,
      category,
      content,
      updatedAt: new Date(),
    };

    // Handle blogpath update if title.en changed
    const newPath = titleToUrl(title.en);
    if (newPath !== existingBlog.blogpath) {
      const duplicate = await Blog.findOne({ blogpath: newPath, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ error: "Another blog with the same title already exists." });
      }
      updateData.blogpath = newPath;
    }

    // Handle image updates and deletion
    if (req.files && req.files.length > 0) {
      const deleteImage = (filename) => {
        const filePath = path.join(__dirname, '../uploads', filename);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting image:', filePath, err);
          }
        });
      };

      if (existingBlog.blogimage) {
        if (Array.isArray(existingBlog.blogimage)) {
          existingBlog.blogimage.forEach(deleteImage);
        } else if (typeof existingBlog.blogimage === 'string') {
          deleteImage(existingBlog.blogimage);
        }
      }

      updateData.blogimage = req.files.map(file => file.filename);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Blog update error:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid blog ID format." });
    }
    res.status(500).json({ error: error.message || "Something went wrong while updating the blog." });
  }
};



exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.blogimage) {
      const deleteFile = (filename) => {
        const filePath = path.join(__dirname, '../uploads', filename);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete image ${filename}:`, err);
          }
        });
      };

      if (Array.isArray(blog.blogimage)) {
        blog.blogimage.forEach(deleteFile);
      } else {
        deleteFile(blog.blogimage);
      }
    }

    res.status(200).json({ message: 'Blog and image(s) deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid blog ID format' });
    }
    res.status(400).json({ error: error.message });
  }
};



