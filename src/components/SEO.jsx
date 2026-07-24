import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  locale = 'ar_SA',
  article = null,
  noindex = false,
  // ✅ بيانات إضافية من الملف الشخصي
  profileData = null,
}) {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  // ✅ استخدام بيانات الـ Profile إذا كانت متوفرة
  const defaultTitle = profileData?.seo?.title || profileData?.full_name?.ar || 'مطور - Portfolio';
  const defaultDescription = profileData?.seo?.description || profileData?.bio?.ar || 'مطور برمجيات محترف متخصص في تطوير تطبيقات الويب باستخدام أحدث التقنيات';
  const defaultKeywords = profileData?.seo?.keywords || 'مطور, برمجة, تطوير ويب, React, Laravel, Portfolio';
  const defaultImage = profileData?.seo?.og_image || profileData?.photo || '/avatar.jpg';
  const defaultLocale = profileData?.seo?.locale || locale || 'ar_SA';
  const defaultType = profileData?.seo?.type || ogType || 'website';

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = ogImage || defaultImage;
  const seoLocale = locale || defaultLocale;
  const seoType = ogType || defaultType;

  // التأكد من أن الصورة URL كامل
  const fullImageUrl = seoImage?.startsWith('http') 
    ? seoImage 
    : `${window.location.origin}${seoImage}`;

  // ✅ تحويل ar_SA إلى ar_AR (فيسبوك يستخدم ar_AR)
  const fbLocale = seoLocale.replace('ar_SA', 'ar_AR').replace('ar_EG', 'ar_AR').replace('ar_YE', 'ar_AR');

  // ✅ اسم الموقع
  const siteName = profileData?.full_name?.ar 
    ? `${profileData.full_name.ar} - Portfolio` 
    : 'مطور - Portfolio';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* ✅ Author */}
      {profileData?.full_name?.ar && (
        <meta name="author" content={profileData.full_name.ar} />
      )}

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content={seoType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={fbLocale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={seoTitle} />
      
      {/* ✅ إذا كان لديك حساب Twitter */}
      {profileData?.social_links?.find(s => s.platform.toLowerCase() === 'twitter') && (
        <meta 
          name="twitter:site" 
          content={`@${profileData.social_links.find(s => s.platform.toLowerCase() === 'twitter').url.split('/').pop()}`} 
        />
      )}

      {/* Article Specific (للمقالات فقط) */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author || profileData?.full_name?.ar || 'مطور'} />
          {article.tags?.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* ✅ JSON-LD Structured Data - محسّن */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": seoType === 'article' ? 'Article' : seoType === 'profile' ? 'Person' : 'WebSite',
          "name": seoTitle,
          "description": seoDescription,
          "url": currentUrl,
          "image": fullImageUrl,
          ...(seoType === 'profile' && profileData && {
            "jobTitle": profileData.rotating_roles?.[0] || "مطور برمجيات",
            "email": profileData.contact?.email,
            "telephone": profileData.contact?.phone,
            "sameAs": profileData.social_links?.map(s => s.url) || [],
          }),
          ...(article && {
            "author": {
              "@type": "Person",
              "name": article.author || profileData?.full_name?.ar || "مطور"
            },
            "datePublished": article.publishedTime,
            "dateModified": article.modifiedTime,
          })
        })}
      </script>
    </Helmet>
  );
}