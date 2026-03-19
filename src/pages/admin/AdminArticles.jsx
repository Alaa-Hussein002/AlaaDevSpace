import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, FileText, Eye, Clock, Code, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getArticles(); setArticles(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف المقالة؟')) return;
    try { await adminAPI.deleteArticle(id); toast.success('تم الحذف'); load(); }
    catch (e) { toast.error('فشل الحذف'); }
  };

  const statusLabel = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' };
  const statusColor = { draft: 'bg-yellow-500/10 text-yellow-600', published: 'bg-green-500/10 text-green-600', archived: 'bg-gray-500/10 text-gray-600' };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">المقالات</h1>
          <p className="text-sm text-muted-foreground">{articles.length} مقالة</p>
        </div>
        <Button onClick={() => navigate('/admin/articles/new')} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 ml-2" /> كتابة مقالة
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : articles.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-1">لا توجد مقالات</p>
          <p className="text-xs text-muted-foreground/60 mb-4">ابدأ بكتابة أول مقالة تقنية</p>
          <Button onClick={() => navigate('/admin/articles/new')} variant="outline" className="rounded-xl">
            <Plus className="w-4 h-4 ml-2" /> اكتب أول مقالة
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                    {a.cover_image ? <img src={a.cover_image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><FileText className="w-6 h-6 text-primary/40" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm truncate">{a.title?.ar || a.title?.en}</h3>
                      <Badge className={`text-[9px] border-0 ${statusColor[a.status]}`}>{statusLabel[a.status]}</Badge>
                      {a.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 text-[9px] border-0">مميز</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{a.excerpt?.ar || ''}</p>
                    <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {a.views_count || 0}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.reading_time || 1} دقيقة</span>
                      {a.code_blocks?.length > 0 && <span className="flex items-center gap-1"><Code className="w-3 h-3" /> {a.code_blocks.length}</span>}
                      {a.media?.videos?.length > 0 && <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {a.media.videos.length}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/articles/${a.id}/edit`)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}