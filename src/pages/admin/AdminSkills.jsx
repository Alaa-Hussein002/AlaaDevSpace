import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Sparkles, Loader2, Eye, EyeOff,
  Star, Layers, ChevronUp, ChevronDown, Palette, Hash,
  Zap, Code2, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

/* ============================================ */
/*  شريط الإتقان المرئي                        */
/* ============================================ */
function ProficiencyBar({ value, color, compact = false }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-muted/80 overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      {!compact && (
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-left shrink-0">
          {value}%
        </span>
      )}
    </div>
  );
}

/* ============================================ */
/*  بطاقة فئة المهارات                         */
/* ============================================ */
function SkillCategoryCard({ skill, index, onEdit, onDelete, onToggle }) {
  const techCount = (skill.technologies || []).length;
  const featuredCount = (skill.technologies || []).filter(t => t.is_featured).length;
  const avgProficiency = techCount > 0
    ? Math.round((skill.technologies || []).reduce((sum, t) => sum + (t.proficiency || 0), 0) / techCount)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      layout
    >
      <Card className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        !skill.is_published ? 'opacity-60' : ''
      }`}>
        {/* الخط العلوي الملون */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${skill.color}66, ${skill.color}, ${skill.color}66)` }}
        />

        {/* الشريط العلوي */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
              style={{ backgroundColor: `${skill.color}15`, border: `1px solid ${skill.color}25` }}
            >
              {skill.icon || '💻'}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {skill.category?.ar || skill.category?.en}
              </h3>
              {skill.category?.en && skill.category?.ar && (
                <p className="text-[10px] text-muted-foreground mt-0.5" dir="ltr">
                  {skill.category.en}
                </p>
              )}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => onToggle(skill)}
              title={skill.is_published ? 'إخفاء' : 'إظهار'}
            >
              {skill.is_published ? (
                <Eye className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => onEdit(skill)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={() => onDelete(skill.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* الإحصائيات المصغرة */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Layers className="w-3 h-3" />
            <span>{techCount} تقنية</span>
          </div>
          {featuredCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-500">
              <Star className="w-3 h-3" />
              <span>{featuredCount} مميزة</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Zap className="w-3 h-3" />
            <span>متوسط {avgProficiency}%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-auto">
            <Hash className="w-3 h-3" />
            <span>{skill.sort_order || 0}</span>
          </div>
        </div>

        {/* التقنيات */}
        <div className="px-4 pb-4">
          {techCount === 0 ? (
            <p className="text-xs text-muted-foreground/50 text-center py-3 border border-dashed border-border/50 rounded-lg">
              لا توجد تقنيات — اضغط تعديل لإضافتها
            </p>
          ) : (
            <div className="space-y-2.5">
              {(skill.technologies || []).slice(0, 6).map((tech, j) => (
                <div key={j} className="group/tech">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {tech.is_featured && (
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      )}
                      <span className="text-xs font-medium">{tech.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {tech.years_of_experience ? `${tech.years_of_experience} سنة` : ''}
                    </span>
                  </div>
                  <ProficiencyBar value={tech.proficiency || 0} color={skill.color || '#3b82f6'} />
                </div>
              ))}
              {techCount > 6 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{techCount - 6} تقنيات أخرى
                </p>
              )}
            </div>
          )}
        </div>

        {/* شارة الحالة */}
        {!skill.is_published && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-[9px] bg-muted">
              <EyeOff className="w-2.5 h-2.5 ml-1" /> مخفي
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/* ============================================ */
/*  Dialog: إضافة/تعديل تقنية                  */
/* ============================================ */
function TechItem({ tech, index, color, onUpdate, onRemove, onToggleFeatured }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/30 group"
    >
      {/* ترتيب */}
      <span className="w-5 h-5 rounded-md bg-background flex items-center justify-center text-[9px] font-mono text-muted-foreground shrink-0">
        {index + 1}
      </span>

      {/* الاسم */}
      <span className="text-sm font-medium flex-1 truncate">{tech.name}</span>

      {/* مميزة */}
      <button
        onClick={() => onToggleFeatured(index)}
        className={`shrink-0 transition-colors ${
          tech.is_featured ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-400'
        }`}
        title="مميزة"
      >
        <Star className={`w-3.5 h-3.5 ${tech.is_featured ? 'fill-amber-400' : ''}`} />
      </button>

      {/* الإتقان */}
      <div className="w-20 shrink-0">
        <ProficiencyBar value={tech.proficiency} color={color} compact />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0">
        {tech.proficiency}%
      </span>

      {/* السنوات */}
      <Badge variant="outline" className="text-[9px] shrink-0 h-5">
        {tech.years_of_experience || 0}y
      </Badge>

      {/* حذف */}
      <button
        onClick={() => onRemove(index)}
        className="text-red-500/50 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/* ============================================ */
/*  الصفحة الرئيسية: إدارة المهارات             */
/* ============================================ */
export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: { ar: '', en: '' },
    icon: '💻',
    color: '#3b82f6',
    sort_order: 0,
    is_published: true,
    technologies: [],
  });
  const [newTech, setNewTech] = useState({
    name: '',
    proficiency: 80,
    years_of_experience: 1,
    is_featured: false,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getSkills();
      setSkills(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ═══ CRUD ═══ */
  const openNew = () => {
    setEditingId(null);
    setForm({
      category: { ar: '', en: '' },
      icon: '💻',
      color: '#3b82f6',
      sort_order: skills.length,
      is_published: true,
      technologies: [],
    });
    setNewTech({ name: '', proficiency: 80, years_of_experience: 1, is_featured: false });
    setDialogOpen(true);
  };

  const openEdit = (skill) => {
    setEditingId(skill.id);
    setForm({
      category: skill.category || { ar: '', en: '' },
      icon: skill.icon || '💻',
      color: skill.color || '#3b82f6',
      sort_order: skill.sort_order || 0,
      is_published: skill.is_published !== false,
      technologies: skill.technologies || [],
    });
    setNewTech({ name: '', proficiency: 80, years_of_experience: 1, is_featured: false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.category.ar && !form.category.en) {
      return toast.error('اسم الفئة مطلوب');
    }
    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateSkill(editingId, form);
        toast.success('تم تحديث الفئة بنجاح');
      } else {
        await adminAPI.createSkill(form);
        toast.success('تم إنشاء الفئة بنجاح');
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذه الفئة وجميع تقنياتها؟')) return;
    try {
      await adminAPI.deleteSkill(id);
      toast.success('تم الحذف');
      load();
    } catch (e) {
      toast.error('فشل الحذف');
    }
  };

  const handleTogglePublish = async (skill) => {
  try {
    await adminAPI.updateSkill(skill.id, {
      category: skill.category,
      icon: skill.icon,
      color: skill.color,
      sort_order: skill.sort_order,
      is_published: !skill.is_published,
      technologies: skill.technologies || [],
    });
    toast.success(skill.is_published ? 'تم إخفاء الفئة' : 'تم إظهار الفئة');
      load();
    } catch (e) {
      toast.error('فشل التحديث');
    }
  };

  /* ═══ التقنيات داخل الفورم ═══ */
  const addTech = () => {
    if (!newTech.name.trim()) return toast.error('اسم التقنية مطلوب');
    if (form.technologies.some(t => t.name.toLowerCase() === newTech.name.trim().toLowerCase())) {
      return toast.error('التقنية موجودة بالفعل');
    }
    setForm({
      ...form,
      technologies: [...form.technologies, { ...newTech, name: newTech.name.trim() }],
    });
    setNewTech({ name: '', proficiency: 80, years_of_experience: 1, is_featured: false });
  };

  const removeTech = (index) => {
    setForm({
      ...form,
      technologies: form.technologies.filter((_, i) => i !== index),
    });
  };

  const toggleFeatured = (index) => {
    const techs = [...form.technologies];
    techs[index] = { ...techs[index], is_featured: !techs[index].is_featured };
    setForm({ ...form, technologies: techs });
  };

  /* ═══ إحصائيات ═══ */
  const totalTechs = skills.reduce((sum, s) => sum + (s.technologies?.length || 0), 0);
  const publishedCount = skills.filter(s => s.is_published).length;

  /* ═══ Emojis للاختيار ═══ */
  const emojiOptions = ['💻', '🌐', '📱', '🗄️', '🧠', '🔧', '🎨', '☁️', '🛡️', '⚡', '📊', '🔌', '🎮', '📦', '🤖', '🔬'];

  /* ═══ ألوان سريعة ═══ */
  const quickColors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#6366f1',
  ];

  return (
    <div className="space-y-6 pb-10" dir="rtl">

      {/* ═══ الشريط العلوي ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            إدارة المهارات
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-muted-foreground">
              {skills.length} فئة
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">
              {totalTechs} تقنية
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">
              {publishedCount} منشور
            </span>
          </div>
        </div>
        <Button
          onClick={openNew}
          className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة فئة جديدة
        </Button>
      </div>

      {/* ═══ قائمة الفئات ═══ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-16 text-center border-border/50 border-dashed">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-bold mb-2">لا توجد مهارات بعد</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              أضف فئات المهارات مثل "Frontend" و "Backend" ثم أضف التقنيات لكل فئة
            </p>
            <Button
              onClick={openNew}
              className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 ml-2" />
              أضف أول فئة
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill, i) => (
            <SkillCategoryCard
              key={skill.id}
              skill={skill}
              index={i}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {/* ═══ Dialog: إضافة/تعديل ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          dir="rtl"
        >
          {/* رأس الدايلوج مع لون الفئة */}
          <div
            className="sticky top-0 z-10 border-b backdrop-blur-xl bg-background/95 px-6 py-4"
            style={{ borderColor: `${form.color}30` }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <span className="text-2xl">{form.icon}</span>
                {editingId ? 'تعديل فئة المهارات' : 'فئة مهارات جديدة'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                أضف فئة مثل "Frontend" ثم أضف التقنيات التي تتقنها فيها
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-6">

            {/* ═══ معلومات الفئة ═══ */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                معلومات الفئة
              </h3>

              {/* الاسم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">اسم الفئة (عربي) *</Label>
                  <Input
                    value={form.category.ar}
                    onChange={(e) => setForm({
                      ...form,
                      category: { ...form.category, ar: e.target.value },
                    })}
                    className="h-10 bg-muted/50 text-sm"
                    placeholder="تطوير الواجهات الأمامية"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">اسم الفئة (إنجليزي)</Label>
                  <Input
                    value={form.category.en}
                    onChange={(e) => setForm({
                      ...form,
                      category: { ...form.category, en: e.target.value },
                    })}
                    className="h-10 bg-muted/50 text-sm"
                    dir="ltr"
                    placeholder="Frontend Development"
                  />
                </div>
              </div>

              {/* الأيقونة */}
              <div className="space-y-1.5">
                <Label className="text-xs">الأيقونة</Label>
                <div className="flex flex-wrap gap-1.5">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        form.icon === emoji
                          ? 'bg-primary/15 border-2 border-primary scale-110 shadow-sm'
                          : 'bg-muted/50 border border-border/30 hover:border-primary/30 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* اللون */}
              <div className="space-y-1.5">
                <Label className="text-xs">لون الفئة</Label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {quickColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-lg transition-all ${
                          form.color === c
                            ? 'scale-125 ring-2 ring-offset-2 ring-offset-background'
                            : 'hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: c,
                          ringColor: c,
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative">
                    <Input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-lg cursor-pointer bg-transparent border-border"
                    />
                  </div>
                </div>
              </div>

              {/* ترتيب + نشر */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Label className="text-xs shrink-0">الترتيب</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="h-9 bg-muted/50 text-sm w-20"
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_published}
                    onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                  />
                  <Label className="text-xs cursor-pointer">
                    {form.is_published ? 'منشور' : 'مخفي'}
                  </Label>
                </div>
              </div>
            </div>

            {/* ═══ التقنيات ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  التقنيات
                  <Badge variant="secondary" className="text-[9px] mr-1">
                    {form.technologies.length}
                  </Badge>
                </h3>
              </div>

              {/* قائمة التقنيات */}
              <AnimatePresence>
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {form.technologies.map((tech, i) => (
                    <TechItem
                      key={`${tech.name}-${i}`}
                      tech={tech}
                      index={i}
                      color={form.color}
                      onRemove={removeTech}
                      onToggleFeatured={toggleFeatured}
                    />
                  ))}
                </div>
              </AnimatePresence>

              {form.technologies.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-6 border border-dashed border-border/40 rounded-xl">
                  لم تُضف تقنيات بعد — أضف تقنياتك أدناه
                </p>
              )}

              {/* إضافة تقنية جديدة */}
              <div className="p-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 space-y-3">
                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <Plus className="w-3 h-3" />
                  إضافة تقنية
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Input
                      value={newTech.name}
                      onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                      className="h-9 bg-background text-sm"
                      dir="ltr"
                      placeholder="React.js, Laravel..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Input
                        type="number"
                        value={newTech.proficiency}
                        onChange={(e) => setNewTech({
                          ...newTech,
                          proficiency: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                        })}
                        className="h-9 bg-background text-xs text-center"
                        placeholder="%"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="w-16">
                      <Input
                        type="number"
                        value={newTech.years_of_experience}
                        onChange={(e) => setNewTech({
                          ...newTech,
                          years_of_experience: Math.max(0, parseInt(e.target.value) || 0),
                        })}
                        className="h-9 bg-background text-xs text-center"
                        placeholder="سنة"
                        min="0"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTech}
                      className="h-9 rounded-lg px-3 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* معاينة شريط الإتقان */}
                {newTech.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{newTech.name}</span>
                    <div className="flex-1">
                      <ProficiencyBar
                        value={newTech.proficiency}
                        color={form.color}
                        compact
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {newTech.proficiency}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ المعاينة الحية ═══ */}
            <div className="border-t border-border/50 pt-5 space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                معاينة
              </h3>
              <div className="p-4 rounded-xl bg-[#0a0a0b] border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{form.icon}</span>
                  <span className="text-sm font-bold text-white">
                    {form.category.ar || form.category.en || 'اسم الفئة'}
                  </span>
                </div>
                <div className="space-y-2">
                  {form.technologies.slice(0, 4).map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[11px] text-white/70 w-20 truncate">
                        {t.name}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${t.proficiency}%`,
                            background: `linear-gradient(90deg, ${form.color}88, ${form.color})`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-white/40 w-7">
                        {t.proficiency}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ أزرار الحفظ ═══ */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/15 min-w-[100px]"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingId ? 'حفظ التغييرات' : 'إنشاء الفئة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}