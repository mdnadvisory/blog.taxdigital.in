const fs = require("fs");
const path = require("path");

const categories = ["gst", "income-tax"];
const blogRoot = __dirname;
const categoryDir = path.join(blogRoot, "category");
const templatePath = path.join(blogRoot, "category-template.html");
const template = fs.readFileSync(templatePath, "utf-8");

let allPosts = [];

// Step 1: Read all posts
categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  if (!fs.existsSync(catFolder)) return;
  const files = fs.readdirSync(catFolder);

  files.forEach((file) => {
    if (file.endsWith(".html")) {
      const title = file.replace(/-/g, " ").replace(/\.html$/, "").replace(/\b\w/g, c => c.toUpperCase());
      allPosts.push({
        url: `/${cat}/${file}`,
        title,
        image: "https://taxdigital.in/images/blog/1.jpg",
        date: "30/6/2025",
      });
    }
  });
});

// Step 2: Generate category pages
if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir);

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  let postsList = "";

  const catPosts = allPosts.filter(p => p.url.startsWith(`/${cat}/`));
  catPosts.forEach((post) => {
    postsList += `
      <div class="col-lg-6 col-md-6 mb-5">
        <div class="blog-item">
          <img src="${post.image}" alt="${post.title}" class="img-fluid rounded">
          <div class="blog-item-content bg-white p-4">
            <div class="blog-item-meta py-1 px-2">
              <span class="text-muted text-capitalize mr-3"><i class="ti-pencil-alt mr-2"></i>${cat}</span>
            </div>
            <h3 class="mt-3 mb-3"><a href="${post.url}">${post.title}</a></h3>
            <p class="mb-4">Learn more about ${post.title} and other insights in the ${cat.toUpperCase()} category.</p>
            <a href="${post.url}" class="btn btn-small btn-main btn-round-full">Learn More</a>
          </div>
        </div>
      </div>
    `;
  });

  const output = template
    .replace(/{{categoryTitle}}/g, cat.toUpperCase())
    .replace(/{{postsList}}/g, postsList || "<p>No posts yet.</p>");

  fs.writeFileSync(path.join(categoryDir, `${cat}.html`), output);
  console.log(`✅ Generated category: ${cat}.html`);
});

// Step 3: Generate latest HTML block
const latestHtml = (() => {
  let html = `<div class="sidebar-widget latest-post card border-0 p-4 mb-3">\n<h5>Latest Posts</h5>`;
  allPosts.slice(-3).reverse().forEach(post => {
    html += `
      <div class="media border-bottom py-3">
        <a href="${post.url}"><img class="mr-4" src="${post.image}" alt="${post.title}"></a>
        <div class="media-body">
          <h6 class="my-2"><a href="${post.url}">${post.title}</a></h6>
          <span class="text-sm text-muted">${post.date}</span>
        </div>
      </div>`;
  });
  html += `\n</div>`;
  return html;
})();

// Step 4: Inject into index.html between markers
const indexPath = path.join(blogRoot, "index.html");
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, "utf-8");
  const updated = indexContent.replace(
    /<!--\s*LATEST-POSTS-START\s*-->[\s\S]*?<!--\s*LATEST-POSTS-END\s*-->/,
    `<!-- LATEST-POSTS-START -->\n${latestHtml}\n<!-- LATEST-POSTS-END -->`
  );
  fs.writeFileSync(indexPath, updated);
  console.log("🏠 Injected latest posts into: index.html");
} else {
  console.log("❌ index.html not found");
}

// Step 5: Inject latest into each post's sidebar
const removeOldLatestBlock = (html) => {
  return html.replace(
    /<div class="sidebar-widget latest-post[\s\S]*?<\/div>\s*<\/div>/,
    ""
  );
};

categories.forEach((cat) => {
  const catFolder = path.join(blogRoot, cat);
  if (!fs.existsSync(catFolder)) return;
  const files = fs.readdirSync(catFolder);
  files.forEach((file) => {
    const postPath = path.join(catFolder, file);
    if (file.endsWith(".html")) {
      const html = fs.readFileSync(postPath, "utf-8");
      const clean = removeOldLatestBlock(html);
      const updated = clean.replace(
        /<div class="sidebar-wrap">([\s\S]*?)<\/div>/,
        `<div class="sidebar-wrap">$1${latestHtml}</div>`
      );
      fs.writeFileSync(postPath, updated);
      console.log(`🔁 Updated: ${file}`);
    }
  });
});
