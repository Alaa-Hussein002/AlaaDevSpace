import { useEffect, useState } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHighlight, setNewHighlight] = useState({ icon: '💡', label: '', value: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const { data } = await adminAPI.getProfile(); setProfile(data.data || {}); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await adminAPI.updateProfile(profile); toast.success('تم حفظ الملف الشخصي'); }
    catch (e) { toast.error('فشل الحفظ'); }
    finally { setSaving(false); }
  };

  const addSocial = () => {
    const links = profile.social_links || [];
    setProfile({ ...profile, social_links: [...links, { platform: '', url: '', icon: '' }] });
  };

  const updateSocial = (i, field, value) => {
    const links = [...(profile.social_links || [])];
    links[i] = { ...links[i], [field]: value };
    setProfile({ ...profile, social_links: links });
  };

  const removeSocial = (i) => {
    setProfile({ ...profile, social_links: (profile.social_links || []).filter((_, j) => j !== i) });
  };

  const addHighlight = () => {
    if (!newHighlight.label) return;
    setProfile({ ...profile, highlights: [...(profile.highlights || []), { ...newHighlight }] });
    setNewHighlight({ icon: '💡', label: '', value: '' });
  };

  const removeHighlight = (i) => {
    setProfile({ ...profile, highlights: (profile.highlights || []).filter((_, j) => j !== i) });
  };

  if (loading) return <div className="h-96 bg-muted animate-pulse rounded-xl" />;
  if (!profile) return <p className="text-center text-muted-foreground py-20">لا يوجد ملف شخصي</p>;

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">الملف الشخصي</h1>
        <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* الصورة الشخصية */}
      <Card className="p-6 border-border/50">
        <div className="grid grid-cols-2 gap-6">
          <ImageUpload value={profile.photo} onChange={(url) => setProfile({ ...profile, photo: url })} folder="profile" label="الصورة الشخصية" />
          <ImageUpload value={profile.cover_image} onChange={(url) => setProfile({ ...profile, cover_image: url })} folder="profile" label="صورة الغلاف" />
        </div>
      </Card>

      {/* المعلومات الأساسية */}
      <Card className="p-6 border-border/50 space-y-4">
        <h2 className="font-bold">المعلومات الأساسية</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>الاسم (عربي)</Label><Input value={profile.full_name?.ar || ''} onChange={(e) => setProfile({ ...profile, full_name: { ...profile.full_name, ar: e.target.value } })} className="h-10 bg-background" /></div>
          <div className="space-y-2"><Label>الاسم (إنجليزي)</Label><Input value={profile.full_name?.en || ''} onChange={(e) => setProfile({ ...profile, full_name: { ...profile.full_name, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>المسمى (عربي)</Label><Input value={profile.title?.ar || ''} onChange={(e) => setProfile({ ...profile, title: { ...profile.title, ar: e.target.value } })} className="h-10 bg-background" /></div>
          <div className="space-y-2"><Label>المسمى (إنجليزي)</Label><Input value={profile.title?.en || ''} onChange={(e) => setProfile({ ...profile, title: { ...profile.title, en: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
        </div>
        <div className="space-y-2"><Label>نبذة (عربي)</Label><Textarea value={profile.bio?.ar || ''} onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, ar: e.target.value } })} className="min-h-[100px] bg-background resize-none" /></div>
        <div className="space-y-2"><Label>نبذة (إنجليزي)</Label><Textarea value={profile.bio?.en || ''} onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, en: e.target.value } })} className="min-h-[80px] bg-background resize-none" dir="ltr" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>الجنسية</Label><Input value={profile.nationality || ''} onChange={(e) => setProfile({ ...profile, nationality: e.target.value })} className="h-10 bg-background" /></div>
          <div className="flex items-center gap-2 pt-6"><Switch checked={profile.available_for_hire} onCheckedChange={(v) => setProfile({ ...profile, available_for_hire: v })} /><Label>متاح للعمل</Label></div>
        </div>
      </Card>

      {/* التواصل */}
      <Card className="p-6 border-border/50 space-y-4">
        <h2 className="font-bold">معلومات التواصل</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>البريد</Label><Input value={profile.contact?.email || ''} onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, email: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
          <div className="space-y-2"><Label>الهاتف</Label><Input value={profile.contact?.phone || ''} onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, phone: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
          <div className="space-y-2"><Label>واتساب</Label><Input value={profile.contact?.whatsapp || ''} onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, whatsapp: e.target.value } })} className="h-10 bg-background" dir="ltr" /></div>
        </div>
      </Card>

      {/* روابط التواصل الاجتماعي */}
      <Card className="p-6 border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">وسائل التواصل</h2>
          <Button variant="outline" size="sm" onClick={addSocial} className="rounded-lg text-xs"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
        </div>
        {(profile.social_links || []).map((link, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-end">
            <div className="space-y-1"><Label className="text-[10px]">المنصة</Label><Input value={link.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} className="h-9 bg-background text-xs" dir="ltr" placeholder="github" /></div>
            <div className="space-y-1 col-span-2"><Label className="text-[10px]">الرابط</Label><Input value={link.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} className="h-9 bg-background text-xs" dir="ltr" placeholder="https://..." /></div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeSocial(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </Card>

      {/* الإنجازات / الأرقام */}
      <Card className="p-6 border-border/50 space-y-4">
        <h2 className="font-bold">الأرقام والإنجازات</h2>
        {(profile.highlights || []).map((h, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
            <span className="text-xl">{h.icon}</span>
            <span className="flex-1">{h.label}: <strong>{h.value}</strong></span>
            <button onClick={() => removeHighlight(i)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <div className="grid grid-cols-4 gap-2 items-end">
          <div className="space-y-1"><Label className="text-[10px]">أيقونة</Label><Input value={newHighlight.icon} onChange={(e) => setNewHighlight({ ...newHighlight, icon: e.target.value })} className="h-9 bg-background text-center text-lg" /></div>
          <div className="space-y-1"><Label className="text-[10px]">العنوان</Label><Input value={newHighlight.label} onChange={(e) => setNewHighlight({ ...newHighlight, label: e.target.value })} className="h-9 bg-background text-xs" placeholder="مشاريع منجزة" /></div>
          <div className="space-y-1"><Label className="text-[10px]">القيمة</Label><Input value={newHighlight.value} onChange={(e) => setNewHighlight({ ...newHighlight, value: e.target.value })} className="h-9 bg-background text-xs" placeholder="15+" /></div>
          <Button variant="outline" size="sm" onClick={addHighlight} className="h-9 text-xs"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
        </div>
      </Card>

      {/* CV */}
      <Card className="p-6 border-border/50 space-y-4">
        <h2 className="font-bold">السيرة الذاتية</h2>
        <div className="space-y-2">
          <Label>رابط ملف CV</Label>
          <Input value={profile.cv_file || ''} onChange={(e) => setProfile({ ...profile, cv_file: e.target.value })} className="h-10 bg-background" dir="ltr" placeholder="/cv.pdf أو رابط خارجي" />
        </div>
      </Card>

      {/* زر الحفظ السفلي */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ جميع التغييرات
        </Button>
      </div>
    </div>
  );
}