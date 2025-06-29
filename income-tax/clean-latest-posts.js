const fs = require("fs");
const path = require("path");

// Root folder jahan aapke categories (gst, income-tax, etc.) ke folders hain
const blogRoot = path.join(__dirname);

// Sirf ye folders me check karein
const categories = ["gst", "income-tax"];

categories.forEach((cat) => {
  const folderPath = path.join(blogRoot, cat);
  const files = fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (file.endsWith(".html")) {
      let content = fs.readFileSync(filePath, "utf-8");

      // Find all 'latest-post' blocks
      const latestPostRegex = /<div class="sidebar-widget latest-post[\s\S]*?<\/div>/g;
      const matches = content.match(latestPostRegex);

      if (matches && matches.length > 1) {
        // Keep only the first latest post block
        const cleanedContent =
          content.replace(latestPostRegex, (match, offset, str) => {
            // return first match only
            return match === matches[0] ? match : "";
          });

        fs.writeFileSync(filePath, cleanedContent, "utf-8");
        console.log(`🧹 Cleaned: ${filePath}`);
      }
    }
  });
});

console.log("✅ Done cleaning duplicate 'Latest Posts' sections.");
