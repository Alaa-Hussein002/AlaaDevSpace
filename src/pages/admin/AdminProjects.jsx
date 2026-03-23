import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, FolderOpen, Eye, EyeOff, Loader2,
  Star, ExternalLink, Github, Code2, Layers, Link2,
  Hash, Zap, Check, Search, Filter, ArrowUpDown,
  Globe, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

/* ============================================ */
/*  ثوابت                                      */
/* ============================================ */
const STATUS_CONFIG = {
  completed:   { label: 'مكتمل',       color: '#10b981', icon: '✓', bg: 'bg-green-500/10 text-green-600 border-green-500/20' },
  in_progress: { label: 'قيد التطوير', color: '#f59e0b', icon: '⚡', bg: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  planned:     { label: 'مخطط',        color: '#3b82f6', icon: '📋', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
};

const emptyForm = {
  title: { ar: '', en: '' },
  slug: '',
  description: { ar: '', en: '' },
  short_description: '',
  category: '',
  status: 'completed',
  is_featured: false,
  is_published: true,
  sort_order: 0,
  tech_stack: [],
  features: [],
  tags: [],
  links: { live_demo: '', github: '' },
  media: { thumbnail: null, gallery: [] },
};

const techColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

/* ============================================ */
/*  بطاقة مشروع                                 */
/* ============================================ */
function ProjectCard({ project, index, onEdit, onDelete, onToggle }) {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.completed;
  const techCount = (project.tech_stack || []).length;
  const featureCount = (project.features || []).length;
  const hasLinks = project.links?.live_demo || project.links?.github;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      layout
    >
      <Card className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        project.is_published === false ? 'opacity-50' : ''
      }`}>
        {/* خط علوي بلون الحالة */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${status.color}66, ${status.color}, ${status.color}66)` }}
        />

        <div className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">

            {/* الصورة المصغرة */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-border/30 bg-muted/50">
              {project.media?.thumbnail ? (
                <img src={project.media.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20" />
                </div>
              )}
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              {/* الصف الأول: العنوان + الشارات */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                    {project.title?.ar || project.title?.en || 'بدون عنوان'}
                  </h3>
                  {project.slug && (
                    <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5" dir="ltr">
                      /{project.slug}
                    </p>
                  )}
                </div>

                {/* أزرار التحكم — Desktop */}
                <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onToggle(project)}
                    title={project.is_published === false ? 'إظهار' : 'إخفاء'}>
                    {project.is_published === false
                      ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      : <Eye className="w-3.5 h-3.5 text-green-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(project)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10" onClick={() => onDelete(project.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* الوصف */}
              {project.short_description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {project.short_description}
                </p>
              )}

              {/* الشارات */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge className={`text-[9px] h-5 ${status.bg}`}>
                  {status.icon} {status.label}
                </Badge>
                {project.is_featured && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] h-5 gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-500" /> مميز
                  </Badge>
                )}
                {project.category && (
                  <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                    <Layers className="w-2.5 h-2.5" /> {project.category}
                  </Badge>
                )}
                {project.is_published === false && (
                  <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                    <EyeOff className="w-2.5 h-2.5" /> مخفي
                  </Badge>
                )}
              </div>

              {/* التقنيات */}
              {techCount > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(project.tech_stack || []).slice(0, 5).map((t, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 text-[9px] rounded-md font-medium"
                      style={{
                        backgroundColor: `${techColors[j % techColors.length]}08`,
                        color: techColors[j % techColors.length],
                        border: `1px solid ${techColors[j % techColors.length]}15`,
                      }}
                    >
                      {t.name || t}
                    </span>
                  ))}
                  {techCount > 5 && (
                    <span className="px-2 py-0.5 text-[9px] rounded-md bg-muted text-muted-foreground">
                      +{techCount - 5}
                    </span>
                  )}
                </div>
              )}

              {/* الإحصائيات */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {project.views_count || 0}
                </span>
                {featureCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {featureCount} ميزة
                  </span>
                )}
                {hasLinks && (
                  <span className="flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> روابط
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {project.sort_order || 0}
                </span>
              </div>
            </div>
          </div>

          {/* أزرار التحكم — Mobile */}
          <div className="flex sm:hidden items-center justify-end gap-1 mt-3 pt-3 border-t border-border/30">
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={() => onToggle(project)}>
              {project.is_published === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {project.is_published === false ? 'إظهار' : 'إخفاء'}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={() => onEdit(project)}>
              <Pencil className="w-3 h-3" /> تعديل
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1 text-red-500" onClick={() => onDelete(project.id)}>
              <Trash2 className="w-3 h-3" /> حذف
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================================ */
/*  الصفحة الرئيسية                             */
/* ============================================ */
export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [newTech, setNewTech] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getProjects();
      setProjects(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ═══ CRUD ═══ */
  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: projects.length, media: { thumbnail: null, gallery: [] } });
    setNewTech(''); setNewFeature(''); setNewTag('');
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || { ar: '', en: '' },
      slug: p.slug || '',
      description: p.description || { ar: '', en: '' },
      short_description: p.short_description || '',
      category: p.category || '',
      status: p.status || 'completed',
      is_featured: p.is_featured || false,
      is_published: p.is_published !== false,
      sort_order: p.sort_order || 0,
      tech_stack: p.tech_stack || [],
      features: p.features || [],
      tags: p.tags || [],
      links: p.links || { live_demo: '', github: '' },
      media: p.media || { thumbnail: null, gallery: [] },
    });
    setNewTech(''); setNewFeature(''); setNewTag('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.ar && !form.title.en) return toast.error('عنوان المشروع مطلوب');
    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateProject(editingId, form);
        toast.success('تم تحديث المشروع');
      } else {
        await adminAPI.createProject(form);
        toast.success('تم إنشاء المشروع');
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا المشروع؟')) return;
    try { await adminAPI.deleteProject(id); toast.success('تم الحذف'); load(); }
    catch (e) { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (project) => {
    try {
      const newVal = project.is_published === false ? true : false;
      await adminAPI.updateProject(project.id, {
        title: project.title, slug: project.slug,
        description: project.description, short_description: project.short_description,
        category: project.category, status: project.status,
        is_featured: project.is_featured, sort_order: project.sort_order,
        tech_stack: project.tech_stack, features: project.features,
        tags: project.tags, links: project.links, media: project.media,
        is_published: !project.is_published,
      });
      toast.success(newVal ? 'تم إظهار المشروع' : 'تم إخفاء المشروع');
      load();
    } catch (e) { toast.error('فشل التحديث'); }
  };

  /* ═══ إدارة القوائم في الفورم ═══ */
  const addTech = () => {
    if (!newTech.trim()) return;
    if (form.tech_stack.some(t => (t.name || t).toLowerCase() === newTech.trim().toLowerCase())) return toast.error('موجودة');
    setForm({ ...form, tech_stack: [...form.tech_stack, { name: newTech.trim() }] });
    setNewTech('');
  };
  const removeTech = (i) => setForm({ ...form, tech_stack: form.tech_stack.filter((_, j) => j !== i) });

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm({ ...form, features: [...form.features, newFeature.trim()] });
    setNewFeature('');
  };
  const removeFeature = (i) => setForm({ ...form, features: form.features.filter((_, j) => j !== i) });

  const addTag = () => {
    if (!newTag.trim()) return;
    if (form.tags.includes(newTag.trim())) return toast.error('موجود');
    setForm({ ...form, tags: [...form.tags, newTag.trim()] });
    setNewTag('');
  };
  const removeTag = (i) => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) });

  /* ═══ الفلترة ═══ */
  const filtered = projects.filter((p) => {
    const title = (p.title?.ar || p.title?.en || '').toLowerCase();
    const matchSearch = !search || title.includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ═══ إحصائيات ═══ */
  const publishedCount = projects.filter(p => p.is_published !== false).length;
  const featuredCount = projects.filter(p => p.is_featured).length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6 pb-10" dir="rtl">

      {/* ═══ الشريط العلوي ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            إدارة المشاريع
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-muted-foreground">{projects.length} مشروع</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-green-500">{publishedCount} منشور</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">{completedCount} مكتمل</span>
            {featuredCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-amber-500">{featuredCount} مميز</span>
              </>
            )}
          </div>
        </div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" /> إضافة مشروع
        </Button>
      </div>

      {/* ═══ البحث والفلاتر ═══ */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-10 bg-card/60 border-border/50 rounded-xl text-sm"
            />
          </div>
          <div className="flex gap-1.5">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'completed', label: 'مكتمل' },
              { key: 'in_progress', label: 'قيد التطوير' },
              { key: 'planned', label: 'مخطط' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === f.key
                    ? 'gradient-bg text-white shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ القائمة ═══ */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-16 text-center border-dashed border-border/50">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <FolderOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-bold mb-2">لا توجد مشاريع بعد</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              أضف مشاريعك لعرضها في صفحة المشاريع بالموقع
            </p>
            <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 ml-2" /> أضف أول مشروع
            </Button>
          </Card>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* ═══ Dialog ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
          {/* رأس ثابت */}
          <div className="sticky top-0 z-10 border-b backdrop-blur-xl bg-background/95 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <FolderOpen className="w-5 h-5 text-primary" />
                {editingId ? 'تعديل المشروع' : 'مشروع جديد'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                أضف تفاصيل مشروعك — سيظهر في صفحة المشاريع
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-6">

            {/* ═══ صورة المشروع ═══ */}
            <div className="pt-2">
              <Label className="text-xs font-bold mb-2 block flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                صورة المشروع الرئيسية
              </Label>
              <ImageUpload
                value={form.media?.thumbnail}
                onChange={(url) => setForm({ ...form, media: { ...form.media, thumbnail: url } })}
                folder="projects"
                label=""
              />
            </div>

            {/* ═══ العنوان ═══ */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                معلومات المشروع
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">العنوان (عربي) *</Label>
                  <Input value={form.title.ar} onChange={(e) => setForm({ ...form, title: { ...form.title, ar: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm" placeholder="نظام إدارة المركز" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">العنوان (إنجليزي)</Label>
                  <Input value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="Center Management System" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug (رابط)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="يُنشأ تلقائياً" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">التصنيف</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-10 bg-muted/50 text-sm" placeholder="healthcare, education..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">وصف مختصر</Label>
                <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="h-10 bg-muted/50 text-sm" placeholder="جملة واحدة تصف المشروع" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">الوصف الكامل (عربي)</Label>
                <Textarea value={form.description.ar} onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })}
                  className="min-h-[100px] bg-muted/50 resize-none text-sm" placeholder="وصف تفصيلي عن المشروع..." />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">الوصف (إنجليزي)</Label>
                <Textarea value={form.description.en || ''} onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })}
                  className="min-h-[60px] bg-muted/50 resize-none text-sm" dir="ltr" placeholder="Detailed description..." />
              </div>
            </div>

            {/* ═══ التقنيات ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                التقنيات المستخدمة
                <Badge variant="secondary" className="text-[9px]">{form.tech_stack.length}</Badge>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {form.tech_stack.map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5 text-xs px-3 py-1.5 rounded-lg group/tag"
                    style={{ backgroundColor: `${techColors[i % techColors.length]}08`, color: techColors[i % techColors.length], borderColor: `${techColors[i % techColors.length]}20` }}>
                    {t.name || t}
                    <button onClick={() => removeTech(i)} className="hover:text-red-500 transition-colors opacity-50 group-hover/tag:opacity-100">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
                {form.tech_stack.length === 0 && <p className="text-[10px] text-muted-foreground">لم تُضف تقنيات بعد</p>}
              </div>
              <div className="flex gap-2">
                <Input value={newTech} onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="h-9 bg-muted/50 text-xs" dir="ltr" placeholder="React, Laravel, MongoDB..." />
                <Button type="button" variant="outline" size="sm" onClick={addTech} className="h-9 text-xs shrink-0 rounded-lg">
                  <Plus className="w-3 h-3 ml-1" /> أضف
                </Button>
              </div>
            </div>

            {/* ═══ المميزات ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                مميزات المشروع
                <Badge variant="secondary" className="text-[9px]">{form.features.length}</Badge>
              </h3>
              <AnimatePresence>
                <div className="space-y-1.5">
                  {form.features.map((f, i) => (
                    <motion.div key={`${f}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/30 group">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs flex-1">{f}</span>
                      <button onClick={() => removeFeature(i)} className="text-red-500/50 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
              <div className="flex gap-2">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="h-9 bg-muted/50 text-xs" placeholder="ميزة جديدة..." />
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="h-9 text-xs shrink-0 rounded-lg">
                  <Plus className="w-3 h-3 ml-1" /> أضف
                </Button>
              </div>
            </div>

            {/* ═══ الروابط ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                روابط المشروع
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> العرض الحي</Label>
                  <Input value={form.links.live_demo} onChange={(e) => setForm({ ...form, links: { ...form.links, live_demo: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5"><Github className="w-3 h-3" /> GitHub</Label>
                  <Input value={form.links.github} onChange={(e) => setForm({ ...form, links: { ...form.links, github: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="https://github.com/..." />
                </div>
              </div>
            </div>

            {/* ═══ العلامات ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                الكلمات المفتاحية
                <Badge variant="secondary" className="text-[9px]">{form.tags.length}</Badge>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs px-2.5 py-1 rounded-lg group/tag">
                    #{tag}
                    <button onClick={() => removeTag(i)} className="hover:text-red-500 transition-colors opacity-50 group-hover/tag:opacity-100">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="h-9 bg-muted/50 text-xs" dir="ltr" placeholder="web, healthcare, ai..." />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-9 text-xs shrink-0 rounded-lg">
                  <Plus className="w-3 h-3 ml-1" /> أضف
                </Button>
              </div>
            </div>

            {/* ═══ الإعدادات ═══ */}
            <div className="space-y-4 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                الإعدادات
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">الحالة</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm">
                    <option value="completed">✓ مكتمل</option>
                    <option value="in_progress">⚡ قيد التطوير</option>
                    <option value="planned">📋 مخطط</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">الترتيب</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-muted/50 text-sm" min="0" />
                </div>
                <div className="space-y-3 pt-4 sm:pt-0 sm:mt-5">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                    <Label className="text-xs cursor-pointer">{form.is_featured ? '⭐ مميز' : 'مميز'}</Label>
                  </div>
                </div>
              </div>

              {/* النشر */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <div>
                  <Label className="text-xs font-medium cursor-pointer">
                    {form.is_published ? '✅ منشور — يظهر في الموقع' : '🔒 مخفي — لا يظهر في الموقع'}
                  </Label>
                  <p className="text-[10px] text-muted-foreground">تحكم في إظهار أو إخفاء هذا المشروع</p>
                </div>
              </div>
            </div>

            {/* ═══ أزرار الحفظ ═══ */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}
                className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/15 min-w-[130px]">
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingId ? 'حفظ التغييرات' : 'إنشاء المشروع'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}