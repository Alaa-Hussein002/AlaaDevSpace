import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Clock, Eye, Calendar, Tag, Code, BookOpen, 
  FileText, Copy, Check, Play, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';

function RenderCodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  
  const copy = () => { 
    navigator.clipboard.writeText(block.content || ''); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000); 
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] font-mono bg-white/5 text-white/60 border-0">
            {block.language || 'code'}
          </Badge>
          {block.title && (
            <span className="text-xs text-white/40">{block.title}</span>
          )}
        </div>
        <button onClick={copy} className="text-white/40 hover:text-white transition-colors">
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <pre className="p-4 bg-[#0d1117] overflow-x-auto text-sm leading-relaxed" dir="ltr">
        <code className="text-[#e6edf3] font-mono">{block.content}</code>
      </pre>
    </div>
  );
}

function RenderVideoBlock({ block }) {
  /**
   * ✅ استخراج معرف YouTube
   */
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*?v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  /**
   * ✅ استخراج معرف Vimeo
   */
  const getVimeoId = (url) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  };

  /**
   * ✅ استخراج معرف Dailymotion
   */
  const getDailymotionId = (url) => {
    if (!url) return null;
    const match = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  /**
   * ✅ التحقق إذا كان ملف فيديو محلي
   */
  const isVideoFile = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
  };

  /**
   * ✅ التحقق إذا كان رابط تضمين مباشر
   */
  const isEmbedUrl = (url) => {
    if (!url) return false;
    return url.includes('/embed/') || url.includes('player.');
  };

  const getFacebookVideoUrl = (url) => {
    if (!url) return null;
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }
    return null;
  };
  
  /**
   * ✅ TikTok
   */
  const getTikTokId = (url) => {
    if (!url) return null;
    const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(block.content);
  const vimeoId = getVimeoId(block.content);
  const dailymotionId = getDailymotionId(block.content);
  const isVideo = isVideoFile(block.content);
  const isEmbed = isEmbedUrl(block.content);
  const facebookUrl = getFacebookVideoUrl(block.content);
  const tiktokId = getTikTokId(block.content);

  if (!block.content) return null;

  return (
    <div className="my-8">
      {/* عنوان الفيديو */}
      {block.title && (
        <p className="text-sm font-medium mb-3 flex items-center gap-2 text-foreground/80">
          <Play className="w-4 h-4 text-red-500" />
          {block.title}
        </p>
      )}

      {/* ✅ YouTube */}
      {youtubeId ? (
        <div className="rounded-xl overflow-hidden aspect-video border border-border/50 shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={block.title || 'فيديو YouTube'}
          />
        </div>
      ) : 
      
      /* ✅ Vimeo */
      vimeoId ? (
        <div className="rounded-xl overflow-hidden aspect-video border border-border/50 shadow-lg">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={block.title || 'فيديو Vimeo'}
          />
        </div>
      ) : 
      
      /* ✅ Dailymotion */
      dailymotionId ? (
        <div className="rounded-xl overflow-hidden aspect-video border border-border/50 shadow-lg">
          <iframe
            src={`https://www.dailymotion.com/embed/video/${dailymotionId}`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            title={block.title || 'فيديو Dailymotion'}
          />
        </div>
      ) : 
      
      /* ✅ ملف فيديو محلي */
      isVideo ? (
        <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
          <video
            controls
            className="w-full"
            preload="metadata"
          >
            <source src={block.content} type="video/mp4" />
            <source src={block.content} type="video/webm" />
            <source src={block.content} type="video/ogg" />
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        </div>
      ) : 
      
      /* ✅ رابط تضمين مباشر (embed) */
      isEmbed ? (
        <div className="rounded-xl overflow-hidden aspect-video border border-border/50 shadow-lg">
          <iframe
            src={block.content}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={block.title || 'فيديو'}
          />
        </div>
      ) : 
      
      /* ✅ رابط خارجي عادي */
      (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-6 rounded-xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
              <Play className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-red-500 transition-colors">
                {block.title || 'مشاهدة الفيديو'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1" dir="ltr">
                {block.content}
              </p>
            </div>
            <div className="shrink-0 w-5 h-5 rounded-full border-2 border-red-500/30 flex items-center justify-center group-hover:border-red-500 transition-colors">
              <svg className="w-2.5 h-2.5 text-red-500 rotate-[-45deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>
      )}

      {facebookUrl && (
        <div className="rounded-xl overflow-hidden aspect-video border border-border/50">
          <iframe
            src={facebookUrl}
            className="w-full h-full"
            allowFullScreen
            title={block.title || 'فيديو Facebook'}
          />
        </div>
      )}
      
      {tiktokId && (
        <div className="rounded-xl overflow-hidden border border-border/50 max-w-md mx-auto">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
            className="w-full h-[600px]"
            allowFullScreen
            title={block.title || 'فيديو TikTok'}
          />
        </div>
      )}

      {/* تسمية توضيحية */}
      {block.caption && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          {block.caption}
        </p>
      )}
    </div>
  );
}

export default function ArticleDetails() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null); // ✅ تغيير الاسم
  const [related, setRelated] = useState([]); // ✅ منفصل
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { seoData } = useSEO();

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      // ✅ جلب المقالة
      const { data: response } = await publicAPI.getArticle(slug);
      
      if (response.success && response.data) {
        setArticle(response.data); // ✅ data مباشرة
        
        // ✅ جلب المقالات ذات الصلة
        loadRelated(slug);
      } else {
        setNotFound(true);
      }

    } catch (error) {
      console.error('Error loading article:', error);
      setNotFound(true);
      
      if (error.response?.status === 404) {
        toast.error('المقالة غير موجودة');
      } else {
        toast.error('فشل تحميل المقالة');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRelated = async (currentSlug) => {
    try {
      const { data: response } = await publicAPI.getRelatedArticles(currentSlug);
      if (response.success && response.data) {
        setRelated(response.data);
      }
    } catch (error) {
      console.error('Error loading related articles:', error);
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم الوجود
  if (notFound || !article) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-4">المقالة غير موجودة</p>
        <Link to="/blog">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 ml-2" /> العودة للمقالات
          </Button>
        </Link>
      </div>
    );
  }

  const isRTL = article.language === 'ar';

  return (
    <>
      {/* ✅ SEO ديناميكي للمقالة */}
      <SEO
        title={article.title}
        description={article.excerpt || article.title}
        keywords={article.tags?.join(', ') || ''}
        ogImage={article.cover_image || seoData?.photo}
        ogType="article"
        article={{
          publishedTime: article.published_at,
          modifiedTime: article.updated_at,
          author: seoData?.title || 'مطور',
          tags: article.tags || [],
        }}
      />
      <div className="min-h-screen pt-24 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4">
          
          {/* التنقل */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Link
              to="/blog"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              dir="rtl"
            >
              <ChevronLeft className="w-4 h-4" /> المقالات
            </Link>
          </motion.div>
  
          {/* صورة الغلاف */}
          {article.cover_image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="aspect-[2/1] rounded-2xl overflow-hidden border border-border/50">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
  
          {/* رأس المقالة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* الشارات */}
            <div className="flex items-center gap-2 mb-4">
              {article.category && (
                <Badge variant="secondary">{article.category}</Badge>
              )}
              {article.is_featured && (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  مميز
                </Badge>
              )}
            </div>
  
            {/* العنوان */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
  
            {/* الملخص */}
            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {article.excerpt}
              </p>
            )}
  
            {/* المعلومات */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground" dir="rtl">
              <span className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold">
                  {article.author?.name?.[0] || 'ع'}
                </span>
                {article.author?.name || 'علاء حسين'}
              </span>
              
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.published_at).toLocaleDateString('ar', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.reading_time || 1} دقيقة
              </span>
              
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views_count || 0}
              </span>
            </div>
          </motion.div>
  
          {/* محتوى المقالة - البلوكات */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {(article.blocks || []).map((block, i) => (
              <div key={block.id || i}>
                {block.type === 'text' && (
                  <div className="text-foreground/90 leading-[2] text-base whitespace-pre-wrap my-4">
                    {block.content}
                  </div>
                )}
                
                {block.type === 'code' && <RenderCodeBlock block={block} />}
                
                {block.type === 'image' && block.content && (
                  <figure className="my-6">
                    <img
                      src={block.content}
                      alt={block.caption || ''}
                      className="w-full rounded-xl border border-border/50"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-xs text-muted-foreground mt-2">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
                
                {block.type === 'video' && <RenderVideoBlock block={block} />}
              </div>
            ))}
          </motion.article>
  
          {/* المصادر */}
          {article.sources && article.sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" dir="rtl">
                <BookOpen className="w-5 h-5 text-primary" /> المصادر والمراجع
              </h2>
              <Card className="p-5 border-border/50">
                <ol className="space-y-2 list-decimal list-inside">
                  {article.sources.map((s, i) => (
                    <li key={i} className="text-sm">
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}
                    </li>
                  ))}
                </ol>
              </Card>
            </motion.div>
          )}
  
          {/* الوسوم */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8" dir="rtl">
              {article.tags.map((t, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  <Tag className="w-3 h-3" /> {t}
                </Badge>
              ))}
            </div>
          )}
  
          {/* المقالات ذات الصلة */}
          {related.length > 0 && (
            <div className="mt-12" dir="rtl">
              <h2 className="text-xl font-bold mb-4">مقالات ذات صلة</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} to={`/blog/${r.slug}`}>
                    <Card className="overflow-hidden card-hover border-border/50 h-full">
                      <div className="h-32 bg-muted">
                        {r.cover_image ? (
                          <img
                            src={r.cover_image}
                            alt={r.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full gradient-bg opacity-10" />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-xs line-clamp-2 mb-2">
                          {r.title}
                        </h3>
                        {r.reading_time && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {r.reading_time} دقيقة
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}