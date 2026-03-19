import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Eye, Calendar, Tag, Code, BookOpen, FileText, Copy, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';

function RenderCodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(block.content || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] font-mono bg-white/5 text-white/60 border-0">{block.language}</Badge>
          {block.title && <span className="text-xs text-white/40">{block.title}</span>}
        </div>
        <button onClick={copy} className="text-white/40 hover:text-white">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button>
      </div>
      <pre className="p-4 bg-[#0d1117] overflow-x-auto text-sm leading-relaxed" dir="ltr"><code className="text-[#e6edf3] font-mono">{block.content}</code></pre>
    </div>
  );
}

function RenderVideoBlock({ block }) {
  const getYtId = (url) => { const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m ? m[1] : null; };
  const ytId = getYtId(block.content);
  if (!ytId && !block.content) return null;
  return (
    <div className="my-6">
      {block.title && <p className="text-sm font-medium mb-2 flex items-center gap-2"><Play className="w-4 h-4 text-red-500" /> {block.title}</p>}
      {ytId ? (
        <div className="rounded-xl overflow-hidden aspect-video border border-border/50">
          <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen title={block.title || 'فيديو'} />
        </div>
      ) : (
        <a href={block.content} target="_blank" className="block p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-sm text-red-600 hover:bg-red-500/10">
          <Play className="w-5 h-5 inline ml-2" /> مشاهدة الفيديو
        </a>
      )}
    </div>
  );
}

export default function ArticleDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [slug]);
  const load = async () => {
    try { const { data: res } = await publicAPI.getArticle(slug); setData(res.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen pt-24 max-w-4xl mx-auto px-4"><div className="h-72 bg-muted animate-pulse rounded-2xl mb-8" /></div>;
  if (!data?.article) return <div className="min-h-screen pt-24 flex flex-col items-center justify-center"><FileText className="w-16 h-16 text-muted-foreground/30 mb-4" /><p className="text-muted-foreground mb-4">المقالة غير موجودة</p><Link to="/blog"><Button variant="outline"><ChevronLeft className="w-4 h-4 ml-2" /> المقالات</Button></Link></div>;

  const article = data.article;
  const related = data.related || [];
  const isRTL = article.language !== 'en';

  return (
    <div className="min-h-screen pt-24 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1" dir="rtl"><ChevronLeft className="w-4 h-4" /> المقالات</Link>
        </motion.div>

        {article.cover_image && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="aspect-[2/1] rounded-2xl overflow-hidden border border-border/50"><img src={article.cover_image} alt="" className="w-full h-full object-cover" /></div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.category && <Badge variant="secondary">{article.category}</Badge>}
            {article.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600">مميز</Badge>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground" dir="rtl">
            <span className="flex items-center gap-1.5"><span className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold">{article.author?.name?.[0] || 'ع'}</span>{article.author?.name}</span>
            {article.published_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(article.published_at).toLocaleDateString('ar')}</span>}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.reading_time || 1} دقيقة</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views_count || 0}</span>
          </div>
        </motion.div>

        {/* البلوكات */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {(article.blocks || []).map((block, i) => (
            <div key={i}>
              {block.type === 'text' && <div className="text-foreground/90 leading-[2] text-base whitespace-pre-line my-4">{block.content}</div>}
              {block.type === 'code' && <RenderCodeBlock block={block} />}
              {block.type === 'image' && block.content && (
                <figure className="my-6"><img src={block.content} alt={block.caption || ''} className="w-full rounded-xl border border-border/50" />{block.caption && <figcaption className="text-center text-xs text-muted-foreground mt-2">{block.caption}</figcaption>}</figure>
              )}
              {block.type === 'video' && <RenderVideoBlock block={block} />}
            </div>
          ))}
        </motion.div>

        {/* المصادر */}
        {article.sources?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" dir="rtl"><BookOpen className="w-5 h-5 text-primary" /> المصادر</h2>
            <Card className="p-5 border-border/50"><ol className="space-y-2 list-decimal list-inside">{article.sources.map((s, i) => <li key={i} className="text-sm">{s.url ? <a href={s.url} target="_blank" className="text-primary hover:underline">{s.title}</a> : s.title}</li>)}</ol></Card>
          </motion.div>
        )}

        {article.tags?.length > 0 && <div className="flex flex-wrap gap-2 mt-8" dir="rtl">{article.tags.map((t, i) => <Badge key={i} variant="secondary">#{t}</Badge>)}</div>}

        {related.length > 0 && (
          <div className="mt-12" dir="rtl"><h2 className="text-xl font-bold mb-4">مقالات ذات صلة</h2>
            <div className="grid sm:grid-cols-3 gap-4">{related.map(r => <Link key={r.id} to={`/blog/${r.slug}`}><Card className="overflow-hidden card-hover border-border/50"><div className="h-32 bg-muted">{r.cover_image ? <img src={r.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-bg opacity-10" />}</div><div className="p-3"><h3 className="font-bold text-xs line-clamp-2">{r.title}</h3></div></Card></Link>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}