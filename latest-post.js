const fs = require("fs");
const path = require("path");

const categories = ["gst", "itr"];
const blogRoot = path.join(__dirname);
const indexPath = path.join(blogRoot, "index.html");

let latestPostsHtml = "";

// Collect posts from each category
categories.forEach((cat) => {
  const catPath = path.join(blogRoot, cat);
  if (fs.existsSync(catPath)) {
    const files = fs.readdirSync(catPath)
      .filter(file => file.endsWith(".html"))
      .sort((a, b) => fs.statSync(path.join(catPath, b)).mtime - fs.statSync(path.join(catPath, a)).mtime)
      .slice(0, 3); // last 3 posts

    files.forEach((file) => {
      const postName = path.basename(file, ".html");
      const postUrl = `/${cat}/${file}`;
      const postTitle = postName.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      latestPostsHtml += `
        <div class="media border-bottom py-3">
          <a href="${postUrl}"><img class="mr-4" src="https://taxdigital.in/images/blog/bt-1.jpg" alt="${postTitle}"></a>
          <div class="media-body">
              <h6 class="my-2"><a href="${postUrl}">${postTitle}</a></h6>
              <span class="text-sm text-muted">Updated Recently</span>
          </div>
        </div>`;
    });
  }
});

// Replace in index.html
let indexContent = fs.readFileSync(indexPath, "utf-8");

indexContent = indexContent.replace(
  /<div class="sidebar-widget latest-post[^>]*>[\s\S]*?<div class="sidebar-widget bg-white rounded tags/,
  `<div class="sidebar-widget latest-post card border-0 p-4 mb-3">
    <h5>Latest Posts</h5>
    ${latestPostsHtml}
  </div>\n<div class="sidebar-widget bg-white rounded tags`
);

fs.writeFileSync(indexPath, indexContent);
console.log("✅ Latest posts updated in index.html");
