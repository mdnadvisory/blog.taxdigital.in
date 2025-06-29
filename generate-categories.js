const fs = require('fs');
const path = require('path');

const blogDirs = ['gst']; // ← Yahan apne blog folders add karte jao
const templatePath = path.join('layout', 'category-template.html');
const outputDir = 'category';

// Step 1: Read Template
const template = fs.readFileSync(templatePath, 'utf-8');
const categoryPosts = {};

// Step 2: Loop through each folder
blogDirs.forEach(dir => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const html = fs.readFileSync(filePath, 'utf-8');

    const categoryMatch = html.match(/<meta name="category" content="(.*?)"/i);
    const titleMatch = html.match(/<meta name="title" content="(.*?)"/i);

    if (!categoryMatch || !titleMatch) return;

    const category = categoryMatch[1].toLowerCase();
    const title = titleMatch[1];
    const url = `/${dir}/${file}`;
    const listItem = `<li><a href="${url}">${title}</a></li>`;

    if (!categoryPosts[category]) categoryPosts[category] = [];
    categoryPosts[category].push(listItem);
  });
});

// Step 3: Create category output folder if needed
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Step 4: Write HTML files for each category
Object.entries(categoryPosts).forEach(([category, posts]) => {
  const htmlContent = template
    .replace(/{{categoryTitle}}/g, category.toUpperCase())
    .replace('{{postsList}}', posts.join('\n'));

  const outputPath = path.join(outputDir, `${category}.html`);
  fs.writeFileSync(outputPath, htmlContent);
  console.log(`✅ Created: ${outputPath}`);
});

console.log('🎉 All category pages generated successfully.');
