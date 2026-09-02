// Sitemap utility functions
import { apiUrl } from "./apiBase";

const CRED = { credentials: "include" };

const SITEMAP_URL = '/sitemap.xml';

// Generate sitemap entry for a post
export const generateSitemapEntry = (post) => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com';
  const postUrl = `${baseUrl}/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug || post.id}`;
  
  return {
    url: postUrl,
    lastmod: post.updatedAt || post.createdAt,
    changefreq: 'daily',
    priority: post.status === 'published' ? '0.8' : '0.5'
  };
};

// Generate sitemap entry for a category page
export const generateCategoryEntry = (category) => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com';
  const categoryUrl = `${baseUrl}/${category.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    url: categoryUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '0.7'
  };
};

// Generate sitemap entry for static pages
export const generateStaticPageEntry = (path, priority = '0.6') => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com';
  
  return {
    url: `${baseUrl}${path}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority
  };
};

// Generate complete sitemap XML
export const generateSitemapXML = (entries) => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urlEntries = entries.map(entry => {
    return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${new Date(entry.lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join('\n');
  
  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
};

// Add post to sitemap
export const addPostToSitemap = async (post) => {
  try {
    const response = await fetch(apiUrl("/admin/seo/sitemap/add"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", data: post }),
      ...CRED,
    });
    if (!response.ok) throw new Error('Failed to add post to sitemap');
    return await response.json();
  } catch (error) {
    console.error('Error adding post to sitemap:', error);
    throw error;
  }
};

// Remove post from sitemap
export const removePostFromSitemap = async (postId) => {
  try {
    const response = await fetch(apiUrl("/admin/seo/sitemap/remove"), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id: postId }),
      ...CRED,
    });
    if (!response.ok) throw new Error('Failed to remove post from sitemap');
    return await response.json();
  } catch (error) {
    console.error('Error removing post from sitemap:', error);
    throw error;
  }
};

// Update post in sitemap
export const updatePostInSitemap = async (post) => {
  try {
    const response = await fetch(apiUrl("/admin/seo/sitemap/update"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", data: post }),
      ...CRED,
    });
    if (!response.ok) throw new Error('Failed to update post in sitemap');
    return await response.json();
  } catch (error) {
    console.error('Error updating post in sitemap:', error);
    throw error;
  }
};

// Generate complete sitemap
export const generateCompleteSitemap = async (posts, categories) => {
  try {
    const entries = [];

    // Add homepage
    entries.push(generateStaticPageEntry('/', '1.0'));

    // Add category pages
    categories.forEach(category => {
      entries.push(generateCategoryEntry(category));
    });

    // Add static pages
    const staticPages = [
      { path: '/faqs', priority: '0.6' },
      { path: '/about', priority: '0.5' },
      { path: '/contact', priority: '0.5' },
      { path: '/privacy', priority: '0.3' },
      { path: '/terms', priority: '0.3' }
    ];

    staticPages.forEach(page => {
      entries.push(generateStaticPageEntry(page.path, page.priority));
    });

    // Add published posts
    posts.filter(post => post.status === 'published').forEach(post => {
      entries.push(generateSitemapEntry(post));
    });

    // Generate XML
    const sitemapXML = generateSitemapXML(entries);

    // Save to server
    const response = await fetch(apiUrl("/admin/seo/sitemap/generate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitemap: sitemapXML, entries: entries }),
      ...CRED,
    });
    if (!response.ok) throw new Error('Failed to generate sitemap');
    return await response.json();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

// Get sitemap status
export const getSitemapStatus = async () => {
  try {
    const response = await fetch(apiUrl("/admin/seo/sitemap/status"), CRED);
    if (!response.ok) throw new Error('Failed to get sitemap status');
    return await response.json();
  } catch (error) {
    console.error('Error getting sitemap status:', error);
    throw error;
  }
};

// Submit sitemap to search engines
export const submitSitemapToSearchEngines = async () => {
  try {
    const response = await fetch(apiUrl("/admin/seo/sitemap/submit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...CRED,
    });
    if (!response.ok) throw new Error('Failed to submit sitemap to search engines');
    return await response.json();
  } catch (error) {
    console.error('Error submitting sitemap to search engines:', error);
    throw error;
  }
};

// Validate sitemap URL
export const validateSitemapUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Get sitemap URL for the site
export const getSitemapUrl = () => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://lotteryresults.com';
  return `${baseUrl}${SITEMAP_URL}`;
};

export default {
  generateSitemapEntry,
  generateCategoryEntry,
  generateStaticPageEntry,
  generateSitemapXML,
  addPostToSitemap,
  removePostFromSitemap,
  updatePostInSitemap,
  generateCompleteSitemap,
  getSitemapStatus,
  submitSitemapToSearchEngines,
  validateSitemapUrl,
  getSitemapUrl
};

