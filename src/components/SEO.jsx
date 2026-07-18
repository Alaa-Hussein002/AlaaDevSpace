import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  article = null,
  noindex = false,
}) {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  // القيم الافتراضية
  const defaultTitle = 'مطور - Portfolio';
  const defaultDescription = 'مطور برمجيات محترف متخصص في تطوير تطبيقات الويب باستخدام أحدث التقنيات';
  const defaultKeywords = 'مطور, برمجة, تطوير ويب, React, Laravel, Portfolio';
  const defaultImage = ogImage || '/avatar.jpg'; // استخدام صورتك الشخصية كافتراضي

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = ogImage || defaultImage;

  // التأكد من أن الصورة URL كامل
  const fullImageUrl = seoImage?.startsWith('http') 
    ? seoImage 
    : `${window.location.origin}${seoImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="مطور - Portfolio" />
      <meta property="og:locale" content="ar_AR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Article Specific (للمقالات فقط) */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          {article.tags?.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ogType === 'article' ? 'Article' : 'WebSite',
          "name": seoTitle,
          "description": seoDescription,
          "url": currentUrl,
          "image": fullImageUrl,
          ...(article && {
            "author": {
              "@type": "Person",
              "name": article.author || "مطور"
            },
            "datePublished": article.publishedTime,
            "dateModified": article.modifiedTime,
          })
        })}
      </script>
    </Helmet>
  );
}