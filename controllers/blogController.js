// controllers/blogController.js
const Blog = require('../models/Blogs');

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedDate: -1 }); // Sort by latest
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new blog (Admin only)
exports.createBlog = async (req, res) => {
  const { title, coverImage, mediaType, content, summary, author } = req.body;

  if (!title || !coverImage || !content) {
    return res.status(400).json({ message: 'Please provide all required fields: title, coverImage, content' });
  }

  const newBlog = new Blog({
    title,
    coverImage,
    mediaType: mediaType || 'image',
    content,
    summary,
    author: author || 'JAPL Team',
  });

  try {
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a blog by ID (Admin only)
exports.updateBlog = async (req, res) => {
  try {
    const { title, coverImage, mediaType, content, summary, author } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, coverImage, mediaType: mediaType || 'image', content, summary, author },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a blog by ID (Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Render Social Media Open Graph HTML for crawler bots / sharing
exports.getBlogSharePreview = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const siteName = 'Janatha Automobiles';
    const defaultTitle = 'Janatha Automobiles - Commercial Vehicle Solutions';
    const defaultDesc = 'Authorized Dealership & Service Partner for Tata Motors, Cummins, Rane TRW, TEL Turbo and commercial vehicle solutions.';
    const defaultImage = 'https://japl.co.in/japl-logo.png';
    const targetUrl = `https://japl.co.in/blogs/${req.params.id}`;

    if (!blog) {
      return res.redirect(targetUrl);
    }

    const title = blog.title || defaultTitle;
    let description = blog.summary || '';
    if (!description && blog.content) {
      description = blog.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
    }
    if (!description) description = defaultDesc;

    let coverImage = blog.coverImage || defaultImage;
    // Check if YouTube
    if (coverImage.includes('youtube.com') || coverImage.includes('youtu.be')) {
      const match = coverImage.match(/(?:youtu\.be\/|watch\?v=)([\w-]+)/);
      if (match && match[1]) {
        coverImage = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    } else if (coverImage.includes('res.cloudinary.com') && /\.(mp4|mov|webm|mkv)$/i.test(coverImage)) {
      coverImage = coverImage.replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg');
    }

    const escapeHtml = (str) =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const escapedTitle = escapeHtml(title);
    const escapedDesc = escapeHtml(description);
    const escapedImage = escapeHtml(coverImage);
    const escapedUrl = escapeHtml(targetUrl);

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /(facebookexternalhit|WhatsApp|Twitterbot|Pinterest|LinkedInBot|TelegramBot|Slackbot|Discordbot|SkypeUriPreview|Googlebot|bingbot|Applebot|Facebot|vkShare)/i.test(userAgent);

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <title>${escapedTitle} | ${siteName}</title>
  <meta name="description" content="${escapedDesc}" />

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDesc}" />
  <meta property="og:image" content="${escapedImage}" />
  <meta property="og:image:secure_url" content="${escapedImage}" />
  <meta property="og:image:alt" content="${escapedTitle}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapedUrl}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDesc}" />
  <meta name="twitter:image" content="${escapedImage}" />

  <link rel="canonical" href="${escapedUrl}" />
  ${!isBot ? `<meta http-equiv="refresh" content="0;url=${escapedUrl}" />
  <script>window.location.replace("${escapedUrl}");</script>` : ''}
</head>
<body>
  <article>
    <h1>${escapedTitle}</h1>
    <p>${escapedDesc}</p>
    <img src="${escapedImage}" alt="${escapedTitle}" />
  </article>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    res.redirect(`https://japl.co.in/blogs/${req.params.id}`);
  }
};