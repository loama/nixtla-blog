import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const postsDir = path.join(process.cwd(), "posts");
  let files = [];
  try {
    files = fs.readdirSync(postsDir);
  } catch (err) {
    return res.status(500).json({ error: "Unable to read posts directory" });
  }
  const mdFiles = files.filter((file) => file.endsWith(".md"));
  const posts = mdFiles.map((fileName) => {
    const filePath = path.join(postsDir, fileName);
    const contentRaw = fs.readFileSync(filePath, "utf-8");
    // Parse frontmatter
    const match = contentRaw.match(/^---([\s\S]*?)---\s*([\s\S]*)$/);
    let frontmatter = {};
    let content = contentRaw;
    if (match) {
      const frontmatterRaw = match[1];
      content = match[2].trim();
      frontmatterRaw.split("\n").forEach((line) => {
        const m = line.match(/^([a-zA-Z0-9_\-]+):\s*(.*)$/);
        if (m) {
          let key = m[1].trim();
          let value = m[2].trim();
          // Remove quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          // Parse arrays (e.g. tags: ["a", "b"])
          if (value.startsWith("[") && value.endsWith("]")) {
            try {
              value = JSON.parse(value.replace(/'/g, '"'));
            } catch {}
          }
          frontmatter[key] = value;
        }
      });
    }
    return {
      title: frontmatter.title || null,
      author: frontmatter.author || null,
      description: frontmatter.description || null,
      image: frontmatter.image || null,
      categories: frontmatter.categories || null,
      tags: frontmatter.tags || null,
      fileName: fileName.replace(/\.md$/, ""),
      content,
    };
  });
  res.json(posts);
}
