import { useState, useEffect } from 'react';
import { publicAPI } from '@/api/services';

export function useSEO() {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSEO = async () => {
      try {
        const { data } = await publicAPI.getProfile();
        const profile = data.data;
        
        // ✅ الحل: التحقق من نوع البيانات
        let seo = {};
        
        if (profile.seo) {
          // إذا كانت string، حوّلها لـ object
          if (typeof profile.seo === 'string') {
            try {
              seo = JSON.parse(profile.seo);
            } catch (e) {
              console.error('Invalid JSON in seo field:', e);
              seo = {};
            }
          } 
          // إذا كانت object بالفعل، استخدمها مباشرة
          else if (typeof profile.seo === 'object') {
            seo = profile.seo;
          }
        }
        
        setSeoData({
          title: seo.title || profile.full_name?.ar || 'مطور',
          description: seo.description || profile.bio?.ar || '',
          keywords: seo.keywords || '',
          ogImage: seo.og_image || profile.photo || '/avatar.jpg',
          type: seo.type || 'portfolio',
          photo: profile.photo,
        });
      } catch (error) {
        console.error('Error loading SEO:', error);
        
        // ✅ Fallback: حتى لو فشل التحميل، نستخدم قيم افتراضية
        setSeoData({
          title: 'مطور - Portfolio',
          description: 'مطور برمجيات محترف متخصص في تطوير تطبيقات الويب',
          keywords: 'مطور, برمجة, تطوير ويب, React, Laravel',
          ogImage: '/avatar.jpg',
          type: 'portfolio',
          photo: '/avatar.jpg',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSEO();
  }, []);

  return { seoData, loading };
}