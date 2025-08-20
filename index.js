const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to nixtla blog" });
});

app.get("/posts/all", (req, res) => {
  const postsDir = path.join(__dirname, "posts");
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read posts directory" });
    }
    const mdFiles = files.filter((file) => file.endsWith(".md"));
    const posts = mdFiles.map((fileName) => {
      const filePath = path.join(postsDir, fileName);
      const content = fs.readFileSync(filePath, "utf-8");
      return { fileName, content };
    });
    res.json(posts);
  });
});

app.get("/posts/:fileName", (req, res) => {
  const { fileName } = req.params;
  const postsDir = path.join(__dirname, "posts");
  const filePath = path.join(postsDir, fileName);
  if (!fileName.endsWith(".md")) {
    return res.status(400).json({ error: "Invalid file extension" });
  }
  fs.readFile(filePath, "utf-8", (err, content) => {
    if (err) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ fileName, content });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
