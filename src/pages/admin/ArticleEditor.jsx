import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import {
  ArrowRight, Save, Loader2, Eye, FileText, Code, Image,
  Plus, Trash2, Copy, Check, Settings, Play, BookOpen,
  GripVertical, Type, ChevronDown, Video, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';
import ImageUpload from '@/components/ui/image-upload';

function BlockToolbar({ onAdd }) {
  const [open, setOpen] = useState(false);
  const types = [
    { type: 'text', label: 'نص', icon: Type, color: 'text-blue-500' },
    { type: 'code', label: 'كود', icon: Code, color: 'text-green-500' },
    { type: 'image', label: 'صورة', icon: Image, color: 'text-purple-500' },
    { type: 'video', label: 'فيديو', icon: Video, color: 'text-red-500' },
  ];

  return (
    <div className="relative flex justify-center my-4">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border shadow-sm">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.type}
              onClick={() => onAdd(t.type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-muted ${t.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextBlock({ block, onChange, onDelete }) {
  return (
    <div className="group relative">
      <div className="absolute -right-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <Card className="p-4 border-border/50 border-r-4 border-r-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-medium text-muted-foreground">نص</span>
        </div>
        <Textarea
          value={block.content || ''}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          className="min-h-[120px] bg-background resize-y text-[15px] leading-[2] border-0 focus-visible:ring-0 p-0"
          placeholder="اكتب النص هنا..."
          dir={block.dir || 'auto'}
        />
      </Card>
    </div>
  );
}

function CodeBlock({ block, onChange, onDelete }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => { navigator.clipboard.writeText(block.content || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="group relative">
      <div className="absolute -right-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <Card className="overflow-hidden border-border/50 border-r-4 border-r-green-500/30">
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-green-400" />
            <select
              value={block.language || 'javascript'}
              onChange={(e) => onChange({ ...block, language: e.target.value })}
              className="bg-transparent text-white/60 text-[11px] border-0 outline-none cursor-pointer"
            >
              <option value="javascript">JavaScript</option><option value="jsx">JSX</option>
              <option value="php">PHP</option><option value="python">Python</option>
              <option value="html">HTML</option><option value="css">CSS</option>
              <option value="sql">SQL</option><option value="bash">Bash</option>
              <option value="json">JSON</option><option value="typescript">TypeScript</option>
            </select>
            <input
              value={block.title || ''}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className="bg-transparent text-white/40 text-[11px] border-0 outline-none w-40"
              placeholder="عنوان الكود..."
            />
          </div>
          <button onClick={copyCode} className="text-white/40 hover:text-white">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <Textarea
          value={block.content || ''}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          className="min-h-[150px] bg-[#0d1117] text-[#e6edf3] font-mono text-sm resize-y border-0 rounded-none focus-visible:ring-0"
          dir="ltr"
          placeholder="// اكتب الكود هنا..."
        />
      </Card>
    </div>
  );
}

function ImageBlock({ block, onChange, onDelete }) {
  return (
    <div className="group relative">
      <div className="absolute -right-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <Card className="p-4 border-border/50 border-r-4 border-r-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-purple-500" />
          <span className="text-[10px] font-medium text-muted-foreground">صورة</span>
        </div>
        <ImageUpload
          value={block.content}
          onChange={(url) => onChange({ ...block, content: url })}
          folder="articles"
          label=""
        />
        <Input
          value={block.caption || ''}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          className="mt-2 h-9 bg-background text-xs"
          placeholder="وصف الصورة (اختياري)..."
        />
      </Card>
    </div>
  );
}

function VideoBlock({ block, onChange, onDelete }) {
  const getYoutubeId = (url) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };
  const ytId = getYoutubeId(block.content);

  return (
    <div className="group relative">
      <div className="absolute -right-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <Card className="p-4 border-border/50 border-r-4 border-r-red-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-medium text-muted-foreground">فيديو</span>
        </div>
        <Input
          value={block.title || ''}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          className="h-9 bg-background text-xs mb-2"
          placeholder="عنوان الفيديو..."
        />
        <Input
          value={block.content || ''}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          className="h-9 bg-background text-xs"
          dir="ltr"
          placeholder="https://youtube.com/watch?v=..."
        />
        {ytId && (
          <div className="mt-3 rounded-xl overflow-hidden aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allowFullScreen
              title={block.title || 'فيديو'}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', blocks: [],
    cover_image: null, category: '', tags: [], sources: [],
    language: 'ar', status: 'draft', is_featured: false,
    is_published: false, author: { name: 'علاء حسين' },
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [newTag, setNewTag] = useState('');
  const [newSource, setNewSource] = useState({ title: '', url: '' });

  useEffect(() => { if (isEditing) loadArticle(); }, [id]);

  const loadArticle = async () => {
    try {
      const { data } = await adminAPI.getArticle(id);
      const a = data.data;
      setForm({
        title: a.title || '', slug: a.slug || '', excerpt: a.excerpt || '',
        blocks: a.blocks || [], cover_image: a.cover_image || null,
        category: a.category || '', tags: a.tags || [], sources: a.sources || [],
        language: a.language || 'ar', status: a.status || 'draft',
        is_featured: a.is_featured || false, is_published: a.is_published || false,
        author: a.author || { name: 'علاء حسين' },
      });
    } catch (e) { toast.error('فشل التحميل'); navigate('/admin/articles'); }
    finally { setLoading(false); }
  };

  const addBlock = (type) => {
    const newBlock = { id: Date.now().toString(), type, content: '', title: '', language: 'javascript', caption: '' };
    setForm({ ...form, blocks: [...form.blocks, newBlock] });
  };

  const updateBlock = (index, updated) => {
    const blocks = [...form.blocks];
    blocks[index] = updated;
    setForm({ ...form, blocks });
  };

  const deleteBlock = (index) => {
    setForm({ ...form, blocks: form.blocks.filter((_, i) => i !== index) });
  };

  const moveBlock = (index, direction) => {
    const blocks = [...form.blocks];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setForm({ ...form, blocks });
  };

  const handleSave = async (asDraft = false) => {
    if (!form.title) {
      return toast.error('العنوان مطلوب');
    }
  
    // ✅ تحضير البيانات للإرسال
    const saveData = {
      title: form.title,
      slug: form.slug || '',
      excerpt: form.excerpt || '',
      blocks: form.blocks || [],
      cover_image: form.cover_image || null,
      category: form.category || '',
      tags: form.tags || [],
      sources: form.sources || [],
      language: form.language || 'ar',
      status: asDraft ? 'draft' : (form.status || 'published'),
      is_featured: form.is_featured || false,
      is_published: asDraft ? false : (form.status === 'published'),
      author: form.author || { name: 'علاء حسين' },
    };
  
    setSaving(true);
  
    try {
      if (isEditing) {
        const { data } = await adminAPI.updateArticle(id, saveData);
        toast.success('تم حفظ التعديلات بنجاح');
      } else {
        const { data } = await adminAPI.createArticle(saveData);
        toast.success('تم إنشاء المقالة بنجاح');
      }
  
      navigate('/admin/articles');
  
    } catch (error) {
      console.error('Save error:', error);
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || 'فشل الحفظ';
      
      toast.error(errorMsg);
  
      // ✅ عرض تفاصيل الخطأ في وضع التطوير
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
  
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => { if (newTag.trim()) { setForm({ ...form, tags: [...form.tags, newTag.trim()] }); setNewTag(''); } };
  const addSource = () => { if (newSource.title) { setForm({ ...form, sources: [...form.sources, { ...newSource }] }); setNewSource({ title: '', url: '' }); } };

  const wordCount = form.blocks.filter(b => b.type === 'text').reduce((acc, b) => acc + (b.content || '').split(/\s+/).filter(Boolean).length, 0);
  const isRTL = form.language === 'ar';

  if (loading) return <div className="space-y-6"><div className="h-12 bg-muted animate-pulse rounded-xl" /><div className="h-96 bg-muted animate-pulse rounded-xl" /></div>;

  return (
    <div className="min-h-screen" dir="rtl">
      {/* الشريط العلوي */}
      <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/articles')} className="rounded-lg"><ArrowRight className="w-4 h-4 ml-1" /> رجوع</Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-bold hidden sm:block">{isEditing ? 'تعديل' : 'مقالة جديدة'}</span>
            <Badge variant="secondary" className="text-[9px] hidden md:flex">{wordCount} كلمة • {Math.max(1, Math.ceil(wordCount / 200))} دقيقة</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <button onClick={() => setActiveTab('editor')} className={`px-3 py-1.5 text-xs ${activeTab === 'editor' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>المحرر</button>
              <button onClick={() => setActiveTab('settings')} className={`px-3 py-1.5 text-xs ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>الإعدادات</button>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSave(true)} disabled={saving} className="rounded-lg text-xs">مسودة</Button>
            <Button size="sm" onClick={() => handleSave(false)} disabled={saving} className="gradient-bg text-white rounded-lg text-xs shadow-lg shadow-primary/20">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" /> : <Save className="w-3.5 h-3.5 ml-1" />}
              نشر
            </Button>
          </div>
        </div>
      </div>

      {/* التبويب للموبايل */}
      <div className="sm:hidden flex border-b border-border">
        <button onClick={() => setActiveTab('editor')} className={`flex-1 py-2.5 text-xs font-medium ${activeTab === 'editor' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>المحرر</button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2.5 text-xs font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>الإعدادات</button>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">

        {/* ═══ المحرر ═══ */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* لغة المقالة */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Label className="text-xs font-medium">لغة المقالة:</Label>
              <div className="flex border rounded-lg overflow-hidden">
                <button onClick={() => setForm({ ...form, language: 'ar' })} className={`px-4 py-1.5 text-xs ${form.language === 'ar' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>عربي</button>
                <button onClick={() => setForm({ ...form, language: 'en' })} className={`px-4 py-1.5 text-xs ${form.language === 'en' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>English</button>
              </div>
            </div>

            {/* الغلاف */}
            <Card className="p-5 border-border/50">
              <ImageUpload value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} folder="articles" label="صورة الغلاف" />
            </Card>

            {/* العنوان */}
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="h-14 bg-transparent border-0 text-2xl sm:text-3xl font-bold focus-visible:ring-0 px-0"
              placeholder="عنوان المقالة..."
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* المقتطف */}
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="min-h-[60px] bg-muted/30 border-border/30 resize-none text-sm"
              placeholder="ملخص قصير للمقالة..."
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            <Separator />

            {/* البلوكات */}
            <div className="space-y-4 pr-10">
              {form.blocks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">ابدأ بإضافة محتوى لمقالتك</p>
                  <p className="text-xs opacity-60 mt-1">اضغط على الأزرار أدناه لإضافة نص أو كود أو صورة أو فيديو</p>
                </div>
              )}

              {form.blocks.map((block, i) => (
                <div key={block.id || i}>
                  {/* أسهم الترتيب */}
                  <div className="flex items-center gap-1 mb-1 -mr-10">
                    <button
                      onClick={() => moveBlock(i, -1)}
                      disabled={i === 0}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20"
                    >▲</button>
                    <button
                      onClick={() => moveBlock(i, 1)}
                      disabled={i === form.blocks.length - 1}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20"
                    >▼</button>
                    <span className="text-[9px] text-muted-foreground/40 mr-1">#{i + 1}</span>
                  </div>

                  {block.type === 'text' && <TextBlock block={block} onChange={(b) => updateBlock(i, b)} onDelete={() => deleteBlock(i)} />}
                  {block.type === 'code' && <CodeBlock block={block} onChange={(b) => updateBlock(i, b)} onDelete={() => deleteBlock(i)} />}
                  {block.type === 'image' && <ImageBlock block={block} onChange={(b) => updateBlock(i, b)} onDelete={() => deleteBlock(i)} />}
                  {block.type === 'video' && <VideoBlock block={block} onChange={(b) => updateBlock(i, b)} onDelete={() => deleteBlock(i)} />}
                </div>
              ))}

              <BlockToolbar onAdd={addBlock} />
            </div>

            {/* المصادر */}
            <Card className="p-5 border-border/50 mt-8">
              <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> المصادر والمراجع</h3>
              {form.sources.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm">{s.title}</p>{s.url && <p className="text-[10px] text-primary truncate" dir="ltr">{s.url}</p>}</div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setForm({ ...form, sources: form.sources.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <Input value={newSource.title} onChange={(e) => setNewSource({ ...newSource, title: e.target.value })} className="h-9 bg-background text-xs" placeholder="عنوان المصدر" />
                <Input value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} className="h-9 bg-background text-xs" dir="ltr" placeholder="https://..." />
                <Button variant="outline" size="sm" onClick={addSource} className="h-9 text-xs rounded-lg"><Plus className="w-3 h-3 ml-1" /> أضف</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ═══ الإعدادات ═══ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="p-6 border-border/50 space-y-5">
              <h2 className="font-bold">إعدادات النشر</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-10 bg-background" dir="ltr" placeholder="تلقائي" /></div>
                <div className="space-y-2"><Label>التصنيف</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 bg-background" placeholder="تطوير ويب..." /></div>
              </div>
              <div className="space-y-2">
                <Label>الوسوم</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((t, i) => <Badge key={i} variant="secondary" className="gap-1 text-xs">#{t}<button onClick={() => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) })} className="hover:text-red-500"><Trash2 className="w-2.5 h-2.5" /></button></Badge>)}
                </div>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="h-10 bg-background" dir="ltr" placeholder="وسم + Enter" />
                  <Button variant="outline" onClick={addTag} className="h-10 rounded-xl"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>الحالة</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value, is_published: e.target.value === 'published' })} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">
                    <option value="draft">📝 مسودة</option><option value="published">✅ منشور</option><option value="archived">📦 مؤرشف</option>
                  </select>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50"><Label className="text-sm">مميزة</Label><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /></div>
                </div>
              </div>
              <div className="space-y-2"><Label>اسم الكاتب</Label><Input value={form.author.name} onChange={(e) => setForm({ ...form, author: { ...form.author, name: e.target.value } })} className="h-10 bg-background" /></div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}