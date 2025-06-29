const fs = require("fs");
const path = require("path");

const categories = ["gst", "income-tax"];
const blogRoot = path.join(__dirname);
const categoryDir = path.join(blogRoot, "category");
const templatePath = path.join(blogRoot, "category-template.html");
const template = fs.readFileSync(templatePath, "utf-8");

// 🟩 STEP 1: Generate Category Pages
if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir);

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

    const output = template
      .replace(/{{categoryTitle}}/g, cat.toUpperCase())
      .replace(/{{postsList}}/g, postsList || `<p>No posts available in this category yet.</p>`);

    fs.writeFileSync(path.join(categoryDir, `${cat}.html`), output);
    console.log(`✅ Category page generated: ${cat}.html`);
  }
});

// 🟨 STEP 2: Inject Latest Posts Into Every Blog Post
let allPosts = [];

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder);

    files.forEach((file) => {
      const filePath = path.join(catFolder, file);
      const filename = path.basename(file, ".html");
      const title = filename.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      allPosts.push({
        title,
        url: `/${cat}/${file}`,
        thumb: "https://taxdigital.in/images/blog/bt-1.jpg", // optional: dynamic thumb later
        date: "01 Jul 2025", // optional: future improvement
        path: filePath
      });
    });
  }
});

// Generate latest post block HTML
let latestHTML = "";

allPosts.slice(0, 3).forEach(post => {
  latestHTML += `
    <div class="media border-bottom py-3">
      <a href="${post.url}"><img class="mr-4" src="${post.thumb}" alt=""></a>
      <div class="media-body">
        <h6 class="my-2"><a href="${post.url}">${post.title}</a></h6>
        <span class="text-sm text-muted">${post.date}</span>
      </div>
    </div>
  `;
});

// Inject into all post files
allPosts.forEach(post => {
  let html = fs.readFileSync(post.path, "utf-8");

  const newHtml = html.replace(
    /<div class="sidebar-widget latest-post[^>]*>[\s\S]*?<\/div>/,
    `<div class="sidebar-widget latest-post card border-0 p-4 mb-3">\n<h5>Latest Posts</h5>${latestHTML}\n</div>`
  );

  fs.writeFileSync(post.path, newHtml, "utf-8");
  console.log(`🔁 Updated latest posts in: ${post.url}`);
});
