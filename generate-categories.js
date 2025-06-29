const fs = require("fs");
const path = require("path");

const categories = ["gst", "itr"];
const blogRoot = path.join(__dirname);
const categoryDir = path.join(blogRoot, "category");
const templatePath = path.join(blogRoot, "category-template.html");
const template = fs.readFileSync(templatePath, "utf-8");
const indexPath = path.join(blogRoot, "index.html");

// Ensure category folder exists
if (!fs.existsSync(categoryDir)) {
  fs.mkdirSync(categoryDir);
}

let latestPostsHtml = [];

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  let postsList = "";

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder)
      .filter(file => file.endsWith(".html"))
      .sort((a, b) => fs.statSync(path.join(catFolder, b)).mtime - fs.statSync(path.join(catFolder, a)).mtime);

    // Add to latestPosts list
    latestPostsHtml.push(...files.map((file) => ({
      category: cat,
      file,
      mtime: fs.statSync(path.join(catFolder, file)).mtime
    })));

    files.forEach((file) => {
      const filename = path.basename(file, ".html");
      const postUrl = `/${cat}/${file}`;
      const postTitle = filename.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      postsList += `
        <div class="col-lg-6 col-md-6 mb-5">
          <div class="blog-item">
            <img src="https://taxdigital.in/images/blog/1.jpg" alt="${postTitle}" class="img-fluid rounded">
            <div class="blog-item-content bg-white p-4">
              <div class="blog-item-meta py-1 px-2">
                <span class="text-muted text-capitalize mr-3"><i class="ti-pencil-alt mr-2"></i>${cat}</span>
              </div>
              <h3 class="mt-3 mb-3"><a href="${postUrl}">${postTitle}</a></h3>
              <p class="mb-4">Learn more about ${postTitle} and other insights in the ${cat.toUpperCase()} category.</p>
              <a href="${postUrl}" class="btn btn-small btn-main btn-round-full">Learn More</a>
            </div>
          </div>
        </div>
      `;
    });
  }

  const output = template
    .replace(/{{categoryTitle}}/g, cat.toUpperCase())
    .replace(/{{postsList}}/g, postsList || `<p>No posts available in this category yet.</p>`);

  fs.writeFileSync(path.join(categoryDir, `${cat}.html`), output);
  console.log(`✅ Category page generated: ${cat}.html`);
});

// -------- Update Latest Posts in index.html --------
latestPostsHtml = latestPostsHtml
  .sort((a, b) => b.mtime - a.mtime)
  .slice(0, 3)
  .map(({ file, category }) => {
    const filename = path.basename(file, ".html");
    const postUrl = `/${category}/${file}`;
    const postTitle = filename.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    return `
      <div class="media border-bottom py-3">
        <a href="${postUrl}"><img class="mr-4" src="https://taxdigital.in/images/blog/bt-1.jpg" alt="${postTitle}"></a>
        <div class="media-body">
            <h6 class="my-2"><a href="${postUrl}">${postTitle}</a></h6>
            <span class="text-sm text-muted">Recently Added</span>
        </div>
      </div>`;
  }).join("\n");

let indexContent = fs.readFileSync(indexPath, "utf-8");

indexContent = indexContent.replace(
  /<div class="sidebar-widget latest-post card border-0 p-4 mb-3">[\s\S]*?<div class="sidebar-widget bg-white rounded tags/,
  `<div class="sidebar-widget latest-post card border-0 p-4 mb-3">
    <h5>Latest Posts</h5>
    ${latestPostsHtml}
  </div>\n<div class="sidebar-widget bg-white rounded tags`
);

fs.writeFileSync(indexPath, indexContent);
console.log("✅ Latest posts updated in index.html");
