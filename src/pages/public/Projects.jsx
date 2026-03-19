import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, ExternalLink, Github, Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { publicAPI } from '@/api/services';
import FavoriteButton from '@/components/ui/favorite-button';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await publicAPI.getProjects();
      setProjects(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    const title = p.title?.ar || p.title?.en || '';
    const matchSearch = title.includes(search) || (p.tags || []).some(t => t.includes(search));
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <FolderOpen className="w-3 h-3 ml-1" />
            أعمالي
          </Badge>
          <h1 className="text-4xl font-bold mb-3">
            المشاريع <span className="gradient-text">والأعمال</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            مجموعة من المشاريع التي قمت بتطويرها باستخدام أحدث التقنيات
          </p>
        </motion.div>

        {/* البحث والفلاتر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مشروع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-11 bg-card border-border"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'in_progress'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={`rounded-lg text-xs ${filter === f ? 'gradient-bg text-white' : ''}`}
              >
                {f === 'all' ? 'الكل' : f === 'completed' ? 'مكتمل' : 'قيد التطوير'}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* قائمة المشاريع */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد مشاريع حالياً</p>
            <p className="text-xs text-muted-foreground/60 mt-1">سيتم إضافة المشاريع قريباً من لوحة التحكم</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/projects/${project.slug}`}>
                  <Card className="overflow-hidden card-hover group border-border/50 bg-card/80">
                    <div className="absolute bottom-3 left-3">
                      <FavoriteButton item={project} type="project" />
                    </div>
                    {/* الصورة */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {project.media?.thumbnail ? (
                        <img src={project.media.thumbnail} alt={project.title?.ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full gradient-bg opacity-20 flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className={`text-[10px] ${project.status === 'completed' ? 'bg-green-500/90' : 'bg-yellow-500/90'} text-white border-0`}>
                          {project.status === 'completed' ? 'مكتمل' : 'قيد التطوير'}
                        </Badge>
                      </div>
                    </div>

                    {/* المحتوى */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {project.title?.ar || project.title?.en}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.short_description || project.description?.ar}
                      </p>

                      {/* التقنيات */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(project.tech_stack || []).slice(0, 4).map((tech, j) => (
                          <span key={j} className="px-2 py-0.5 text-[10px] rounded-md bg-primary/5 text-primary border border-primary/10 font-medium">
                            {tech.name || tech}
                          </span>
                        ))}
                      </div>

                      {/* الإحصائيات */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {project.views_count || 0}
                        </span>
                        <div className="flex gap-2">
                          {project.links?.github && <Github className="w-3.5 h-3.5" />}
                          {project.links?.live_demo && <ExternalLink className="w-3.5 h-3.5" />}
                        </div>
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
  );
}