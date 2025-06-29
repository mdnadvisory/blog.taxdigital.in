// generate-categories.js

const fs = require("fs");
const path = require("path");

const categories = ["gst", "income-tax"];
const blogRoot = path.join(__dirname);
const categoryDir = path.join(blogRoot, "category");
const templatePath = path.join(blogRoot, "category-template.html");
const template = fs.readFileSync(templatePath, "utf-8");

// Ensure category folder exists
if (!fs.existsSync(categoryDir)) {
  fs.mkdirSync(categoryDir);
}

// Store all post details to use for "Latest Posts"
const allPosts = [];

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  let postsList = "";

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder).filter(file => file.endsWith(".html"));

    files.forEach((file) => {
      const filename = path.basename(file, ".html");
      const postUrl = `/${cat}/${file}`;
      const postTitle = filename.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      allPosts.push({ url: postUrl, title: postTitle });

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

// Generate latest-post section and inject into all post files
const latestHTML = allPosts.slice(-5).reverse().map(post => `
  <div class="media border-bottom py-3">
    <a href="${post.url}"><img class="mr-4" src="https://taxdigital.in/images/blog/bt-1.jpg" alt="${post.title}"></a>
    <div class="media-body">
      <h6 class="my-2"><a href="${post.url}">${post.title}</a></h6>
      <span class="text-sm text-muted">Just Now</span>
    </div>
  </div>`).join("\n");

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder).filter(file => file.endsWith(".html"));

    files.forEach((file) => {
      const filePath = path.join(catFolder, file);
      let content = fs.readFileSync(filePath, "utf-8");

      // Replace entire latest-post widget if found
      content = content.replace(/<div class="sidebar-widget latest-post[\s\S]*?<\/div>\s*<\/div>/, match => {
        return `
<div class="sidebar-widget latest-post card border-0 p-4 mb-3">
  <h5>Latest Posts</h5>
  ${latestHTML}
</div>`;
      });

      fs.writeFileSync(filePath, content);
      console.log(`🔁 Updated latest post in: ${file}`);
    });
  }
});
