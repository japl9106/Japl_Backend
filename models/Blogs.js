// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  coverImage: {
    type: String, // URL to the image or video
    required: true,
  },
  mediaType: {
    type: String, // 'image' or 'video'
    enum: ['image', 'video'],
    default: 'image',
  },
  content: {
    type: String, // HTML or formatted content of the blog
    required: true,
  },
  summary: {
    type: String,
    trim: true,
  },
  author: {
    type: String,
    default: 'JAPL Team',
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Blog', blogSchema);