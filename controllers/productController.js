const fs = require('fs');
const path = require('path');


const Product = require("../models/product");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET product by productPath
exports.getProductByPath = async (req, res) => {
  const { productPath } = req.params;

  try {

    if (!productPath || typeof productPath !== 'string') {
      return res.status(400).json({ message: "Invalid product path" });
    }
  
    const product = await Product.findOne({ productPath });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (err) {
    console.error("Error in getProductByPath:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Create 

exports.createProduct = async (req, res) => {
  const {
    productName,
    productLink,
    calendlyUrl,
    productPath,
    description,
    why_choose_des,
    who_need_des,
    category,
    benefits,
    customerTestimonials,
    plans,
  } = req.body;

  const imageUrl = req.files?.["imageUrl"]?.map((file) => file.path) || [];
  const gallery = req.files?.["gallery"]?.map((file) => file.path) || [];

  try {

    const exists = await Product.findOne({ productPath });
    if (exists) {
      return res.status(409).json({ message: "Product path already exists" });
    }
    
    const newProduct = new Product({
      productName,
      productLink,
      calendlyUrl,
      productPath,
      description: JSON.parse(description),
      why_choose_des: JSON.parse(why_choose_des),
      who_need_des: JSON.parse(who_need_des),
      category: JSON.parse(category),
      imageUrl,
      gallery,
      benefits: benefits ? JSON.parse(benefits) : [],
      customerTestimonials: customerTestimonials
        ? JSON.parse(customerTestimonials)
        : [],
      plans: plans ? JSON.parse(plans) : [],
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


// Update

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const deleteFile = (filePath) => {
      const fullPath = path.join(__dirname, '../', filePath);
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`Failed to delete file ${filePath}:`, err);
        }
      });
    };

    let imageUrl = product.imageUrl;
    if (req.files?.["imageUrl"]) {
      if (Array.isArray(product.imageUrl)) {
        product.imageUrl.forEach(deleteFile);
      } else if (product.imageUrl) {
        deleteFile(product.imageUrl);
      }
      imageUrl = req.files["imageUrl"].map(file => file.path);
    }

    let gallery = product.gallery;
    if (req.files?.["gallery"]) {
      if (Array.isArray(product.gallery)) {
        product.gallery.forEach(deleteFile);
      } else if (product.gallery) {
        deleteFile(product.gallery);
      }
      gallery = req.files["gallery"].map(file => file.path);
    }

    const updatedData = {
      productName: req.body.productName || product.productName,
      productLink: req.body.productLink || product.productLink,
      calendlyUrl: req.body.calendlyUrl || product.calendlyUrl,
      productPath: req.body.productPath || product.productPath,
      description: req.body.description ? JSON.parse(req.body.description) : product.description,
      why_choose_des: req.body.why_choose_des ? JSON.parse(req.body.why_choose_des) : product.why_choose_des,
      who_need_des: req.body.who_need_des ? JSON.parse(req.body.who_need_des) : product.who_need_des,
      category: req.body.category ? JSON.parse(req.body.category) : product.category,
      imageUrl,
      gallery,
      benefits: req.body.benefits ? JSON.parse(req.body.benefits) : product.benefits,
      customerTestimonials: req.body.customerTestimonials
        ? JSON.parse(req.body.customerTestimonials)
        : product.customerTestimonials,
      plans: req.body.plans ? JSON.parse(req.body.plans) : product.plans,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};



//delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const deleteFile = (filePath) => {
      const fullPath = path.join(__dirname, '../', filePath);
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`Failed to delete file ${filePath}:`, err);
        }
      });
    };

    if (Array.isArray(product.imageUrl)) {
      product.imageUrl.forEach(deleteFile);
    } else if (product.imageUrl) {
      deleteFile(product.imageUrl);
    }

    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(deleteFile);
    } else if (product.gallery) {
      deleteFile(product.gallery);
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};


