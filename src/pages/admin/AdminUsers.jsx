import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role_id: '', status: 'active' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([adminAPI.getUsers(), adminAPI.getRoles()]);
      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', phone: '', role_id: roles[0]?.id || '', status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', role_id: u.role?.id || '', status: u.status || 'active' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('الاسم والبريد مطلوبان');
    if (!editingId && !form.password) return toast.error('كلمة المرور مطلوبة');
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (editingId) { await adminAPI.updateUser(editingId, data); toast.success('تم التحديث'); }
      else { await adminAPI.createUser(data); toast.success('تم الإنشاء'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المستخدم؟')) return;
    try { await adminAPI.deleteUser(id); toast.success('تم الحذف'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'فشل'); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">المستخدمين الإداريين</h1><p className="text-sm text-muted-foreground">{users.length} مستخدم</p></div>
        <Button onClick={openNew} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 ml-2" /> إضافة مستخدم</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                    {u.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{u.name}</span>
                      <Badge variant="secondary" className="text-[9px]"><Shield className="w-2.5 h-2.5 ml-0.5" />{u.role?.display_name || 'بدون دور'}</Badge>
                      <Badge className={`text-[9px] border-0 ${u.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {u.status === 'active' ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(u.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? 'تعديل مستخدم' : 'مستخدم جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>الاسم *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 bg-background" /></div>
            <div className="space-y-2"><Label>البريد *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
            <div className="space-y-2"><Label>{editingId ? 'كلمة مرور جديدة (اتركها فارغة)' : 'كلمة المرور *'}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
            <div className="space-y-2"><Label>الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10 bg-background" dir="ltr" /></div>
            <div className="space-y-2"><Label>الدور</Label>
              <select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                {roles.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.display_name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>الحالة</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                <option value="active">نشط</option><option value="inactive">معطل</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white rounded-xl">{saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{editingId ? 'حفظ' : 'إنشاء'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}