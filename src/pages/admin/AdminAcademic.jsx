import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, GraduationCap, Award, Loader2,
  Calendar, Eye, EyeOff, ExternalLink, MapPin, Clock,
  BookOpen, Medal, Hash, ChevronDown, Link2, Image as ImageIcon
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
const EDUCATION_EMPTY = {
  degree: { ar: '', en: '' },
  institution: { ar: '', en: '' },
  institution_logo: null,
  description: { ar: '' },
  start_date: '',
  end_date: '',
  is_current: false,
  sort_order: 0,
  is_published: true,
};

const CERTIFICATE_EMPTY = {
  title: '',
  issuer: '',
  issuer_logo: null,
  certificate_image: null,
  credential_id: '',
  credential_url: '',
  issue_date: '',
  expiry_date: '',
  has_expiry: false,
  skills_gained: [],
  sort_order: 0,
  is_published: true,
};

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar', { year: 'numeric', month: 'short' });
}

function calcDuration(start, end, isCurrent) {
  if (!start) return '';
  const s = new Date(start);
  const e = isCurrent ? new Date() : (end ? new Date(end) : new Date());
  let m = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth();
  if (m < 0) m = 0;
  const y = Math.floor(m / 12), r = m % 12;
  if (y > 0 && r > 0) return `${y} سنة و ${r} شهر`;
  if (y > 0) return `${y} سنة`;
  return r > 0 ? `${r} شهر` : 'أقل من شهر';
}

/* ============================================ */
/*  بطاقة تعليم                                 */
/* ============================================ */
function EducationCard({ item, index, onEdit, onDelete, onToggle }) {
  const duration = calcDuration(item.start_date, item.end_date, item.is_current);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      layout
    >
      <Card className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        item.is_published === false ? 'opacity-50' : ''
      }`}>
        {/* خط علوي */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-l from-blue-500/60 via-blue-500 to-blue-500/60" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* الشعار */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-blue-500/20 bg-blue-500/5">
              {item.institution_logo ? (
                <img src={item.institution_logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-500/40" />
                </div>
              )}
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                {item.degree?.ar || item.degree?.en || 'بدون مؤهل'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {item.institution?.ar || item.institution?.en}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(item.start_date)} — {item.is_current ? 'الآن' : formatDate(item.end_date)}
                </span>
                {duration && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[10px] font-medium text-blue-500">{duration}</span>
                  </>
                )}
                {item.is_current && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] h-5 gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    حالياً
                  </Badge>
                )}
              </div>
            </div>

            {/* أزرار */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onToggle(item)} title={item.is_published === false ? 'إظهار' : 'إخفاء'}>
                {item.is_published === false ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(item)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10" onClick={() => onDelete(item.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {item.is_published === false && (
          <Badge variant="secondary" className="absolute top-3 left-3 text-[9px]">
            <EyeOff className="w-2.5 h-2.5 ml-1" /> مخفي
          </Badge>
        )}
      </Card>
    </motion.div>
  );
}

/* ============================================ */
/*  بطاقة شهادة                                 */
/* ============================================ */
function CertificateCard({ item, index, onEdit, onDelete, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      layout
    >
      <Card className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 ${
        item.is_published === false ? 'opacity-50' : ''
      }`}>
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-l from-amber-500/60 via-amber-500 to-amber-500/60" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* الشعار */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-amber-500/20 bg-amber-500/5">
              {item.issuer_logo ? (
                <img src={item.issuer_logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-500/40" />
                </div>
              )}
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                {item.title || 'بدون عنوان'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {item.issuer}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {item.issue_date && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.issue_date)}
                  </span>
                )}
                {item.credential_id && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {item.credential_id}
                  </span>
                )}
                {item.has_expiry && item.expiry_date && (
                  <Badge variant="outline" className="text-[9px] h-5 border-amber-500/30 text-amber-600">
                    ينتهي: {formatDate(item.expiry_date)}
                  </Badge>
                )}
              </div>

              {/* المهارات */}
              {(item.skills_gained || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.skills_gained.slice(0, 4).map((s, j) => (
                    <span key={j} className="px-2 py-0.5 text-[9px] rounded-md bg-amber-500/8 text-amber-600 border border-amber-500/15 font-medium">
                      {s}
                    </span>
                  ))}
                  {item.skills_gained.length > 4 && (
                    <span className="px-2 py-0.5 text-[9px] rounded-md bg-muted text-muted-foreground">
                      +{item.skills_gained.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* أزرار */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onToggle(item)}>
                {item.is_published === false ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
              </Button>
              {item.credential_url && (
                <a href={item.credential_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  </Button>
                </a>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(item)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10" onClick={() => onDelete(item.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* صورة الشهادة المصغرة */}
        {item.certificate_image && (
          <div className="mx-4 sm:mx-5 mb-4 rounded-lg overflow-hidden border border-border/30 h-32 sm:h-40">
            <img src={item.certificate_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {item.is_published === false && (
          <Badge variant="secondary" className="absolute top-3 left-3 text-[9px]">
            <EyeOff className="w-2.5 h-2.5 ml-1" /> مخفي
          </Badge>
        )}
      </Card>
    </motion.div>
  );
}

/* ============================================ */
/*  الصفحة الرئيسية المدمجة                     */
/* ============================================ */
export default function AdminAcademic() {
  const [activeTab, setActiveTab] = useState('education');
  const [educations, setEducations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loadingEdu, setLoadingEdu] = useState(true);
  const [loadingCert, setLoadingCert] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('education');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [eduForm, setEduForm] = useState({ ...EDUCATION_EMPTY });
  const [certForm, setCertForm] = useState({ ...CERTIFICATE_EMPTY });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => { loadEducations(); loadCertificates(); }, []);

  const loadEducations = async () => {
    try { const { data } = await adminAPI.getEducations(); setEducations(data.data || []); }
    catch (e) { console.error(e); } finally { setLoadingEdu(false); }
  };

  const loadCertificates = async () => {
    try { const { data } = await adminAPI.getCertificates(); setCertificates(data.data || []); }
    catch (e) { console.error(e); } finally { setLoadingCert(false); }
  };

  /* ═══ Education CRUD ═══ */
  const openNewEdu = () => {
    setDialogType('education'); setEditingId(null);
    setEduForm({ ...EDUCATION_EMPTY, sort_order: educations.length });
    setDialogOpen(true);
  };

  const openEditEdu = (item) => {
    setDialogType('education'); setEditingId(item.id);
    setEduForm({
      degree: item.degree || { ar: '', en: '' },
      institution: item.institution || { ar: '', en: '' },
      institution_logo: item.institution_logo || null,
      description: item.description || { ar: '' },
      start_date: item.start_date?.split('T')[0] || '',
      end_date: item.end_date?.split('T')[0] || '',
      is_current: item.is_current || false,
      sort_order: item.sort_order || 0,
      is_published: item.is_published !== false,
    });
    setDialogOpen(true);
  };

  const saveEdu = async () => {
    if (!eduForm.degree.ar && !eduForm.degree.en) return toast.error('الدرجة العلمية مطلوبة');
    if (!eduForm.institution.ar && !eduForm.institution.en) return toast.error('اسم المؤسسة مطلوب');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateEducation(editingId, eduForm); toast.success('تم تحديث المؤهل'); }
      else { await adminAPI.createEducation(eduForm); toast.success('تم إنشاء المؤهل'); }
      setDialogOpen(false); loadEducations();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const deleteEdu = async (id) => {
    if (!confirm('حذف هذا المؤهل؟')) return;
    try { await adminAPI.deleteEducation(id); toast.success('تم الحذف'); loadEducations(); }
    catch (e) { toast.error('فشل'); }
  };

  const toggleEdu = async (item) => {
    try {
      const newVal = item.is_published === false ? true : false;
      await adminAPI.updateEducation(item.id, {
        degree: item.degree, institution: item.institution,
        institution_logo: item.institution_logo, description: item.description,
        start_date: item.start_date, end_date: item.end_date,
        is_current: item.is_current, sort_order: item.sort_order,
        is_published: newVal,
      });
      toast.success(newVal ? 'تم إظهار المؤهل' : 'تم إخفاء المؤهل');
      loadEducations();
    } catch (e) { toast.error('فشل التحديث'); }
  };

  /* ═══ Certificate CRUD ═══ */
  const openNewCert = () => {
    setDialogType('certificate'); setEditingId(null);
    setCertForm({ ...CERTIFICATE_EMPTY, sort_order: certificates.length });
    setNewSkill('');
    setDialogOpen(true);
  };

  const openEditCert = (item) => {
    setDialogType('certificate'); setEditingId(item.id);
    setCertForm({
      title: item.title || '', issuer: item.issuer || '',
      issuer_logo: item.issuer_logo || null, certificate_image: item.certificate_image || null,
      credential_id: item.credential_id || '', credential_url: item.credential_url || '',
      issue_date: item.issue_date?.split('T')[0] || '',
      expiry_date: item.expiry_date?.split('T')[0] || '',
      has_expiry: item.has_expiry || false,
      skills_gained: item.skills_gained || [],
      sort_order: item.sort_order || 0,
      is_published: item.is_published !== false,
    });
    setNewSkill('');
    setDialogOpen(true);
  };

  const saveCert = async () => {
    if (!certForm.title) return toast.error('عنوان الشهادة مطلوب');
    if (!certForm.issuer) return toast.error('الجهة المانحة مطلوبة');
    setSaving(true);
    try {
      if (editingId) { await adminAPI.updateCertificate(editingId, certForm); toast.success('تم تحديث الشهادة'); }
      else { await adminAPI.createCertificate(certForm); toast.success('تم إنشاء الشهادة'); }
      setDialogOpen(false); loadCertificates();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const deleteCert = async (id) => {
    if (!confirm('حذف هذه الشهادة؟')) return;
    try { await adminAPI.deleteCertificate(id); toast.success('تم الحذف'); loadCertificates(); }
    catch (e) { toast.error('فشل'); }
  };

  const toggleCert = async (item) => {
    try {
      const newVal = item.is_published === false ? true : false;
      await adminAPI.updateCertificate(item.id, {
        title: item.title, issuer: item.issuer,
        issuer_logo: item.issuer_logo, certificate_image: item.certificate_image,
        credential_id: item.credential_id, credential_url: item.credential_url,
        issue_date: item.issue_date, expiry_date: item.expiry_date,
        has_expiry: item.has_expiry, skills_gained: item.skills_gained,
        sort_order: item.sort_order, is_published: newVal,
      });
      toast.success(newVal ? 'تم إظهار الشهادة' : 'تم إخفاء الشهادة');
      loadCertificates();
    } catch (e) { toast.error('فشل التحديث'); }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (certForm.skills_gained.includes(newSkill.trim())) return toast.error('موجودة');
    setCertForm({ ...certForm, skills_gained: [...certForm.skills_gained, newSkill.trim()] });
    setNewSkill('');
  };

  /* ═══ إحصائيات ═══ */
  const eduPublished = educations.filter(e => e.is_published !== false).length;
  const certPublished = certificates.filter(c => c.is_published !== false).length;

  const tabs = [
    { id: 'education', label: 'التعليم', icon: GraduationCap, count: educations.length, color: '#3b82f6' },
    { id: 'certificates', label: 'الشهادات', icon: Award, count: certificates.length, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 pb-10" dir="rtl">

      {/* ═══ الشريط العلوي ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            المسيرة الأكاديمية
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-muted-foreground">{educations.length} مؤهل</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">{certificates.length} شهادة</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-green-500">{eduPublished + certPublished} منشور</span>
          </div>
        </div>
        <Button
          onClick={activeTab === 'education' ? openNewEdu : openNewCert}
          className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          {activeTab === 'education' ? 'إضافة مؤهل' : 'إضافة شهادة'}
        </Button>
      </div>

      {/* ═══ التبويبات ═══ */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive ? 'text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAcademicTab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${tab.color}dd, ${tab.color}88)` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="relative z-10 w-4 h-4" />
              <span className="relative z-10">{tab.label}</span>
              <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/20' : 'bg-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ المحتوى ═══ */}
      <AnimatePresence mode="wait">
        {activeTab === 'education' ? (
          <motion.div
            key="education"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {loadingEdu ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}</div>
            ) : educations.length === 0 ? (
              <Card className="p-16 text-center border-dashed border-border/50">
                <GraduationCap className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">لا توجد مؤهلات بعد</h3>
                <p className="text-sm text-muted-foreground mb-6">أضف مؤهلاتك التعليمية</p>
                <Button onClick={openNewEdu} className="gradient-bg text-white rounded-xl">
                  <Plus className="w-4 h-4 ml-2" /> أضف أول مؤهل
                </Button>
              </Card>
            ) : (
              educations.map((item, i) => (
                <EducationCard key={item.id} item={item} index={i} onEdit={openEditEdu} onDelete={deleteEdu} onToggle={toggleEdu} />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="certificates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {loadingCert ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}</div>
            ) : certificates.length === 0 ? (
              <Card className="p-16 text-center border-dashed border-border/50">
                <Award className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">لا توجد شهادات بعد</h3>
                <p className="text-sm text-muted-foreground mb-6">أضف شهاداتك المهنية</p>
                <Button onClick={openNewCert} className="gradient-bg text-white rounded-xl">
                  <Plus className="w-4 h-4 ml-2" /> أضف أول شهادة
                </Button>
              </Card>
            ) : (
              certificates.map((item, i) => (
                <CertificateCard key={item.id} item={item} index={i} onEdit={openEditCert} onDelete={deleteCert} onToggle={toggleCert} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Dialog ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
          <div className="sticky top-0 z-10 border-b backdrop-blur-xl bg-background/95 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                {dialogType === 'education'
                  ? <><GraduationCap className="w-5 h-5 text-blue-500" /> {editingId ? 'تعديل المؤهل' : 'مؤهل تعليمي جديد'}</>
                  : <><Award className="w-5 h-5 text-amber-500" /> {editingId ? 'تعديل الشهادة' : 'شهادة جديدة'}</>
                }
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-5 pt-2">
            {dialogType === 'education' ? (
              /* ════════ نموذج التعليم ════════ */
              <>
                <div className="max-w-[140px]">
                  <Label className="text-xs font-bold mb-2 block">شعار المؤسسة / صورة الشهادة</Label>
                  <ImageUpload value={eduForm.institution_logo} onChange={(url) => setEduForm({ ...eduForm, institution_logo: url })} folder="education" label="" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">الدرجة العلمية (عربي) *</Label>
                    <Input value={eduForm.degree.ar} onChange={(e) => setEduForm({ ...eduForm, degree: { ...eduForm.degree, ar: e.target.value } })} className="h-10 bg-muted/50 text-sm" placeholder="بكالوريوس نظم معلومات" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">الدرجة (إنجليزي)</Label>
                    <Input value={eduForm.degree.en || ''} onChange={(e) => setEduForm({ ...eduForm, degree: { ...eduForm.degree, en: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="BSc Information Systems" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">المؤسسة (عربي) *</Label>
                    <Input value={eduForm.institution.ar} onChange={(e) => setEduForm({ ...eduForm, institution: { ...eduForm.institution, ar: e.target.value } })} className="h-10 bg-muted/50 text-sm" placeholder="جامعة صنعاء" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">المؤسسة (إنجليزي)</Label>
                    <Input value={eduForm.institution.en || ''} onChange={(e) => setEduForm({ ...eduForm, institution: { ...eduForm.institution, en: e.target.value } })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="Sana'a University" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">من تاريخ</Label>
                    <Input type="date" value={eduForm.start_date} onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })} className="h-10 bg-muted/50 text-sm" dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">إلى تاريخ</Label>
                    <Input type="date" value={eduForm.end_date} onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })} className="h-10 bg-muted/50 text-sm" dir="ltr" disabled={eduForm.is_current} />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <Switch checked={eduForm.is_current} onCheckedChange={(v) => setEduForm({ ...eduForm, is_current: v, end_date: v ? '' : eduForm.end_date })} />
                    <Label className="text-xs">{eduForm.is_current ? '🟢 أدرس حالياً' : 'أدرس حالياً'}</Label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">وصف (اختياري)</Label>
                  <Textarea value={eduForm.description?.ar || ''} onChange={(e) => setEduForm({ ...eduForm, description: { ar: e.target.value } })} className="min-h-[60px] bg-muted/50 resize-none text-sm" placeholder="تفاصيل إضافية..." />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <Switch checked={eduForm.is_published} onCheckedChange={(v) => setEduForm({ ...eduForm, is_published: v })} />
                  <Label className="text-xs">{eduForm.is_published ? '✅ منشور' : '🔒 مخفي'}</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
                  <Button onClick={saveEdu} disabled={saving} className="gradient-bg text-white rounded-xl min-w-[120px]">
                    {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                    {editingId ? 'حفظ التغييرات' : 'إنشاء المؤهل'}
                  </Button>
                </div>
              </>
            ) : (
              /* ════════ نموذج الشهادة ════════ */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold mb-2 block">شعار الجهة</Label>
                    <ImageUpload value={certForm.issuer_logo} onChange={(url) => setCertForm({ ...certForm, issuer_logo: url })} folder="certificates" label="" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold mb-2 block">صورة الشهادة</Label>
                    <ImageUpload value={certForm.certificate_image} onChange={(url) => setCertForm({ ...certForm, certificate_image: url })} folder="certificates" label="" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">عنوان الشهادة *</Label>
                    <Input value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} className="h-10 bg-muted/50 text-sm" placeholder="AWS Cloud Practitioner" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">الجهة المانحة *</Label>
                    <Input value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} className="h-10 bg-muted/50 text-sm" placeholder="Amazon Web Services" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">معرف الاعتماد</Label>
                    <Input value={certForm.credential_id} onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="CERT-123456" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">رابط التحقق</Label>
                    <Input value={certForm.credential_url} onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })} className="h-10 bg-muted/50 text-sm" dir="ltr" placeholder="https://verify.cert..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">تاريخ الإصدار</Label>
                    <Input type="date" value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} className="h-10 bg-muted/50 text-sm" dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">تاريخ الانتهاء</Label>
                    <Input type="date" value={certForm.expiry_date} onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })} className="h-10 bg-muted/50 text-sm" dir="ltr" disabled={!certForm.has_expiry} />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <Switch checked={certForm.has_expiry} onCheckedChange={(v) => setCertForm({ ...certForm, has_expiry: v, expiry_date: v ? certForm.expiry_date : '' })} />
                    <Label className="text-xs">لها تاريخ انتهاء</Label>
                  </div>
                </div>

                {/* المهارات */}
                <div className="space-y-2 border-t border-border/50 pt-4">
                  <Label className="text-xs font-bold flex items-center gap-2">
                    <Medal className="w-3.5 h-3.5 text-amber-500" />
                    المهارات المكتسبة
                    <Badge variant="secondary" className="text-[9px]">{certForm.skills_gained.length}</Badge>
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {certForm.skills_gained.map((s, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 text-xs px-2.5 py-1 rounded-lg">
                        {s}
                        <button onClick={() => setCertForm({ ...certForm, skills_gained: certForm.skills_gained.filter((_, j) => j !== i) })} className="hover:text-red-500 transition-colors">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="h-9 bg-muted/50 text-xs" dir="ltr" placeholder="React, AWS, Docker..." />
                    <Button type="button" variant="outline" size="sm" onClick={addSkill} className="h-9 text-xs shrink-0 rounded-lg">
                      <Plus className="w-3 h-3 ml-1" /> أضف
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <Switch checked={certForm.is_published} onCheckedChange={(v) => setCertForm({ ...certForm, is_published: v })} />
                  <Label className="text-xs">{certForm.is_published ? '✅ منشور' : '🔒 مخفي'}</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
                  <Button onClick={saveCert} disabled={saving} className="gradient-bg text-white rounded-xl min-w-[120px]">
                    {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                    {editingId ? 'حفظ التغييرات' : 'إنشاء الشهادة'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}