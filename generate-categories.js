// generate-categories.js

const fs = require("fs");
const path = require("path");

const categories = ["gst", "income-tax"];
const blogRoot = path.join(__dirname);
const categoryDir = path.join(blogRoot, "category");
const templatePath = path.join(blogRoot, "category-template.html");
const template = fs.readFileSync(templatePath, "utf-8");

// Function to generate latest posts HTML block
const generateLatestPosts = (allPosts) => {
  let latestHtml = `
    <div class="sidebar-widget latest-post card border-0 p-4 mb-3">
      <h5>Latest Posts</h5>
  `;

  const sorted = allPosts.slice(-3).reverse(); // Last 3 posts

  sorted.forEach((post) => {
    latestHtml += `
      <div class="media border-bottom py-3">
        <a href="${post.url}"><img class="mr-4" src="${post.image}" alt="${post.title}"></a>
        <div class="media-body">
          <h6 class="my-2"><a href="${post.url}">${post.title}</a></h6>
          <span class="text-sm text-muted">${post.date}</span>
        </div>
      </div>
    `;
  });

  latestHtml += `</div>`;
  return latestHtml;
};

const removeOldLatestBlock = (html) => {
  return html.replace(
    /<div class="sidebar-widget latest-post[\s\S]*?<\/div>\s*<\/div>/,
    ""
  );
};

// Ensure category folder exists
if (!fs.existsSync(categoryDir)) {
  fs.mkdirSync(categoryDir);
}

let allPosts = [];

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  let postsList = "";

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder);

    files.forEach((file) => {
      const filename = path.basename(file, ".html");
      const postUrl = `/${cat}/${file}`;
      const postTitle = filename.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const postImage = "https://taxdigital.in/images/blog/1.jpg";
      const postDate = "Updated";

      postsList += `
        <div class="col-lg-6 col-md-6 mb-5">
          <div class="blog-item">
            <img src="${postImage}" alt="${postTitle}" class="img-fluid rounded">
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

      allPosts.push({ url: postUrl, title: postTitle, image: postImage, date: postDate });
    });
  }

  const output = template
    .replace(/{{categoryTitle}}/g, cat.toUpperCase())
    .replace(/{{postsList}}/g, postsList || `<p>No posts available in this category yet.</p>`);

  fs.writeFileSync(path.join(categoryDir, `${cat}.html`), output);
  console.log(`✅ Category page generated: ${cat}.html`);
});

// Update individual post files with latest posts
const latestHtml = generateLatestPosts(allPosts);

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);

  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder);

    files.forEach((file) => {
      const postPath = path.join(catFolder, file);
      const originalHtml = fs.readFileSync(postPath, "utf-8");
      const cleanedHtml = removeOldLatestBlock(originalHtml);
      const updatedHtml = cleanedHtml.replace(
        /<div class="sidebar-wrap">([\s\S]*?)<\/div>/,
        `<div class="sidebar-wrap">$1${latestHtml}</div>`
      );
      fs.writeFileSync(postPath, updatedHtml);
      console.log(`🔁 Updated latest post in: ${file}`);
    });
  }
});

// ✅ Inject Latest Posts into index.html
const indexPath = path.join(blogRoot, "index.html");
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, "utf-8");

  const updatedIndex = indexHtml.replace(
    /<!--\s*{{latestPosts}}\s*-->/,
    latestHtml
  );

  fs.writeFileSync(indexPath, updatedIndex);
  console.log("🏠 Injected latest posts into: index.html");
}

