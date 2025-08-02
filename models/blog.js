const mongoose = require("mongoose");


const localizedString = {
  en: { type: String, required: true },
  be: { type: String },
  br: { type: String },
  de: { type: String },
  es: { type: String },
  fr: { type: String },
  hi: { type: String },
  it: { type: String },
  ja: { type: String },
  kr: { type: String },
  ru: { type: String },
  zh: { type: String },
};

const localizedContent = {
  en: { type: Object, required: true },
  be: { type: Object },
  br: { type: Object },
  de: { type: Object },
  es: { type: Object },
  fr: { type: Object },
  hi: { type: Object },
  it: { type: Object },
  ja: { type: Object },
  kr: { type: Object },
  ru: { type: Object },
  zh: { type: Object },
};

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: localizedString,
      required: [true, "Blog title is required"],
      trim: true,
    },
    blogpath: { type: String, unique: true, index: true },
     
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    description: {
      type: localizedString,
      required: [true, "Description is required"],
    },
    blogimage: {
      type: [String],
      default: [],
    },
    products: {
      type: String
    },
    category: {
      type: localizedString
    },
    content: {
      type: localizedContent,
      required: [true, "Content is required"],
    },
    publishedAt: {
      type: Date,
    },
  }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
