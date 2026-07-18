import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, Clock, Eye, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { publicAPI } from '@/api/services';
import FavoriteButton from '@/components/ui/favorite-button';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { seoData, loading: seoLoading } = useSEO();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await publicAPI.getArticles();
      setArticles(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = search.trim() 
    ? articles
        .map((article) => {
          const searchLower = search.toLowerCase().trim();
          let score = 0;
          
          const title = (article.title || '').toLowerCase();
          const excerpt = (article.excerpt || '').toLowerCase();
          const category = (article.category || '').toLowerCase();
          const tags = (article.tags || []).map(t => t.toLowerCase());
  
          // العنوان له وزن أكبر
          if (title.includes(searchLower)) score += 10;
          if (title.startsWith(searchLower)) score += 5;
  
          // التصنيف
          if (category.includes(searchLower)) score += 5;
  
          // الوسوم
          if (tags.some(t => t.includes(searchLower))) score += 3;
  
          // المقتطف
          if (excerpt.includes(searchLower)) score += 1;
  
          return score > 0 ? { article, score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map(item => item.article)
    : articles; // إذا البحث فارغ، أرجع كل المقالات كما هي

  return (
    <>
      {/* ✅ إضافة SEO */}
      {!seoLoading && seoData && (
        <SEO
          title={`المقالات التقنية - ${seoData.title}`}
          description="مقالات ودروس في البرمجة والتقنية وهندسة نظم المعلومات"
          keywords={`مقالات, برمجة, دروس, ${seoData.keywords}, blog, articles`}
          ogImage={seoData.photo}
          ogType="website"
        />
      )}
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <FileText className="w-3 h-3 ml-1" /> مدونة
          </Badge>
          <h1 className="text-4xl font-bold mb-3">
            المقالات <span className="gradient-text">التقنية</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            مقالات ودروس في البرمجة والتقنية وهندسة نظم المعلومات
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="ابحث عن مقالة..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 h-11 bg-card border-border" />
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد مقالات حالياً</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/blog/${article.slug}`}>
                  <Card className="overflow-hidden card-hover group border-border/50 bg-card/80">
                    <div className="flex flex-col sm:flex-row">
                        {/* <div className="absolute top-3 left-3">
                          <FavoriteButton item={article} type="article" />
                        </div> */}
                      <div className="sm:w-64 h-48 sm:h-auto bg-muted shrink-0 overflow-hidden">
                        {article.cover_image ? (
                          <img src={article.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full gradient-bg opacity-15 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {article.category && <Badge variant="secondary" className="text-[10px]">{article.category}</Badge>}
                          {article.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px]">مميز</Badge>}
                        </div>
                        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {article.excerpt || ''}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.reading_time || 1} دقيقة
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {article.views_count || 0}
                          </span>
                          {article.blocks && article.blocks.filter((b) => b.type === 'code').length > 0 && (
                            <span className="flex items-center gap-1">
                              <Code className="w-3 h-3" /> {article.blocks.filter((b) => b.type === 'code').length} كود
                            </span>
                          )}
                        </div>
                        {article.tags?.length > 0 && (
                          <div className="flex gap-1.5 mt-3">
                            {article.tags.slice(0, 4).map((t, j) => (
                              <span key={j} className="px-2 py-0.5 text-[9px] rounded-md bg-primary/5 text-primary">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}