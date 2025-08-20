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
    const content = fs.readFileSync(filePath, "utf-8");
    return { fileName, content };
  });
  res.json(posts);
}
