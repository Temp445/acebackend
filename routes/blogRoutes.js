const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getBlogByTitle,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const blogUpload = multer({ storage: blogStorage });

// Image Tiptap
const singleImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);

  },
});

const uploadSingleImage = multer({ storage: singleImageStorage });

// Blog Routes 
router.get('/blog/:blogpath', getBlogByTitle);
router.get('/blog', getAllBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blog', blogUpload.array('blogimage', 5), createBlog);
router.put('/blog/:id', blogUpload.array('blogimage', 5), updateBlog);
router.delete('/blog/:id', deleteBlog);

// Tiptap Image Upload
router.post('/upload', uploadSingleImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.status(200).json({ url: imageUrl });
});

module.exports = router;
