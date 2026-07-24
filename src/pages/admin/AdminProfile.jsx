import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Save, Plus, Trash2, Upload, FileText,
  User, Briefcase, Cpu, BarChart3, Phone, Share2, FileDown,
  Wrench, ChevronUp, ChevronDown, Code2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value);
  }
  return [];
};

// const ensureObject = (value) => {
//   if (value && typeof value === 'object' && !Array.isArray(value)) {
//     return value;
//   }
//   return {};
// };

const ensureObject = (value, defaults = {}) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...defaults, ...value };
  }
  return defaults;
};

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h2 className="font-bold text-base">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHighlight, setNewHighlight] = useState({ icon: null, label: '', value: '' });
  const [newRole, setNewRole] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newToolName, setNewToolName] = useState('');
  const [newToolIcon, setNewToolIcon] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const cvInputRef = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getProfile();
      const raw = data.data || {};
      
      setProfile({
        ...raw,
        // الكائنات
        full_name: ensureObject(raw.full_name),
        // title: ensureObject(raw.title),
        bio: ensureObject(raw.bio),
        // location: ensureObject(raw.location),
        contact: ensureObject(raw.contact),
        seo: ensureObject(raw.seo, {
          title: '',
          description: '',
          keywords: '',
          og_image: '',
          type: 'website',
          locale: 'ar_SA'
        }),
        // المصفوفات
        rotating_roles: ensureArray(raw.rotating_roles),
        tech_display: ensureArray(raw.tech_display),
        tools: ensureArray(raw.tools),
        highlights: ensureArray(raw.highlights),
        social_links: ensureArray(raw.social_links),
        code_block_lines: ensureArray(raw.code_block_lines),
        hero_greeting: raw.hero_greeting || '',
      });
      
    } catch (e) {
      console.error('خطأ في تحميل الملف الشخصي:', e);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateProfile(profile);
      toast.success('تم حفظ الملف الشخصي بنجاح');
    } catch (e) { toast.error('فشل الحفظ'); }
    finally { setSaving(false); }
  };

  // ═══ الأدوار ═══
  const addRole = () => {
    if (!newRole.trim()) return;
    setProfile({ ...profile, rotating_roles: [...(profile.rotating_roles || []), newRole.trim()] });
    setNewRole('');
  };
  const removeRole = (i) => setProfile({ ...profile, rotating_roles: (profile.rotating_roles || []).filter((_, j) => j !== i) });
  const moveRole = (i, dir) => {
    const roles = [...(profile.rotating_roles || [])];
    const newI = i + dir;
    if (newI < 0 || newI >= roles.length) return;
    [roles[i], roles[newI]] = [roles[newI], roles[i]];
    setProfile({ ...profile, rotating_roles: roles });
  };

  // ═══ التقنيات (شارات) ═══
  const addTechDisplay = () => {
    if (!newTech.trim()) return;
    setProfile({ ...profile, tech_display: [...(profile.tech_display || []), newTech.trim()] });
    setNewTech('');
  };
  const removeTechDisplay = (i) => setProfile({ ...profile, tech_display: (profile.tech_display || []).filter((_, j) => j !== i) });

  // ═══ الأدوات والتقنيات (مع أيقونات) ═══
  const addTool = () => {
    if (!newToolName.trim()) return;
    const tools = profile.tools || [];
    setProfile({ ...profile, tools: [...tools, { name: newToolName.trim(), icon: newToolIcon }] });
    setNewToolName('');
    setNewToolIcon(null);
  };
  const removeTool = (i) => setProfile({ ...profile, tools: (profile.tools || []).filter((_, j) => j !== i) });

  // ═══ الإنجازات ═══
  const addHighlight = () => {
    if (!newHighlight.label) return;
    setProfile({ ...profile, highlights: [...(profile.highlights || []), { ...newHighlight }] });
    setNewHighlight({ icon: null, label: '', value: '' });
  };
  const removeHighlight = (i) => setProfile({ ...profile, highlights: (profile.highlights || []).filter((_, j) => j !== i) });

  // ═══ وسائل التواصل ═══
  const addSocial = () => setProfile({ ...profile, social_links: [...(profile.social_links || []), { platform: '', url: '', icon: null }] });
  const updateSocial = (i, field, value) => {
    const links = [...(profile.social_links || [])];
    links[i] = { ...links[i], [field]: value };
    setProfile({ ...profile, social_links: links });
  };
  const removeSocial = (i) => setProfile({ ...profile, social_links: (profile.social_links || []).filter((_, j) => j !== i) });

  // ═══ رفع CV ═══
  const handleCvUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error('الحد الأقصى 10 ميجا');
    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'cv');
      const { data } = await adminAPI.uploadMedia(formData);
      const url = data.data?.file_url || data.data?.file_path;
      const fullUrl = url?.startsWith('http') ? url : `http://localhost:8000${url}`;
      setProfile({ ...profile, cv_file: fullUrl });
      toast.success('تم رفع الملف');
    } catch (e) { toast.error('فشل رفع الملف'); }
    finally { setUploadingCv(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto" dir="rtl">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
      </div>
    );
  }

  if (!profile) return <p className="text-center text-muted-foreground py-20">لا يوجد ملف شخصي</p>;

  const availabilityOptions = [
    { value: 'available', label: 'متاح للعمل', color: 'bg-green-500', ring: 'ring-green-500/20' },
    { value: 'partially_busy', label: 'منشغل جزئياً', color: 'bg-yellow-500', ring: 'ring-yellow-500/20' },
    { value: 'busy', label: 'منشغل تماماً', color: 'bg-red-500', ring: 'ring-red-500/20' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10" dir="rtl">

      {/* ═══ الشريط العلوي ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/80 backdrop-blur-sm sticky top-0 z-10 py-4 -mx-4 px-4 lg:-mx-6 lg:px-6 border-b border-border/50">
        <h1 className="text-xl font-bold">الملف الشخصي</h1>
        <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* ═══ 1. الصورة الشخصية ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 sm:p-6 border-border/50">
          <SectionHeader icon={User} title="الصورة الشخصية" subtitle="الصورة التي تظهر في الموقع" />
          <div className="max-w-[200px]">
            <ImageUpload value={profile.photo} onChange={(url) => setProfile({ ...profile, photo: url })} folder="profile" label="" />
          </div>
        </Card>
      </motion.div>

      {/* ═══ 2. المعلومات الأساسية ═══ */}
     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
       <Card className="p-5 sm:p-6 border-border/50 space-y-5">
         <SectionHeader icon={User} title="المعلومات الأساسية" subtitle="الاسم والنبذة وحالة التوفر" />
     
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label>الاسم (عربي)</Label>
             <Input 
               value={profile.full_name?.ar || ''} 
               onChange={(e) => setProfile({ ...profile, full_name: { ...profile.full_name, ar: e.target.value } })} 
               className="h-11 bg-background" 
               placeholder="علاء حسين" 
             />
           </div>
           <div className="space-y-2">
             <Label>الاسم (إنجليزي)</Label>
             <Input 
               value={profile.full_name?.en || ''} 
               onChange={(e) => setProfile({ ...profile, full_name: { ...profile.full_name, en: e.target.value } })} 
               className="h-11 bg-background" 
               dir="ltr" 
               placeholder="Alaa Hussein" 
             />
           </div>
         </div>
     
         {/* ✅ كلمة الترحيب */}
         <div className="space-y-2">
           <Label className="flex items-center gap-2">
             <span>كلمة ترحيبية</span>
             <Badge variant="secondary" className="text-[9px]">اختياري</Badge>
           </Label>
           <Input 
             value={profile.hero_greeting || ''} 
             onChange={(e) => setProfile({ ...profile, hero_greeting: e.target.value })} 
             className="h-11 bg-background" 
             placeholder="مرحباً، أنا..." 
           />
           <p className="text-[10px] text-muted-foreground">
             تظهر في الصفحة الرئيسية قبل اسمك (مثال: "مرحباً، أنا علاء")
           </p>
         </div>
     
         <div className="space-y-2">
           <Label>نبذة عني (عربي)</Label>
           <Textarea 
             value={profile.bio?.ar || ''} 
             onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, ar: e.target.value } })} 
             className="min-h-[100px] bg-background resize-none text-sm leading-relaxed" 
             placeholder="اكتب نبذة مختصرة عنك..." 
           />
         </div>
     
         <div className="space-y-2">
           <Label>نبذة عني (إنجليزي)</Label>
           <Textarea 
             value={profile.bio?.en || ''} 
             onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, en: e.target.value } })} 
             className="min-h-[80px] bg-background resize-none text-sm" 
             dir="ltr" 
             placeholder="About me..." 
           />
         </div>
     
         <div className="space-y-3">
           <Label>حالة التوفر</Label>
           <div className="flex flex-wrap gap-2">
             {availabilityOptions.map((opt) => {
               const isActive = (profile.availability_status || 'available') === opt.value;
               return (
                 <button
                   key={opt.value}
                   onClick={() => setProfile({ ...profile, availability_status: opt.value })}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${isActive ? `border-primary bg-primary/5 font-medium ring-4 ${opt.ring}` : 'border-border hover:border-primary/30'}`}
                 >
                   <span className={`w-2.5 h-2.5 rounded-full ${opt.color} ${isActive ? 'animate-pulse' : ''}`} />
                   {opt.label}
                 </button>
               );
             })}
           </div>
         </div>
       </Card>
     </motion.div>
     
      {/* ✅ 3. تحسين محركات البحث (SEO) ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-5">
          <SectionHeader 
            icon={BarChart3} 
            title="تحسين محركات البحث (SEO)" 
            subtitle="ساعد محركات البحث على فهم موقعك بشكل أفضل" 
          />
      
          {/* عنوان الصفحة */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>عنوان الصفحة (Title)</span>
              <Badge variant="secondary" className="text-[9px]">50-60 حرف</Badge>
            </Label>
            <Input 
              value={profile.seo?.title || ''} 
              onChange={(e) => setProfile({ 
                ...profile, 
                seo: { 
                  ...(profile.seo || {}), 
                  title: e.target.value 
                } 
              })} 
              className="h-11 bg-background" 
              placeholder="علاء حسين - مطور Full-Stack | Laravel & React" 
              maxLength={60}
            />
            <p className="text-[10px] text-muted-foreground flex items-center justify-between">
              <span>يظهر في نتائج البحث وعنوان التبويب</span>
              <span className={`font-mono ${(profile.seo?.title || '').length > 60 ? 'text-red-500' : 'text-green-600'}`}>
                {(profile.seo?.title || '').length}/60
              </span>
            </p>
          </div>
      
          {/* الوصف */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>الوصف (Description)</span>
              <Badge variant="secondary" className="text-[9px]">150-160 حرف</Badge>
            </Label>
            <Textarea 
              value={profile.seo?.description || ''} 
              onChange={(e) => setProfile({ 
                ...profile, 
                seo: { 
                  ...(profile.seo || {}), 
                  description: e.target.value 
                } 
              })} 
              className="min-h-[80px] bg-background resize-none text-sm leading-relaxed" 
              placeholder="مطور Full-Stack متخصص في بناء تطبيقات ويب عصرية باستخدام Laravel و React. خبرة في تصميم الأنظمة وتطوير واجهات المستخدم..."
              maxLength={160}
            />
            <p className="text-[10px] text-muted-foreground flex items-center justify-between">
              <span>يظهر في نتائج البحث أسفل العنوان</span>
              <span className={`font-mono ${(profile.seo?.description || '').length > 160 ? 'text-red-500' : 'text-green-600'}`}>
                {(profile.seo?.description || '').length}/160
              </span>
            </p>
          </div>
      
          {/* الكلمات المفتاحية */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>الكلمات المفتاحية (Keywords)</span>
              <Badge variant="secondary" className="text-[9px]">اختياري</Badge>
            </Label>
            <Input 
              value={profile.seo?.keywords || ''} 
              onChange={(e) => setProfile({ 
                ...profile, 
                seo: { 
                  ...(profile.seo || {}), 
                  keywords: e.target.value 
                } 
              })} 
              className="h-11 bg-background" 
              dir="ltr"
              placeholder="Full Stack Developer, Laravel, React, Web Development, API"
            />
            <p className="text-[10px] text-muted-foreground">
              افصل الكلمات بفواصل (,) - تستخدمها بعض محركات البحث
            </p>
          </div>
      
          {/* صورة Open Graph */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span>صورة Open Graph</span>
              <Badge variant="secondary" className="text-[9px]">للمشاركة على السوشيال ميديا</Badge>
            </Label>
            <div className="max-w-[300px]">
              <ImageUpload 
                value={profile.seo?.og_image || ''} 
                onChange={(url) => setProfile({ 
                  ...profile, 
                  seo: { 
                    ...(profile.seo || {}), 
                    og_image: url 
                  } 
                })} 
                folder="seo" 
                label="" 
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              الحجم المثالي: 1200x630 بكسل (تظهر عند مشاركة الموقع على Facebook, Twitter, LinkedIn)
            </p>
          </div>
      
          {/* نوع الموقع واللغة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع الموقع (Type)</Label>
              <select
                value={profile.seo?.type || 'website'}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  seo: { 
                    ...(profile.seo || {}), 
                    type: e.target.value 
                  } 
                })}
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="website">موقع ويب</option>
                <option value="profile">ملف شخصي</option>
                <option value="portfolio">معرض أعمال</option>
              </select>
            </div>
      
            <div className="space-y-2">
              <Label>اللغة (Locale)</Label>
              <select
                value={profile.seo?.locale || 'ar_SA'}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  seo: { 
                    ...(profile.seo || {}), 
                    locale: e.target.value 
                  } 
                })}
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="ar_SA">العربية (السعودية)</option>
                <option value="ar_EG">العربية (مصر)</option>
                <option value="ar_YE">العربية (اليمن)</option>
                <option value="en_US">English (US)</option>
              </select>
            </div>
          </div>
      
          {/* ✅ معاينة محسّنة */}
          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/30 space-y-4">
            <p className="text-[10px] font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-3 h-3" />
              معاينة في نتائج البحث (Google)
            </p>
            
            {/* معاينة Google */}
            <div className="space-y-1">
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium line-clamp-1">
                {profile.seo?.title || profile.full_name?.ar || 'عنوان الموقع'}
              </p>
              <p className="text-[10px] text-green-700 dark:text-green-600" dir="ltr">
                {typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'} › home
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {profile.seo?.description || profile.bio?.ar || 'وصف الموقع يظهر هنا في نتائج البحث...'}
              </p>
            </div>
      
            {/* معاينة Social Media */}
            {profile.seo?.og_image && (
              <div className="pt-4 border-t border-border/30 space-y-2">
                <p className="text-[9px] text-muted-foreground font-medium">
                  معاينة عند المشاركة (Facebook / Twitter / LinkedIn):
                </p>
                <div className="border border-border/50 rounded-lg overflow-hidden bg-background max-w-md">
                  <div className="aspect-[1.91/1] w-full overflow-hidden bg-muted">
                    <img 
                      src={profile.seo.og_image} 
                      alt="OG Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide" dir="ltr">
                      {typeof window !== 'undefined' ? window.location.hostname : 'yoursite.com'}
                    </p>
                    <p className="text-sm font-semibold line-clamp-1">
                      {profile.seo?.title || profile.full_name?.ar || 'عنوان'}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {profile.seo?.description || profile.bio?.ar || 'وصف'}
                    </p>
                  </div>
                </div>
              </div>
            )}
      
            {/* رسالة تحفيزية */}
            {!profile.seo?.og_image && (
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground">
                  💡 أضف صورة Open Graph لمعاينة كاملة
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ═══ 4. الأدوار المتناوبة ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={Briefcase} title="الأدوار المتناوبة" subtitle="تظهر بالتناوب تحت اسمك في الصفحة الرئيسية — الترتيب مهم" />

          <div className="space-y-2">
            {(profile.rotating_roles || []).map((role, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30 group">
                <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{i + 1}</span>
                <span className="text-sm flex-1">{role}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => moveRole(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveRole(i, 1)} disabled={i === (profile.rotating_roles || []).length - 1} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={() => removeRole(i)} className="text-red-500 hover:text-red-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())} className="h-11 bg-background" placeholder="مثال: مطور Full-Stack" />
            <Button variant="outline" onClick={addRole} className="h-11 rounded-xl shrink-0 px-5"><Plus className="w-4 h-4 ml-1" /> أضف</Button>
          </div>
        </Card>
      </motion.div>

      {/* ═══ 5. شارات التقنيات (الصفحة الرئيسية) ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={Cpu} title="شارات التقنيات" subtitle="الشارات الصغيرة التي تظهر أسفل الأزرار وحول صورتك" />

          <div className="flex flex-wrap gap-2">
            {(profile.tech_display || []).map((tech, i) => (
              <Badge key={i} variant="secondary" className="gap-1.5 text-xs px-3 py-1.5 rounded-lg">
                {tech}
                <button onClick={() => removeTechDisplay(i)} className="hover:text-red-500 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
              </Badge>
            ))}
            {(profile.tech_display || []).length === 0 && <p className="text-xs text-muted-foreground">لم تُضف شارات بعد</p>}
          </div>

          <div className="flex gap-2">
            <Input value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechDisplay())} className="h-11 bg-background" dir="ltr" placeholder="React, Laravel, MongoDB..." />
            <Button variant="outline" onClick={addTechDisplay} className="h-11 rounded-xl shrink-0 px-5"><Plus className="w-4 h-4 ml-1" /> أضف</Button>
          </div>
        </Card>
      </motion.div>

      {/* ═══ بلوك الكود (الصفحة الرئيسية) ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={Code2} title="بلوك الكود" subtitle="سطور الكود التي تظهر بجانب صورتك في الصفحة الرئيسية" />

          {/* المعاينة الحية */}
          <div className="rounded-xl overflow-hidden border border-border/50 bg-[#0d1117]">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[11px] text-white/30 font-mono mr-3">developer.js</span>
            </div>
            <div className="p-4 font-mono text-sm leading-7" dir="ltr">
              {(profile.code_block_lines || []).map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-white/20 w-6 text-left text-xs select-none">{i + 1}</span>
                  <span className={`mr-3 ${line.color || 'text-white/70'}`}>{line.text}</span>
                </div>
              ))}
              {(profile.code_block_lines || []).length === 0 && (
                <p className="text-white/20 text-xs text-center py-4">أضف سطور الكود</p>
              )}
            </div>
          </div>

          {/* السطور */}
          <div className="space-y-2">
            {(profile.code_block_lines || []).map((line, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border/30 group">
                <span className="w-6 h-6 rounded bg-[#0d1117] flex items-center justify-center text-[10px] font-mono text-white/40 shrink-0">{i + 1}</span>
                <Input
                  value={line.text}
                  onChange={(e) => {
                    const lines = [...(profile.code_block_lines || [])];
                    lines[i] = { ...lines[i], text: e.target.value };
                    setProfile({ ...profile, code_block_lines: lines });
                  }}
                  className="h-8 bg-background text-xs font-mono flex-1"
                  dir="ltr"
                />
                <select
                  value={line.color || 'text-white/70'}
                  onChange={(e) => {
                    const lines = [...(profile.code_block_lines || [])];
                    lines[i] = { ...lines[i], color: e.target.value };
                    setProfile({ ...profile, code_block_lines: lines });
                  }}
                  className="h-8 rounded-md border border-border bg-background px-2 text-[10px] w-28 shrink-0"
                >
                  <option value="text-blue-400">أزرق (كلمات)</option>
                  <option value="text-emerald-400">أخضر (نصوص)</option>
                  <option value="text-cyan-400">سماوي (مصفوفات)</option>
                  <option value="text-amber-400">ذهبي (قيم)</option>
                  <option value="text-purple-400">بنفسجي</option>
                  <option value="text-red-400">أحمر</option>
                  <option value="text-white/70">رمادي</option>
                  <option value="text-pink-400">وردي</option>
                </select>
                <button onClick={() => {
                  setProfile({ ...profile, code_block_lines: (profile.code_block_lines || []).filter((_, j) => j !== i) });
                }} className="text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setProfile({
                ...profile,
                code_block_lines: [...(profile.code_block_lines || []), { text: '', color: 'text-white/70' }],
              });
            }}
            className="w-full h-10 rounded-xl border-dashed"
          >
            <Plus className="w-4 h-4 ml-1" /> إضافة سطر
          </Button>

          {/* زر تعبئة افتراضية */}
          {(profile.code_block_lines || []).length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                setProfile({
                  ...profile,
                  code_block_lines: [
                    { text: 'const developer = {', color: 'text-blue-400' },
                    { text: '  name: "علاء حسين",', color: 'text-emerald-400' },
                    { text: '  role: "Full-Stack",', color: 'text-emerald-400' },
                    { text: '  skills: ["React",', color: 'text-cyan-400' },
                    { text: '    "Laravel", "MongoDB"],', color: 'text-cyan-400' },
                    { text: '  passion: "∞",', color: 'text-amber-400' },
                    { text: '};', color: 'text-blue-400' },
                  ],
                });
              }}
            >
              تعبئة بالقيم الافتراضية
            </Button>
          )}
        </Card>
      </motion.div>

      {/* ═══ 6. التقنيات والأدوات (مع أيقونات) ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={Wrench} title="التقنيات والأدوات" subtitle="القسم الكامل بالأيقونات — يظهر كشبكة في الصفحة الرئيسية" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(profile.tools || []).map((tool, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/30 group relative">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-background border border-border/50 shrink-0 flex items-center justify-center">
                  {tool.icon ? <img src={tool.icon} alt="" className="w-6 h-6 object-contain" /> : <Cpu className="w-4 h-4 text-muted-foreground" />}
                </div>
                <span className="text-sm font-medium truncate">{tool.name}</span>
                <button onClick={() => removeTool(i)} className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-border space-y-3">
            <p className="text-xs text-muted-foreground text-center">إضافة تقنية / أداة</p>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:w-24 shrink-0">
                <Label className="text-[10px] mb-1 block">أيقونة</Label>
                <ImageUpload
                  value={newToolIcon}
                  onChange={(url) => setNewToolIcon(url)}
                  folder="tool-icons"
                  label=""
                  className="[&_div]:min-h-0 [&_div]:p-2"
                />
              </div>
              <div className="flex-1 space-y-1 w-full">
                <Label className="text-[10px]">اسم التقنية / الأداة</Label>
                <Input value={newToolName} onChange={(e) => setNewToolName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())} className="h-11 bg-background" dir="ltr" placeholder="React.js" />
              </div>
              <Button variant="outline" onClick={addTool} className="h-11 rounded-xl shrink-0 px-5 w-full sm:w-auto"><Plus className="w-4 h-4 ml-1" /> أضف</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ 7. الأرقام والإنجازات ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={BarChart3} title="الأرقام والإنجازات" subtitle="تظهر كعدادات في الصفحة الرئيسية" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(profile.highlights || []).map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/30 group">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border/50 shrink-0 flex items-center justify-center">
                  {h.icon ? <img src={h.icon} alt="" className="w-6 h-6 object-contain" /> : <BarChart3 className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{h.label}</p>
                  <p className="text-lg font-bold text-primary">{h.value}</p>
                </div>
                <button onClick={() => removeHighlight(i)} className="text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-border space-y-3">
            <p className="text-xs text-muted-foreground text-center">إضافة إنجاز</p>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:w-24 shrink-0">
                <Label className="text-[10px] mb-1 block">أيقونة</Label>
                <ImageUpload value={newHighlight.icon} onChange={(url) => setNewHighlight({ ...newHighlight, icon: url })} folder="icons" label="" className="[&_div]:min-h-0 [&_div]:p-2" />
              </div>
              <div className="flex-1 space-y-1 w-full">
                <Label className="text-[10px]">العنوان</Label>
                <Input value={newHighlight.label} onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })} className="h-11 bg-background text-sm" placeholder="مشاريع منجزة" />
              </div>
              <div className="w-full sm:w-28 space-y-1">
                <Label className="text-[10px]">القيمة</Label>
                <Input value={newHighlight.value} onChange={(e) => setNewHighlight({ ...newHighlight, value: e.target.value })} className="h-11 bg-background text-sm" placeholder="15+" />
              </div>
              <Button variant="outline" onClick={addHighlight} className="h-11 rounded-xl shrink-0 px-5 w-full sm:w-auto"><Plus className="w-4 h-4 ml-1" /> أضف</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ 8. معلومات التواصل ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={Phone} title="معلومات التواصل" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>البريد الإلكتروني</Label><Input value={profile.contact?.email || ''} onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, email: e.target.value } })} className="h-11 bg-background" dir="ltr" placeholder="email@example.com" /></div>
            <div className="space-y-2"><Label>رقم الهاتف</Label><Input value={profile.contact?.phone || ''} onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, phone: e.target.value } })} className="h-11 bg-background" dir="ltr" placeholder="+967 7XX XXX XXX" /></div>
            <div className="space-y-2"><Label>واتساب</Label><Input value={profile.contact?.whatsapp || ''} onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, whatsapp: e.target.value } })} className="h-11 bg-background" dir="ltr" placeholder="+967 7XX XXX XXX" /></div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ 9. وسائل التواصل الاجتماعي ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <div className="flex items-start justify-between">
            <SectionHeader icon={Share2} title="وسائل التواصل الاجتماعي" />
            <Button variant="outline" size="sm" onClick={addSocial} className="rounded-xl text-xs shrink-0"><Plus className="w-3 h-3 ml-1" /> إضافة</Button>
          </div>

          <div className="space-y-3">
            {(profile.social_links || []).map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/30">
                {/* أيقونة */}
                <div className="w-12 shrink-0">
                  <ImageUpload
                    value={link.icon}
                    onChange={(url) => updateSocial(i, 'icon', url)}
                    folder="social-icons"
                    label=""
                    className="[&_div]:min-h-0 [&_div]:p-1 [&_div]:border-0 [&_img]:w-9 [&_img]:h-9 [&_img]:rounded-lg"
                  />
                </div>
                {/* الاسم */}
                <div className="w-full sm:w-32 shrink-0">
                  <Input value={link.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} className="h-9 bg-background text-xs" placeholder="GitHub" />
                </div>
                {/* الرابط */}
                <div className="flex-1 w-full">
                  <Input value={link.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} className="h-9 bg-background text-xs" dir="ltr" placeholder="https://..." />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 shrink-0" onClick={() => removeSocial(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
            {(profile.social_links || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لم تُضف منصات بعد</p>}
          </div>
        </Card>
      </motion.div>

      {/* ═══ 10. السيرة الذاتية ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-5 sm:p-6 border-border/50 space-y-4">
          <SectionHeader icon={FileDown} title="السيرة الذاتية (CV)" subtitle="ارفع ملف CV من جهازك أو ضع رابط من التخزين السحابي" />

          {profile.cv_file && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <FileText className="w-5 h-5 text-green-600 shrink-0" />
              <a href={profile.cv_file} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline truncate flex-1" dir="ltr">{profile.cv_file.split('/').pop()}</a>
              <Button variant="ghost" size="sm" className="text-red-500 text-xs shrink-0" onClick={() => setProfile({ ...profile, cv_file: null })}>
                <Trash2 className="w-3 h-3 ml-1" /> إزالة
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">رفع من الجهاز</Label>
              <button
                onClick={() => cvInputRef.current?.click()}
                disabled={uploadingCv}
                className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
              >
                {uploadingCv ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">PDF, DOC — حتى 10MB</span>
                  </>
                )}
              </button>
              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleCvUpload(e.target.files[0])} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">أو رابط سحابي</Label>
              <Input
                value={(!profile.cv_file?.includes('localhost') ? profile.cv_file : '') || ''}
                onChange={(e) => setProfile({ ...profile, cv_file: e.target.value })}
                className="h-11 bg-background"
                dir="ltr"
                placeholder="https://drive.google.com/..."
              />
              <p className="text-[10px] text-muted-foreground">Google Drive, Dropbox, OneDrive...</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ زر الحفظ ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 px-8 h-12 text-sm w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ جميع التغييرات
        </Button>
      </motion.div>
    </div>
  );
}