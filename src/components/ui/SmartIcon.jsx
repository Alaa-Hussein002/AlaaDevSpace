// src/components/ui/SmartIcon.jsx

import { useState } from 'react';

/**
 * مكون ذكي لعرض الأيقونات (صور أو emoji)
 */
function SmartIcon({ 
  icon, 
  size = 'base', 
  className = '', 
  fallback = '💻', 
  style = {} 
}) {
  const [imageError, setImageError] = useState(false);

  if (!icon) {
    return <span className={className} style={style}>{fallback}</span>;
  }

  // تنظيف الأيقونة
  const cleanIcon = String(icon).trim();

  // التحقق من الأنواع
  const isEmoji = /^[\p{Emoji}\p{Emoji_Component}]{1,4}$/u.test(cleanIcon);
  const isImageUrl = 
    cleanIcon.includes('http://') || 
    cleanIcon.includes('https://') || 
    cleanIcon.includes('/storage/') ||
    cleanIcon.startsWith('/') ||
    /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(cleanIcon);

  // الأحجام
  const sizes = {
    sm: 'w-4 h-4',
    base: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  // إذا كان صورة
  if (isImageUrl && !isEmoji && !imageError) {
    return (
      <img
        src={cleanIcon}
        alt="icon"
        className={`${sizes[size]} object-contain ${className}`}
        style={style}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    );
  }

  // emoji أو fallback
  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`} 
      style={style}
    >
      {imageError ? fallback : cleanIcon}
    </span>
  );
}

export default SmartIcon;