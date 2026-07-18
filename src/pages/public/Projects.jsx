import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  FolderOpen, ExternalLink, Github, Eye, Search, Filter,
  Code2, Layers, Star, ArrowLeft, Sparkles, Terminal,
  ChevronDown, X, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { publicAPI } from '@/api/services';
import FavoriteButton from '@/components/ui/favorite-button';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';

/* ============================================ */
/*  خلفية متحركة للمشاريع                      */
/* ============================================ */
function ProjectsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* دوائر متوهجة */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 12, repeat: Infinity, delay: 3 }}
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
      />

      {/* خطوط كود عائمة */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px"
          style={{
            top: `${20 + i * 20}%`,
            left: 0,
            right: 0,
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 0.06, 0], scaleX: [0, 1, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
            ease: 'easeInOut',
          }}
        >
          <div className="w-full h-full bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
        </motion.div>
      ))}

      {/* جسيمات */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1 h-1 rounded-full bg-primary/20"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
          transition={{ duration: 5 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
        />
      ))}
    </div>
  );
}

/* ============================================ */
/*  بطاقة مشروع — تصميم احترافي                */
/* ============================================ */
function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  const techColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/projects/${project.slug}`} className="block group">
        <motion.div
          animate={{ y: hovered ? -6 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className={`relative overflow-hidden border transition-all duration-500 ${
            hovered
              ? 'border-primary/30 bg-card/90 shadow-2xl shadow-primary/10'
              : 'border-border/40 bg-card/60 shadow-md'
          }`}>
            {/* التوهج الخلفي */}
            <motion.div
              animate={{ opacity: hovered ? 0.08 : 0 }}
              className="absolute -inset-4 rounded-3xl blur-3xl -z-10 bg-primary"
            />

            {/* الصورة */}
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              {project.media?.thumbnail ? (
                <>
                  <motion.img
                    src={project.media.thumbnail}
                    alt={project.title?.ar}
                    className="w-full h-full object-cover"
                    animate={{ scale: hovered ? 1.06 : 1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* overlay ملون عند hover */}
                  <motion.div
                    animate={{ opacity: hovered ? 0.15 : 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/50 to-purple-500/50"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-purple-500/5 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.1 : 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FolderOpen className="w-16 h-16 text-primary/15" />
                  </motion.div>
                </div>
              )}

              {/* الشارات فوق الصورة */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <Badge className={`text-[10px] backdrop-blur-md shadow-lg ${
                  project.status === 'completed'
                    ? 'bg-green-500/80 text-white border-0'
                    : project.status === 'in_progress'
                    ? 'bg-yellow-500/80 text-white border-0'
                    : 'bg-blue-500/80 text-white border-0'
                }`}>
                  {project.status === 'completed' ? '✓ مكتمل' : project.status === 'in_progress' ? '⚡ قيد التطوير' : '📋 مخطط'}
                </Badge>

                <div className="flex items-center gap-1.5">
                  {project.is_featured && (
                    <Badge className="bg-amber-500/80 text-white border-0 text-[10px] backdrop-blur-md shadow-lg gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-white" /> مميز
                    </Badge>
                  )}
                </div>
              </div>

              {/* أيقونات الروابط عند hover */}
              <motion.div
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-3 left-3 flex gap-2"
                onClick={(e) => e.preventDefault()}
              >
                {project.links?.github && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(project.links.github, "_blank", "noopener,noreferrer");
                    }}
                    className="w-9 h-9 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors"
                    title="كود المصدر"
                  >
                    <Github className="w-4 h-4 text-white" />
                  </button>
                )}
              
                {project.links?.live_demo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(project.links.live_demo, "_blank", "noopener,noreferrer");
                    }}
                    className="w-9 h-9 rounded-lg bg-primary/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-primary/80 transition-colors"
                    title="عرض حي"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </button>
                )}
              </motion.div>

              {/* زر المفضلة */}
              {/* <div className="absolute bottom-3 right-3">
                <FavoriteButton item={project} type="project" />
              </div> */}
            </div>

            {/* المحتوى */}
            <div className="p-5">
              <h3 className={`font-bold text-base mb-1.5 leading-tight transition-colors duration-300 line-clamp-1 ${
                hovered ? 'text-primary' : 'text-foreground'
              }`}>
                {project.title?.ar || project.title?.en}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {project.short_description || project.description?.ar}
              </p>

              {/* التقنيات */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(project.tech_stack || []).slice(0, 5).map((tech, j) => (
                  <motion.span
                    key={j}
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="px-2.5 py-1 text-[10px] rounded-lg font-medium border transition-colors"
                    style={{
                      backgroundColor: `${techColors[j % techColors.length]}08`,
                      borderColor: `${techColors[j % techColors.length]}20`,
                      color: techColors[j % techColors.length],
                    }}
                  >
                    {tech.name || tech}
                  </motion.span>
                ))}
                {(project.tech_stack || []).length > 5 && (
                  <span className="px-2 py-1 text-[10px] rounded-lg bg-muted text-muted-foreground">
                    +{project.tech_stack.length - 5}
                  </span>
                )}
              </div>

              {/* الإحصائيات + السهم */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {project.views_count || 0}
                  </span>
                  {project.category && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {project.category}
                      </span>
                    </>
                  )}
                </div>
              
                {/* روابط مباشرة */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
                  {project.links?.github && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(project.links.github, "_blank", "noopener,noreferrer");
                      }}
                      className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      title="GitHub"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </button>
                  )}
                
                  {project.links?.live_demo && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(project.links.live_demo, "_blank", "noopener,noreferrer");
                      }}
                      className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                      title="عرض حي"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                
                  <motion.div
                    animate={{ x: hovered ? -4 : 0 }}
                    className="text-primary mr-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* خط سفلي متحرك */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-l from-primary/60 via-primary to-purple-500/60"
              animate={{ scaleX: hovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformOrigin: 'right' }}
            />
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ============================================ */
/*  الصفحة الرئيسية — المشاريع                 */
/* ============================================ */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const { seoData, loading: seoLoading } = useSEO();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await publicAPI.getProjects();
      setProjects(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = projects.filter((p) => {
    const title = (p.title?.ar || p.title?.en || '').toLowerCase();
    const desc = (p.short_description || '').toLowerCase();
    const techs = (p.tech_stack || []).map(t => (t.name || t).toLowerCase()).join(' ');
    const s = search.toLowerCase();
    const matchSearch = !s || title.includes(s) || desc.includes(s) || techs.includes(s);
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const featuredCount = projects.filter(p => p.is_featured).length;

  const completedCount = projects.filter(p => p.status === 'completed').length;
  const inProgressCount = projects.filter(p => p.status === 'in_progress').length;
  const plannedCount = projects.filter(p => p.status === 'planned').length;
  
  const filters = [
    { key: 'all', label: 'الكل', count: projects.length },
    { key: 'completed', label: 'مكتمل', count: completedCount },
    { key: 'in_progress', label: 'قيد التطوير', count: inProgressCount },
    { key: 'planned', label: 'مخطط', count: plannedCount },
  ];

  return (
    <>
      {/* ✅ إضافة SEO */}
      {!seoLoading && seoData && (
        <SEO
          title={`المشاريع - ${seoData.title}`}
          description="استعرض مجموعة من المشاريع التي قمت بتطويرها باستخدام أحدث التقنيات والممارسات الهندسية"
          keywords={`مشاريع, ${seoData.keywords}, portfolio, projects`}
          ogImage={seoData.photo}
          ogType="website"
        />
      )}
    <div className="min-h-screen relative" dir="rtl">
      {/* الخلفية */}
      <ProjectsBackground />

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* ═══ العنوان ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/25"
            >
              <FolderOpen className="w-7 h-7 text-white" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              المشاريع <span className="gradient-text">والأعمال</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              مجموعة من المشاريع التي قمت بتطويرها باستخدام أحدث التقنيات والممارسات الهندسية
            </p>

            {/* إحصائيات سريعة */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mt-5"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderOpen className="w-4 h-4 text-primary" />
                <span>{projects.length} مشروع</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="w-4 h-4 text-green-500" />
                <span>{completedCount} مكتمل</span>
              </div>
              {featuredCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5 text-xs text-amber-500">
                    <Star className="w-4 h-4" />
                    <span>{featuredCount} مميز</span>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* ═══ البحث والفلاتر ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-10 space-y-4"
          >
            {/* البحث */}
            <div className="relative">
              <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                searchFocused ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <Input
                placeholder="ابحث بالاسم أو التقنية أو الوصف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`pr-11 h-12 bg-card/60 backdrop-blur-sm border rounded-xl text-sm transition-all duration-300 ${
                  searchFocused ? 'border-primary/40 shadow-lg shadow-primary/10' : 'border-border/50'
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* الفلاتر */}
            <div className="flex justify-center gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === f.key
                      ? 'text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground bg-card/40 border border-border/30 hover:border-border/50'
                  }`}
                >
                  {filter === f.key && (
                    <motion.div
                      layoutId="activeProjectFilter"
                      className="absolute inset-0 gradient-bg rounded-xl shadow-lg shadow-primary/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      filter === f.key ? 'bg-white/20' : 'bg-muted'
                    }`}>
                      {f.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ═══ المشاريع ═══ */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden"
                >
                  <div className="aspect-[16/9] bg-muted animate-pulse" />
                  <div className="p-5 bg-card/40 space-y-3">
                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted animate-pulse rounded w-16" />
                      <div className="h-6 bg-muted animate-pulse rounded w-16" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <FolderOpen className="w-20 h-20 text-muted-foreground/15 mx-auto mb-5" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2">لا توجد نتائج</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {search ? 'جرب تغيير كلمة البحث أو الفلتر' : 'سيتم إضافة المشاريع قريباً'}
              </p>
              {search && (
                <Button
                  variant="outline"
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" /> مسح البحث
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              {/* عدد النتائج */}
              {(search || filter !== 'all') && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground text-center mb-6"
                >
                  عرض {filtered.length} من {projects.length} مشروع
                </motion.p>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}