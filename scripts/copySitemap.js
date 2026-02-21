// frontend/scripts/copySitemap.mjs
// Note: .mjs extension or can use .js with import statements

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

/**
 * Copies sitemap from backend/public to frontend/public
 * For Vite projects with ES modules
 * Usage: node scripts/copySitemap.mjs
 */

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendSitemapURL =
  "https://lottery-backend-omega.vercel.app/sitemap.xml";
const frontendPath = path.join(__dirname, "../public/sitemap.xml");

console.log("🔄 Downloading sitemap from backend...");
console.log(`   URL: ${backendSitemapURL}`);
console.log(`   Saving to: ${frontendPath}`);

https
  .get(backendSitemapURL, (response) => {
    if (response.statusCode !== 200) {
      console.error(
        `❌ Failed to download sitemap. Status: ${response.statusCode}`,
      );
      process.exit(1);
    }

    // Ensure frontend/public exists
    const frontendPublicDir = path.dirname(frontendPath);
    if (!fs.existsSync(frontendPublicDir)) {
      fs.mkdirSync(frontendPublicDir, { recursive: true });
      console.log("📁 Created frontend/public directory");
    }

    const fileStream = fs.createWriteStream(frontendPath);
    response.pipe(fileStream);

    fileStream.on("finish", () => {
      fileStream.close();

      const stats = fs.statSync(frontendPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      console.log(`✅ Sitemap downloaded successfully!`);
      console.log(`   File size: ${fileSizeKB} KB`);
      console.log(`   Updated: ${new Date().toLocaleString()}`);
    });
  })
  .on("error", (err) => {
    console.error("❌ Error downloading sitemap:");
    console.error(`   ${err.message}`);
    process.exit(1);
  });

// ======================================
// For Vite ES module projects:
// ======================================
//
// 1. Save this file as: frontend/scripts/copySitemap.mjs
//    (or frontend/scripts/copySitemap.js)
//
// 2. Update package.json:
//    "scripts": {
//      "dev": "vite",
//      "build": "npm run copy-sitemap && vite build",
//      "copy-sitemap": "node scripts/copySitemap.mjs",
//      "lint": "eslint .",
//      "preview": "vite preview",
//      "build:analyze": "npm run copy-sitemap && vite build --mode analyze"
//    }
//
// ======================================
