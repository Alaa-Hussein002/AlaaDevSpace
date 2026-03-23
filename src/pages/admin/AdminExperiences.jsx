import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Briefcase, Loader2, Eye, EyeOff,
  MapPin, Calendar, Award, Code2, ChevronDown, Building2,
  Clock, Star, ArrowUpDown, Zap
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
const TYPE_CONFIG = {
  full_time:  { label: 'دوام كامل', color: '#3b82f6', icon: Building2 },
  part_time:  { label: 'دوام جزئي', color: '#8b5cf6', icon: Clock },
  freelance:  { label: 'عمل حر',   color: '#10b981', icon: Zap },
  internship: { label: 'تدريب',    color: '#f59e0b', icon: Award },
  contract:   { label: 'عقد',      color: '#ec4899', icon: Briefcase },
};

const emptyForm = {
  company: { ar: '', en: '' },
  position: { ar: '', en: '' },
  description: { ar: '', en: '' },
  company_logo: null,
  location: '',
  type: 'full_time',
  start_date: '',
  end_date: '',
  is_current: false,
  achievements: [],
  technologies_used: [],
  sort_order: 0,
  is_published: true,
};

/* ============================================ */
/*  حساب المدة                                  */
/* ============================================ */
function calcDuration(start, end, isCurrent) {
  if (!start) return '';
  const s = new Date(start);
  const e = isCurrent ? new Date() : (end ? new Date(end) : new Date());
  let months = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth();
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years > 0 && rem > 0) return `${years} سنة و ${rem} شهر`;
  if (years > 0) return `${years} سنة`;
  if (rem > 0) return `${rem} شهر`;
  return 'أقل من شهر';
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ar', { year: 'numeric', month: 'short' });
}

/* ============================================ */
/*  بطاقة خبرة واحدة                           */
/* ============================================ */
function ExperienceCard({ item, index, onEdit, onDelete, onToggle }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.full_time;
  const TypeIcon = config.icon;
  const duration = calcDuration(item.start_date, item.end_date, item.is_current);
  const achCount = (item.achievements || []).length;
  const techCount = (item.technologies_used || []).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      layout
    >
      <Card className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        !item.is_published ? 'opacity-50' : ''
      }`}>
        {/* خط جانبي ملون */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[3px]"
          style={{ background: `linear-gradient(to bottom, ${config.color}, ${config.color}44)` }}
        />

        <div className="p-4 sm:p-5 pr-5 sm:pr-6">

          {/* الصف العلوي: الشعار + المعلومات + الأزرار */}
          <div className="flex items-start gap-3 sm:gap-4">

            {/* شعار الشركة */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border"
              style={{ borderColor: `${config.color}25`, backgroundColor: `${config.color}08` }}
            >
              {item.company_logo ? (
                <img src={item.company_logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TypeIcon className="w-6 h-6" style={{ color: `${config.color}60` }} />
                </div>
              )}
            </div>

            {/* المعلومات */}
            <div className="flex-1 min-w-0">
              {/* المسمى الوظيفي */}
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                {item.position?.ar || item.position?.en || 'بدون مسمى'}
              </h3>

              {/* الشركة */}
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {item.company?.ar || item.company?.en}
              </p>

              {/* الشارات */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {/* نوع العمل */}
                <Badge
                  variant="outline"
                  className="text-[9px] sm:text-[10px] h-5 gap-1"
                  style={{ borderColor: `${config.color}30`, color: config.color }}
                >
                  <TypeIcon className="w-2.5 h-2.5" />
                  {config.label}
                </Badge>

                {/* الموقع */}
                {item.location && (
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-5 gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {item.location}
                  </Badge>
                )}

                {/* حالي */}
                {item.is_current && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] h-5 gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    يعمل حالياً
                  </Badge>
                )}
              </div>

              {/* التاريخ والمدة */}
              <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>
                  {formatDate(item.start_date)} — {item.is_current ? 'الآن' : formatDate(item.end_date)}
                </span>
                {duration && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="font-medium" style={{ color: config.color }}>{duration}</span>
                  </>
                )}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col sm:flex-row items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => onToggle(item)}
                title={item.is_published ? 'إخفاء' : 'إظهار'}
              >
                {item.is_published ? (
                  <Eye className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => onEdit(item)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* الإنجازات والتقنيات */}
          {(achCount > 0 || techCount > 0) && (
            <div className="mt-3 pt-3 border-t border-border/30">
              {/* الإنجازات */}
              {achCount > 0 && (
                <div className="space-y-1 mb-2">
                  {(item.achievements || []).slice(0, 3).map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Award className="w-3 h-3 mt-0.5 shrink-0" style={{ color: config.color }} />
                      <span className="line-clamp-1">{a}</span>
                    </div>
                  ))}
                  {achCount > 3 && (
                    <p className="text-[10px] text-muted-foreground/50 pr-5">
                      +{achCount - 3} إنجازات أخرى
                    </p>
                  )}
                </div>
              )}

              {/* التقنيات */}
              {techCount > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(item.technologies_used || []).slice(0, 6).map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[9px] rounded-md font-medium"
                      style={{
                        backgroundColor: `${config.color}08`,
                        color: config.color,
                        border: `1px solid ${config.color}15`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                  {techCount > 6 && (
                    <span className="px-2 py-0.5 text-[9px] rounded-md bg-muted text-muted-foreground">
                      +{techCount - 6}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* شارة مخفي */}
        {!item.is_published && (
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
/*  الصفحة الرئيسية: إدارة الخبرات              */
/* ============================================ */
export default function AdminExperiences() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [newAch, setNewAch] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getExperiences();
      setItems(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ═══ CRUD ═══ */
  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: items.length });
    setNewAch('');
    setNewTech('');
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      company: item.company || { ar: '', en: '' },
      position: item.position || { ar: '', en: '' },
      description: item.description || { ar: '', en: '' },
      company_logo: item.company_logo || null,
      location: item.location || '',
      type: item.type || 'full_time',
      start_date: item.start_date?.split('T')[0] || '',
      end_date: item.end_date?.split('T')[0] || '',
      is_current: item.is_current || false,
      achievements: item.achievements || [],
      technologies_used: item.technologies_used || [],
      sort_order: item.sort_order || 0,
      is_published: item.is_published !== false,
    });
    setNewAch('');
    setNewTech('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.ar && !form.company.en) return toast.error('اسم الشركة مطلوب');
    if (!form.position.ar && !form.position.en) return toast.error('المسمى الوظيفي مطلوب');
    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateExperience(editingId, form);
        toast.success('تم تحديث الخبرة بنجاح');
      } else {
        await adminAPI.createExperience(form);
        toast.success('تم إنشاء الخبرة بنجاح');
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
    if (!confirm('هل تريد حذف هذه الخبرة؟')) return;
    try {
      await adminAPI.deleteExperience(id);
      toast.success('تم الحذف');
      load();
    } catch (e) { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (item) => {
  try {
    await adminAPI.updateExperience(item.id, {
      company: item.company,
      position: item.position,
      description: item.description,
      company_logo: item.company_logo,
      location: item.location,
      type: item.type,
      start_date: item.start_date,
      end_date: item.end_date,
      is_current: item.is_current,
      achievements: item.achievements || [],
      technologies_used: item.technologies_used || [],
      sort_order: item.sort_order,
      is_published: !item.is_published,
    });
    toast.success(item.is_published ? 'تم إخفاء الخبرة' : 'تم إظهار الخبرة');
      load();
    } catch (e) { toast.error('فشل التحديث'); }
  };

  /* ═══ الإنجازات ═══ */
  const addAchievement = () => {
    if (!newAch.trim()) return;
    setForm({ ...form, achievements: [...form.achievements, newAch.trim()] });
    setNewAch('');
  };

  const removeAchievement = (i) => {
    setForm({ ...form, achievements: form.achievements.filter((_, j) => j !== i) });
  };

  /* ═══ التقنيات ═══ */
  const addTechUsed = () => {
    if (!newTech.trim()) return;
    if (form.technologies_used.includes(newTech.trim())) return toast.error('موجودة بالفعل');
    setForm({ ...form, technologies_used: [...form.technologies_used, newTech.trim()] });
    setNewTech('');
  };

  const removeTechUsed = (i) => {
    setForm({ ...form, technologies_used: form.technologies_used.filter((_, j) => j !== i) });
  };

  /* ═══ إحصائيات ═══ */
  const publishedCount = items.filter(i => i.is_published).length;
  const currentCount = items.filter(i => i.is_current).length;

  return (
    <div className="space-y-6 pb-10" dir="rtl">

      {/* ═══ الشريط العلوي ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            الخبرات العملية
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-muted-foreground">{items.length} خبرة</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">{publishedCount} منشور</span>
            {currentCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-green-500">{currentCount} حالي</span>
              </>
            )}
          </div>
        </div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" /> إضافة خبرة
        </Button>
      </div>

      {/* ═══ القائمة ═══ */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-16 text-center border-border/50 border-dashed">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Briefcase className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-bold mb-2">لا توجد خبرات بعد</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              أضف خبراتك العملية لتظهر في الصفحة الرئيسية بتصميم Timeline احترافي
            </p>
            <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 ml-2" /> أضف أول خبرة
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <ExperienceCard
              key={item.id}
              item={item}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
          {/* رأس ثابت */}
          <div className="sticky top-0 z-10 border-b backdrop-blur-xl bg-background/95 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <Briefcase className="w-5 h-5 text-primary" />
                {editingId ? 'تعديل الخبرة' : 'خبرة عملية جديدة'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                أضف تفاصيل الخبرة العملية — ستظهر في الصفحة الرئيسية
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-6">

            {/* ═══ شعار الشركة ═══ */}
            <div className="pt-2">
              <Label className="text-xs font-bold mb-2 block">شعار الشركة</Label>
              <div className="max-w-[120px]">
                <ImageUpload
                  value={form.company_logo}
                  onChange={(url) => setForm({ ...form, company_logo: url })}
                  folder="experiences"
                  label=""
                />
              </div>
            </div>

            {/* ═══ الشركة والمسمى ═══ */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                بيانات الوظيفة
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">الشركة (عربي) *</Label>
                  <Input
                    value={form.company.ar}
                    onChange={(e) => setForm({ ...form, company: { ...form.company, ar: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm"
                    placeholder="اسم الشركة"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">الشركة (إنجليزي)</Label>
                  <Input
                    value={form.company.en}
                    onChange={(e) => setForm({ ...form, company: { ...form.company, en: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm"
                    dir="ltr"
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">المسمى الوظيفي (عربي) *</Label>
                  <Input
                    value={form.position.ar}
                    onChange={(e) => setForm({ ...form, position: { ...form.position, ar: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm"
                    placeholder="مطور Full-Stack"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">المسمى الوظيفي (إنجليزي)</Label>
                  <Input
                    value={form.position.en}
                    onChange={(e) => setForm({ ...form, position: { ...form.position, en: e.target.value } })}
                    className="h-10 bg-muted/50 text-sm"
                    dir="ltr"
                    placeholder="Full-Stack Developer"
                  />
                </div>
              </div>
            </div>

            {/* ═══ الموقع والنوع ═══ */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                التفاصيل
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">الموقع</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="h-10 bg-muted/50 text-sm"
                    placeholder="صنعاء، اليمن"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">نوع العمل</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm"
                  >
                    {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">الترتيب</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="h-10 bg-muted/50 text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* ═══ التواريخ ═══ */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                الفترة الزمنية
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs">تاريخ البدء</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="h-10 bg-muted/50 text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">تاريخ الانتهاء</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="h-10 bg-muted/50 text-sm"
                    dir="ltr"
                    disabled={form.is_current}
                  />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <Switch
                    checked={form.is_current}
                    onCheckedChange={(v) => setForm({ ...form, is_current: v, end_date: v ? '' : form.end_date })}
                  />
                  <Label className="text-xs cursor-pointer">
                    {form.is_current ? '🟢 أعمل حالياً' : 'أعمل حالياً'}
                  </Label>
                </div>
              </div>
              {form.start_date && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  المدة: <span className="font-medium text-primary">{calcDuration(form.start_date, form.end_date, form.is_current)}</span>
                </p>
              )}
            </div>

            {/* ═══ النشر ═══ */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm({ ...form, is_published: v })}
              />
              <div>
                <Label className="text-xs font-medium cursor-pointer">
                  {form.is_published ? '✅ منشور — يظهر في الموقع' : '🔒 مخفي — لا يظهر في الموقع'}
                </Label>
                <p className="text-[10px] text-muted-foreground">تحكم في إظهار أو إخفاء هذه الخبرة</p>
              </div>
            </div>

            {/* ═══ الوصف ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold">الوصف</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">الوصف (عربي)</Label>
                <Textarea
                  value={form.description.ar}
                  onChange={(e) => setForm({ ...form, description: { ...form.description, ar: e.target.value } })}
                  className="min-h-[80px] bg-muted/50 resize-none text-sm"
                  placeholder="وصف مختصر عن دورك ومسؤولياتك..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الوصف (إنجليزي)</Label>
                <Textarea
                  value={form.description.en}
                  onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })}
                  className="min-h-[60px] bg-muted/50 resize-none text-sm"
                  dir="ltr"
                  placeholder="Brief description of your role..."
                />
              </div>
            </div>

            {/* ═══ الإنجازات ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                الإنجازات
                <Badge variant="secondary" className="text-[9px]">{form.achievements.length}</Badge>
              </h3>

              <AnimatePresence>
                <div className="space-y-1.5">
                  {(form.achievements || []).map((a, i) => (
                    <motion.div
                      key={`${a}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/30 group"
                    >
                      <Award className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-xs flex-1">{a}</span>
                      <button
                        onClick={() => removeAchievement(i)}
                        className="text-red-500/50 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>

              <div className="flex gap-2">
                <Input
                  value={newAch}
                  onChange={(e) => setNewAch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  className="h-9 bg-muted/50 text-xs"
                  placeholder="مثال: بناء نظام إدارة متكامل..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAchievement}
                  className="h-9 text-xs shrink-0 rounded-lg"
                >
                  <Plus className="w-3 h-3 ml-1" /> أضف
                </Button>
              </div>
            </div>

            {/* ═══ التقنيات المستخدمة ═══ */}
            <div className="space-y-3 border-t border-border/50 pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                التقنيات المستخدمة
                <Badge variant="secondary" className="text-[9px]">{form.technologies_used.length}</Badge>
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {(form.technologies_used || []).map((t, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1.5 text-xs px-3 py-1.5 rounded-lg group/tag"
                  >
                    {t}
                    <button
                      onClick={() => removeTechUsed(i)}
                      className="hover:text-red-500 transition-colors opacity-50 group-hover/tag:opacity-100"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
                {form.technologies_used.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">لم تُضف تقنيات بعد</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechUsed())}
                  className="h-9 bg-muted/50 text-xs"
                  dir="ltr"
                  placeholder="React, Laravel, MongoDB..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTechUsed}
                  className="h-9 text-xs shrink-0 rounded-lg"
                >
                  <Plus className="w-3 h-3 ml-1" /> أضف
                </Button>
              </div>
            </div>

            {/* ═══ أزرار الحفظ ═══ */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/15 min-w-[120px]"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingId ? 'حفظ التغييرات' : 'إنشاء الخبرة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}