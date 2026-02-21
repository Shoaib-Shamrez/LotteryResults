// src/components/SEO.jsx
import { useContext } from "react";
import PropTypes from "prop-types";
import { SEOContext } from "../context/SeoContext";

/**
 * SEO Component - Dynamic Meta Tags using React 19 native support
 *
 * Usage:
 * <SEO
 *   title="Page Title"
 *   description="Page description"
 *   type="article"
 *   canonical="https://yoursite.com/page"
 * />
 */

const SEO = ({
  title,
  description,
  type = "website",
  canonical,
  noindex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
}) => {
  // Get dynamic site settings from context
  const { seoSettings } = useContext(SEOContext);

  // Use context values or fall back to defaults
  const siteTitle = seoSettings?.siteTitle || "Lottery Results Hub";
  const siteName = seoSettings?.siteTitle || "Lottery Results Hub";
  const siteLogo = seoSettings?.siteIcon || "";
  const twitterHandle = seoSettings?.twitterSite || "@lotteryresults";
  const defaultDescription =
    seoSettings?.siteDescription ||
    "Your trusted source for lottery results, winning numbers, and jackpot information.";
  const defaultKeywords =
    seoSettings?.siteKeywords ||
    "lottery, results, winning numbers, jackpot, powerball, mega millions";

  // Use page-specific OG tags if provided, otherwise use context or defaults
  const ogTitle = title || seoSettings?.ogTitle || siteTitle;
  const ogDescription =
    description || seoSettings?.ogDescription || defaultDescription;
  const ogImage = seoSettings?.ogImage || siteLogo;
  const twitterCard = seoSettings?.twitterCard || "summary_large_image";

  // Construct full title - use page title if provided
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  // Construct canonical URL - use provided canonical or current URL
  const canonicalUrl = canonical || window.location.href;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Favicon / Icon - From Database */}
      {siteLogo && (
        <>
          <link rel="icon" href={siteLogo} />
          <link rel="shortcut icon" href={siteLogo} />
          <link rel="apple-touch-icon" href={siteLogo} />
        </>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title || ogTitle} />
      <meta property="og:description" content={description || ogDescription} />
      <meta property="og:site_name" content={siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Open Graph - Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      {type === "article" &&
        tags &&
        tags.length > 0 &&
        tags?.map((tag, index) => (
          <meta property="article:tag" content={tag} key={index} />
        ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title || ogTitle} />
      <meta name="twitter:description" content={description || ogDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
    </>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  type: PropTypes.oneOf(["website", "article"]),
  canonical: PropTypes.string,
  noindex: PropTypes.bool,
  keywords: PropTypes.string,
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  section: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
};

export default SEO;
