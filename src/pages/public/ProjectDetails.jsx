import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Github, Eye, Calendar, Tag, FolderOpen, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';

export default function ProjectDetails() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProject(); }, [slug]);

  const loadProject = async () => {
    try {
      const { data } = await publicAPI.getProject(slug);
      setProject(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto" dir="rtl">
        <div className="h-80 bg-muted animate-pulse rounded-2xl mb-8" />
        <div className="h-8 bg-muted animate-pulse rounded-lg w-1/3 mb-4" />
        <div className="h-4 bg-muted animate-pulse rounded-lg w-2/3" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center" dir="rtl">
        <FolderOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-4">المشروع غير موجود</p>
        <Link to="/projects"><Button variant="outline" className="rounded-xl"><ChevronLeft className="w-4 h-4 ml-2" /> العودة للمشاريع</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">

        {/* التنقل */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/projects" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> العودة للمشاريع
          </Link>
        </motion.div>

        {/* الصورة الرئيسية */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden bg-muted border border-border/50">
            {project.media?.thumbnail ? (
              <img src={project.media.thumbnail} alt={project.title?.ar} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-bg opacity-20 flex items-center justify-center">
                <FolderOpen className="w-20 h-20 text-primary/30" />
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* المحتوى */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`text-xs ${project.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                  {project.status === 'completed' ? 'مكتمل' : 'قيد التطوير'}
                </Badge>
                {project.is_featured && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">مميز</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-2">{project.title?.ar || project.title?.en}</h1>
              <p className="text-muted-foreground">{project.short_description}</p>
            </div>

            {/* الوصف */}
            <div>
              <h2 className="text-lg font-bold mb-3">عن المشروع</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description?.ar || project.description?.en || 'لا يوجد وصف'}
              </p>
            </div>

            {/* المميزات */}
            {project.features?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">المميزات</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {project.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="text-primary mt-0.5">✓</span>
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* معرض الصور */}
            {project.media?.gallery?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">لقطات الشاشة</h2>
                <div className="grid grid-cols-2 gap-3">
                  {project.media.gallery.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border/50">
                      <img src={img} alt="" className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* الشريط الجانبي */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            {/* الروابط */}
            <Card className="p-5 border-border/50 space-y-3">
              <h3 className="font-bold text-sm">روابط المشروع</h3>
              {project.links?.live_demo && (
                <a href={project.links.live_demo} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
                    <ExternalLink className="w-4 h-4 ml-2" /> عرض حي
                  </Button>
                </a>
              )}
              {project.links?.github && (
                <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full rounded-xl">
                    <Github className="w-4 h-4 ml-2" /> كود المصدر
                  </Button>
                </a>
              )}
            </Card>

            {/* التقنيات */}
            <Card className="p-5 border-border/50">
              <h3 className="font-bold text-sm mb-3">التقنيات</h3>
              <div className="flex flex-wrap gap-2">
                {(project.tech_stack || []).map((t, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{t.name || t}</Badge>
                ))}
              </div>
            </Card>

            {/* معلومات */}
            <Card className="p-5 border-border/50 space-y-3">
              <h3 className="font-bold text-sm">معلومات</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">التصنيف</span><span className="font-medium">{project.category || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">المشاهدات</span><span className="font-medium flex items-center gap-1"><Eye className="w-3 h-3" />{project.views_count || 0}</span></div>
                {project.client && <div className="flex justify-between"><span className="text-muted-foreground">العميل</span><span className="font-medium">{project.client}</span></div>}
              </div>
            </Card>

            {/* العلامات */}
            {project.tags?.length > 0 && (
              <Card className="p-5 border-border/50">
                <h3 className="font-bold text-sm mb-3">الكلمات المفتاحية</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-[10px] rounded-md bg-muted text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}