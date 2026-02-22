// src/pages/SEOSettings.jsx
import { memo, useState, useEffect, useContext } from "react";
import { SEOContext } from "../../../context/SeoContext";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const SEOSettings = memo(() => {
  const { seoSettings, loading, updateSeoSettings } = useContext(SEOContext);

  const [formData, setFormData] = useState({
    siteTitle: "",
    siteDescription: "",
    siteKeywords: "",
    siteIcon: "", // Fixed: Changed from siteicon to siteIcon
    siteLogo: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    twitterSite: "",
  });

  const [sitemapSettings, setSitemapSettings] = useState({
    lastUpdated: null,
    totalUrls: 0,
    isLoading: false,
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageType, setSaveMessageType] = useState("");
  const [sitemapMessage, setSitemapMessage] = useState("");
  const [sitemapMessageType, setSitemapMessageType] = useState("");

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (seoSettings && !loading) {
      setFormData({
        siteTitle: seoSettings.siteTitle || "",
        siteDescription: seoSettings.siteDescription || "",
        siteKeywords: seoSettings.siteKeywords || "",
        siteIcon: seoSettings.siteIcon || "", // Fixed: consistent naming
        siteLogo: seoSettings.siteLogo || "",
        canonicalUrl: seoSettings.canonicalUrl || "",
        ogTitle: seoSettings.ogTitle || "",
        ogDescription: seoSettings.ogDescription || "",
        ogImage: seoSettings.ogImage || "",
        twitterCard: seoSettings.twitterCard || "summary_large_image",
        twitterSite: seoSettings.twitterSite || "",
      });
    }
  }, [seoSettings, loading]);

  // Load sitemap info on mount
  useEffect(() => {
    loadSitemapInfo();
  }, []);

  const loadSitemapInfo = async () => {
    try {
      const response = await fetch(
        `https://lottery-backend-omega.vercel.app/sitemap.xml`,
      );
      if (response.ok) {
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const lastmodElements = xmlDoc.querySelectorAll("lastmod");

        if (lastmodElements.length > 0) {
          const dates = Array.from(lastmodElements)
            .map((el) => el.textContent)
            .map((dateStr) => new Date(dateStr))
            .sort((a, b) => b - a);

          const latestDate = dates[0].toISOString().split("T")[0];

          setSitemapSettings((prev) => ({
            ...prev,
            lastUpdated: latestDate,
            totalUrls: lastmodElements.length,
          }));
        }
      }
    } catch (error) {
      console.log("Could not load sitemap info:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSeoSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMessage("");

    try {
      // Validate required fields
      if (
        !formData.siteTitle ||
        !formData.siteDescription ||
        !formData.canonicalUrl
      ) {
        setSaveMessage(
          "Site title, description, and canonical URL are required",
        );
        setSaveMessageType("error");
        setSaveLoading(false);
        return;
      }
      const validateUrl = (url) => {
        if (!url) return true; // Optional field
        return url.startsWith("/") || url.startsWith("http");
      };

      if (!validateUrl(formData.siteLogo)) {
        setSaveMessage(
          "❌ Logo must be a relative path (/assets/...) or full URL",
        );
        setSaveMessageType("error");
        return;
      }

      if (!validateUrl(formData.siteIcon)) {
        setSaveMessage(
          "❌ Icon must be a relative path (/assets/...) or full URL",
        );
        setSaveMessageType("error");
        return;
      }

      const result = await updateSeoSettings(formData);

      if (result.success) {
        setSaveMessage("✅ Site settings saved successfully!");
        setSaveMessageType("success");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage(`❌ ${result.error || "Failed to save settings"}`);
        setSaveMessageType("error");
      }
    } catch (error) {
      console.error("Error saving site settings:", error);
      setSaveMessage(`❌ Error: ${error.message}`);
      setSaveMessageType("error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSyncSitemap = async () => {
    setSitemapSettings((prev) => ({ ...prev, isLoading: true }));
    setSitemapMessage("");

    try {
      const response = await fetch(`${API_URL}/sitemaps/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSitemapMessage(
          `✅ Sitemap synced successfully! (${data.urlCount} URLs)`,
        );
        setSitemapMessageType("success");
        await loadSitemapInfo();
        setTimeout(() => setSitemapMessage(""), 3000);
      } else {
        setSitemapMessage(`❌ ${data.message || "Failed to sync sitemap"}`);
        setSitemapMessageType("error");
      }
    } catch (error) {
      console.error("Error syncing sitemap:", error);
      setSitemapMessage(`❌ Error: ${error.message}`);
      setSitemapMessageType("error");
    } finally {
      setSitemapSettings((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your site's SEO meta tags, favicon, and sitemap settings
        </p>
      </div>

      {/* Site-wide SEO Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Site-wide SEO Settings
        </h2>

        <form onSubmit={handleSaveSeoSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site Title */}
            <div className="md:col-span-2">
              <label
                htmlFor="siteTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site Title *
              </label>
              <input
                type="text"
                id="siteTitle"
                name="siteTitle"
                value={formData.siteTitle}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your site title"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in browser tab and search results
              </p>
            </div>

            {/* Site Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="siteDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site Description *
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleInputChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your site"
              />
              <p className="text-xs text-gray-500 mt-1">
                Appears in search results (max 160 characters)
              </p>
            </div>

            {/* Site Keywords */}
            <div className="md:col-span-2">
              <label
                htmlFor="siteKeywords"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site Keywords
              </label>
              <input
                type="text"
                id="siteKeywords"
                name="siteKeywords"
                value={formData.siteKeywords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Comma-separated keywords"
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label
                htmlFor="canonicalUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Canonical URL *
              </label>
              <input
                type="url"
                id="canonicalUrl"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yoursite.com"
              />
            </div>

            {/* Site Icon / Favicon */}
            <div>
              <label
                htmlFor="siteIcon"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site Favicon URL
              </label>
              <input
                type="text"
                id="siteIcon"
                name="siteIcon"
                value={formData.siteIcon}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yoursite.com/favicon.svg"
              />
              {formData.siteIcon && (
                <div className="mt-2">
                  <img
                    src={formData.siteIcon}
                    alt="Favicon preview"
                    className="h-12 w-12 rounded border bg-green-400"
                  />
                </div>
              )}
            </div>

            {/* Site Logo */}
            <div>
              <label
                htmlFor="siteLogo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site Logo URL
              </label>
              <input
                type="text"
                id="siteLogo"
                name="siteLogo"
                value={formData.siteLogo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yoursite.com/logo.png"
              />
              {formData.siteLogo && (
                <div className="mt-2">
                  <img
                    src={formData.siteLogo}
                    alt="Logo preview"
                    className="h-12 w-12 rounded border bg-green-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Open Graph Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              🔗 Open Graph Settings
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Used when your site is shared on social media
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="ogTitle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  OG Title
                </label>
                <input
                  type="text"
                  id="ogTitle"
                  name="ogTitle"
                  value={formData.ogTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title for social sharing"
                />
              </div>

              <div>
                <label
                  htmlFor="ogDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  OG Description
                </label>
                <input
                  type="text"
                  id="ogDescription"
                  name="ogDescription"
                  value={formData.ogDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description for social sharing"
                />
              </div>

              <div>
                <label
                  htmlFor="ogImage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  OG Image URL
                </label>
                <input
                  type="url"
                  id="ogImage"
                  name="ogImage"
                  value={formData.ogImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yoursite.com/og-image.png"
                />
                {formData.ogImage && (
                  <div className="mt-2">
                    <img
                      src={formData.ogImage}
                      alt="OG preview"
                      className="h-24 w-40 rounded border object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="twitterSite"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Twitter Site
                </label>
                <input
                  type="text"
                  id="twitterSite"
                  name="twitterSite"
                  value={formData.twitterSite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@yoursite"
                />
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                saveMessageType === "success"
                  ? "bg-green-50 border-green-500 text-green-900"
                  : "bg-red-50 border-red-500 text-red-900"
              }`}
            >
              <p className="font-medium text-sm">{saveMessage}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saveLoading}
              className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors duration-200 ${
                saveLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saveLoading ? "Saving..." : "💾 Save Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* SITEMAP SYNC SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          🗺️ Sitemap Sync Manager
        </h2>

        <div className="space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              What is Sitemap Sync?
            </h3>
            <p className="text-sm text-blue-800">
              Your backend automatically generates and maintains sitemap.xml.
              Click below to sync it to your frontend's public folder so search
              engines can find it at yourdomain.com/sitemap.xml
            </p>
          </div>

          {/* Sitemap Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Total URLs
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {sitemapSettings.totalUrls}
              </p>
              <p className="text-xs text-gray-500 mt-1">pages in sitemap</p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Last Updated
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(sitemapSettings.lastUpdated)}
              </p>
              <p className="text-xs text-gray-500 mt-1">from backend</p>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncSitemap}
            disabled={sitemapSettings.isLoading}
            className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-all transform ${
              sitemapSettings.isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
            }`}
          >
            {sitemapSettings.isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Syncing Sitemap...
              </span>
            ) : (
              <span>📄 Sync Sitemap to Frontend</span>
            )}
          </button>

          {/* Sitemap Message */}
          {sitemapMessage && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                sitemapMessageType === "success"
                  ? "bg-green-50 border-green-500 text-green-900"
                  : "bg-red-50 border-red-500 text-red-900"
              }`}
            >
              <p className="font-medium text-sm">{sitemapMessage}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              📋 How It Works
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>
                <strong>1.</strong> Backend generates/maintains sitemap.xml
                automatically
              </li>
              <li>
                <strong>2.</strong> Click "Sync Sitemap to Frontend" button
              </li>
              <li>
                <strong>3.</strong> Frontend public folder gets updated copy
              </li>
              <li>
                <strong>4.</strong> Search engines find it at
                yourdomain.com/sitemap.xml
              </li>
              <li>
                <strong>5.</strong> See success message - Done!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
});

SEOSettings.displayName = "SEOSettings";

export default SEOSettings;
