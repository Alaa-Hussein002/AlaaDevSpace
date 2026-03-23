import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ExternalLink, Github, Eye, Calendar, Tag,
  FolderOpen, ChevronLeft, Layers, Code2, Star, Zap,
  Check, Monitor, Smartphone, Globe, Copy, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { publicAPI } from '@/api/services';

/* ============================================ */
/*  معرض الصور                                  */
/* ============================================ */
function ImageGallery({ images, thumbnail }) {
  const [activeImage, setActiveImage] = useState(thumbnail || (images && images[0]) || null);

  const allImages = [thumbnail, ...(images || [])].filter(Boolean);
  if (allImages.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* الصورة الرئيسية */}
      <motion.div
        key={activeImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="aspect-video rounded-2xl overflow-hidden bg-muted border border-border/40 shadow-xl"
      >
        <img src={activeImage} alt="" className="w-full h-full object-cover" />
      </motion.div>

      {/* المصغرات */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img
                  ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                  : 'border-border/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================ */
/*  الصفحة                                      */
/* ============================================ */
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

  const shareProject = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('تم نسخ الرابط!');
  };

  const techColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto" dir="rtl">
        <div className="mb-6"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></div>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="aspect-video bg-muted animate-pulse rounded-2xl" />
            <div className="h-8 bg-muted animate-pulse rounded w-2/3" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-muted animate-pulse rounded-2xl" />
            <div className="h-32 bg-muted animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center" dir="rtl">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <FolderOpen className="w-20 h-20 text-muted-foreground/20 mb-5" />
        </motion.div>
        <h2 className="text-lg font-bold mb-2">المشروع غير موجود</h2>
        <p className="text-sm text-muted-foreground mb-6">ربما تم حذفه أو تغيير الرابط</p>
        <Link to="/projects">
          <Button variant="outline" className="rounded-xl">
            <ChevronLeft className="w-4 h-4 ml-2" /> العودة للمشاريع
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* خلفية خفيفة */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">

          {/* ═══ التنقل ═══ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              العودة للمشاريع
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* ═══ المحتوى الرئيسي ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* معرض الصور */}
              <ImageGallery
                thumbnail={project.media?.thumbnail}
                images={project.media?.gallery}
              />

              {/* العنوان والشارات */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={`text-xs ${
                    project.status === 'completed'
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : project.status === 'in_progress'
                      ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  }`}>
                    {project.status === 'completed' ? '✓ مكتمل' : project.status === 'in_progress' ? '⚡ قيد التطوير' : '📋 مخطط'}
                  </Badge>
                  {project.is_featured && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500" /> مميز
                    </Badge>
                  )}
                  {project.category && (
                    <Badge variant="secondary" className="text-xs">
                      <Layers className="w-3 h-3 ml-1" /> {project.category}
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {project.title?.ar || project.title?.en}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {project.short_description}
                </p>
              </div>

              {/* الوصف */}
              {(project.description?.ar || project.description?.en) && (
                <Card className="p-5 sm:p-6 border-border/40 bg-card/60">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" />
                    عن المشروع
                  </h2>
                  <p className="text-muted-foreground text-sm leading-[1.8] whitespace-pre-line">
                    {project.description?.ar || project.description?.en}
                  </p>
                </Card>
              )}

              {/* المميزات */}
              {project.features?.length > 0 && (
                <Card className="p-5 sm:p-6 border-border/40 bg-card/60">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    المميزات
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {project.features.map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/20"
                      >
                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm">{f}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>

            {/* ═══ الشريط الجانبي ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* الروابط */}
              <Card className="p-5 border-border/40 bg-card/60 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  روابط المشروع
                </h3>
                {project.links?.live_demo && (
                  <a href={project.links.live_demo} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 h-11">
                      <Monitor className="w-4 h-4 ml-2" /> عرض حي
                      <ExternalLink className="w-3.5 h-3.5 mr-auto" />
                    </Button>
                  </a>
                )}
                {project.links?.github && (
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full rounded-xl h-11 mt-2">
                      <Github className="w-4 h-4 ml-2" /> كود المصدر
                      <ExternalLink className="w-3.5 h-3.5 mr-auto" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  className="w-full rounded-xl h-10 text-muted-foreground hover:text-foreground"
                  onClick={shareProject}
                >
                  <Share2 className="w-4 h-4 ml-2" /> مشاركة المشروع
                </Button>
              </Card>

              {/* التقنيات */}
              {(project.tech_stack || []).length > 0 && (
                <Card className="p-5 border-border/40 bg-card/60">
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                    <Code2 className="w-4 h-4 text-primary" />
                    التقنيات المستخدمة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border cursor-default"
                        style={{
                          backgroundColor: `${techColors[i % techColors.length]}08`,
                          borderColor: `${techColors[i % techColors.length]}20`,
                          color: techColors[i % techColors.length],
                        }}
                      >
                        {t.name || t}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* معلومات */}
              <Card className="p-5 border-border/40 bg-card/60">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-primary" />
                  معلومات
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'التصنيف', value: project.category, icon: Layers },
                    { label: 'المشاهدات', value: `${project.views_count || 0} مشاهدة`, icon: Eye },
                    { label: 'العميل', value: project.client, icon: Globe },
                  ].filter(item => item.value).map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {item.label}
                        </span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* العلامات */}
              {project.tags?.length > 0 && (
                <Card className="p-5 border-border/40 bg-card/60">
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-primary" />
                    الكلمات المفتاحية
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-muted/60 text-muted-foreground border border-border/20 hover:border-primary/20 hover:text-primary transition-colors cursor-default"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}