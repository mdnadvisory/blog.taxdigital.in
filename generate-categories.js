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

// 🔁 Step 1: Generate category-wise pages
categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  let postsList = "";

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder);

    files.forEach((file) => {
      const filename = path.basename(file, ".html");
      const postUrl = `/${cat}/${file}`;
      const postTitle = filename.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

// 🔁 Step 2: Auto-clean duplicate 'Latest Posts' in all post files
console.log("\n🧹 Cleaning duplicate 'Latest Posts' from post files...");
categories.forEach((cat) => {
  const folderPath = path.join(blogRoot, cat);
  const files = fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (file.endsWith(".html")) {
      let content = fs.readFileSync(filePath, "utf-8");

      const latestPostRegex = /<div class="sidebar-widget latest-post[\s\S]*?<\/div>/g;
      const matches = content.match(latestPostRegex);

      if (matches && matches.length > 1) {
        const cleanedContent =
          content.replace(latestPostRegex, (match, offset, str) => {
            return match === matches[0] ? match : "";
          });

        fs.writeFileSync(filePath, cleanedContent, "utf-8");
        console.log(`🧹 Cleaned: ${file}`);
      }
    }
  });
});

console.log("\n✅ All tasks done successfully!");
