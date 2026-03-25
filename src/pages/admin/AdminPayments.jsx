import { useEffect, useState } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Check, X, Clock, Building2, Wallet, 
  Banknote, Plus, Pencil, Trash2, ShieldCheck, FileText,
  KeyRound, Globe, Zap, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

const statusLabel = { pending_confirmation: 'بانتظار التأكيد', confirmed: 'مؤكد', rejected: 'مرفوض' };
const statusColor = { pending_confirmation: 'bg-yellow-500', confirmed: 'bg-green-500', rejected: 'bg-red-500' };

// 🟢 توحيد الأسماء لتتطابق تماماً مع Model لارافيل
const METHOD_TYPES = {
  online: { label: 'بوابة دفع (آلي)', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  bank_transfer: { label: 'تحويل بنكي (يدوي)', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  wallet: { label: 'محفظة (يدوي)', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  cod: { label: 'دفع عند الاستلام', icon: Banknote, color: 'text-amber-500', bg: 'bg-amber-500/10' }
};

const emptyMethod = {
  type: 'online',
  name: '',
  is_active: true,
  details: { 
    bank_name: '', account_name: '', account_number: '', iban: '', icon_url: '', // للبنوك
    wallet_provider: '', wallet_number: '', wallet_receiver: '', // للمحافظ
    gateway_provider: 'stripe', public_key: '', secret_key: '', is_sandbox: true // للبوابات
  },
  instructions: ''
};

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState(null);
  const [methodForm, setMethodForm] = useState({ ...emptyMethod });

  useEffect(() => {
    if (activeTab === 'transactions') loadPayments();
    if (activeTab === 'methods') loadMethods();
  }, [activeTab]);

  const loadPayments = async () => {
    setLoading(true);
    try { const { data } = await adminAPI.getPayments(); setPayments(data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadMethods = async () => {
    setLoadingMethods(true);
    try { const { data } = await adminAPI.getPaymentMethods(); setMethods(data.data || []); } 
    catch (e) { setMethods([]); } finally { setLoadingMethods(false); }
  };

  const confirmPayment = async (num) => {
    try { await adminAPI.confirmPayment(num, {}); toast.success('تم تأكيد الدفعة بنجاح'); setSelectedPayment(null); loadPayments(); }
    catch (e) { toast.error('فشل تأكيد الدفعة'); }
  };

  const rejectPayment = async (num) => {
    if (!rejectReason) return toast.error('سبب الرفض مطلوب لإعلام العميل');
    try { await adminAPI.rejectPayment(num, { reason: rejectReason }); toast.success('تم رفض الدفعة'); setSelectedPayment(null); loadPayments(); }
    catch (e) { toast.error('فشل رفض الدفعة'); }
  };

  const handleSaveMethod = async () => {
    // 1. نأخذ نسخة من البيانات قبل إرسالها
    let payload = { ...methodForm };

    // 2. إذا كان الدفع عند الاستلام، نقوم بتعبئة الاسم تلقائياً حتى لا يرفضه لارافيل
    if (payload.type === 'cod' && (!payload.name || payload.name.trim() === '')) {
      payload.name = 'الدفع عند الاستلام';
    }

    // 3. نتحقق أن الاسم غير فارغ لباقي الطرق
    if (!payload.name || payload.name.trim() === '') {
      return toast.error('الاسم المعروض مطلوب');
    }

    try {
      if (editingMethodId) { 
        await adminAPI.updatePaymentMethod(editingMethodId, payload); // لاحظ استخدمنا payload هنا
        toast.success('تم التحديث'); 
      } else { 
        await adminAPI.createPaymentMethod(payload); // وهنا أيضاً
        toast.success('تمت الإضافة'); 
      }
      setMethodModalOpen(false); 
      loadMethods();
    } catch (e) { 
      toast.error('حدث خطأ أثناء الحفظ، يرجى التحقق من البيانات'); 
      console.error(e.response?.data || e); 
    }
  };

  const openNewMethod = () => { setEditingMethodId(null); setMethodForm({ ...emptyMethod }); setMethodModalOpen(true); };
  const openEditMethod = (m) => { setEditingMethodId(m.id); setMethodForm({ type: m.type, name: m.name, is_active: m.is_active, details: m.details || emptyMethod.details, instructions: m.instructions || '' }); setMethodModalOpen(true); };

  const pendingCount = payments.filter(p => p.status === 'pending_confirmation').length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10" dir="rtl">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> الإدارة المالية</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">إدارة التحويلات وبوابات الدفع الإلكترونية</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 w-full md:w-auto">
          <button onClick={() => setActiveTab('transactions')} className={`flex-1 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            العمليات <Badge variant="secondary" className="ml-1 bg-yellow-500/20 text-yellow-600 border-0">{pendingCount}</Badge>
          </button>
          <button onClick={() => setActiveTab('methods')} className={`flex-1 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'methods' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            طرق الدفع
          </button>
        </div>
      </div>

      {/* ===================== تبويبة العمليات ===================== */}
      {activeTab === 'transactions' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}</div>
          ) : payments.length === 0 ? (
            <Card className="p-10 sm:p-16 text-center border-dashed border-border/50"><ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/20 mx-auto mb-4" /><p className="text-sm sm:text-base text-muted-foreground font-medium">لا توجد عمليات دفع حالياً</p></Card>
          ) : (
            <div className="grid gap-3">
              {payments.map((p, i) => (
                <Card key={p.id} onClick={() => { setSelectedPayment(p); setRejectReason(''); }} className={`p-4 sm:p-5 border-border/50 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md ${p.status === 'pending_confirmation' ? 'bg-yellow-500/5' : 'bg-card'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${p.status === 'pending_confirmation' ? 'bg-yellow-500/20 text-yellow-600' : p.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                        {p.payment_method?.includes('بطاقة') || p.payment_method?.includes('مدى') ? <Globe className="w-5 h-5 sm:w-6 sm:h-6" /> : <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm sm:text-base">{p.payment_number}</span>
                          <Badge className={`${statusColor[p.status]} text-white border-0 text-[9px] sm:text-[10px] px-2 py-0.5 shadow-sm`}>{statusLabel[p.status]}</Badge>
                          {p.is_automated && <Badge variant="outline" className="text-[8px] sm:text-[9px] gap-1 bg-emerald-500/5 text-emerald-600 border-emerald-500/20"><Zap className="w-2.5 h-2.5 fill-current hidden sm:inline" /> دفع آلي</Badge>}
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {new Date(p.created_at).toLocaleString('ar')}</p>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-black text-xl sm:text-2xl text-primary">${p.amount}</p>
                      <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">{p.payment_method}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ===================== تبويبة طرق الدفع ===================== */}
      {activeTab === 'methods' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex justify-end mb-2">
            <Button onClick={openNewMethod} className="gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 text-xs sm:text-sm h-10 w-full sm:w-auto">
              <Plus className="w-4 h-4 ml-2" /> إضافة طريقة دفع
            </Button>
          </div>

          {loadingMethods ? (
            <div className="grid sm:grid-cols-2 gap-4">{[1, 2].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}</div>
          ) : methods.length === 0 ? (
            <Card className="p-10 sm:p-16 text-center border-dashed border-border/50"><Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/20 mx-auto mb-4" /><p className="text-sm sm:text-base text-muted-foreground font-medium mb-2">لم تقم بإعداد أي طرق دفع بعد</p></Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {methods.map((m) => {
                const TypeIcon = METHOD_TYPES[m.type]?.icon || CreditCard;
                return (
                  <Card key={m.id} className={`p-4 sm:p-5 relative overflow-hidden transition-all ${m.is_active ? 'border-border/50' : 'border-dashed border-border/40 opacity-70'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {m.details?.icon_url ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border"><img src={m.details.icon_url} className="w-full h-full object-contain p-1" alt="" /></div>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${METHOD_TYPES[m.type]?.bg} ${METHOD_TYPES[m.type]?.color}`}><TypeIcon className="w-5 h-5" /></div>
                        )}
                        <div>
                          <h3 className="font-bold text-sm sm:text-base">{m.type === 'cod' ? 'الدفع عند الاستلام' : m.name}</h3>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{METHOD_TYPES[m.type]?.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-background rounded-lg border p-1 shadow-sm relative z-10">
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md" onClick={() => openEditMethod(m)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md text-red-500 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    
                    {m.type === 'online' && (
                      <div className="text-xs bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                        <div><p className="text-emerald-700 font-bold">{m.details?.gateway_provider || 'بوابة دفع'}</p><p className="text-[10px] text-muted-foreground mt-0.5">مربوطة عبر مفاتيح API</p></div>
                        {m.details?.is_sandbox && <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20">وضع التجربة</Badge>}
                      </div>
                    )}
                    {m.type === 'bank_transfer' && (
                      <div className="text-xs sm:text-sm bg-muted/40 p-3 rounded-xl space-y-1.5 border border-border/30">
                        <p className="text-muted-foreground text-[10px] sm:text-xs">{m.details?.bank_name} - {m.details?.account_name}</p>
                        <p className="font-bold font-mono tracking-widest">{m.details?.account_number}</p>
                      </div>
                    )}
                    {m.type === 'wallet' && (
                      <div className="text-xs sm:text-sm bg-muted/40 p-3 rounded-xl space-y-1.5 border border-border/30">
                        <p className="text-muted-foreground text-[10px] sm:text-xs">{m.details?.wallet_provider} - {m.details?.wallet_receiver}</p>
                        <p className="font-bold font-mono tracking-widest">{m.details?.wallet_number}</p>
                      </div>
                    )}
                    
                    {!m.is_active && <div className="absolute top-0 right-0 w-full h-full bg-background/50 backdrop-blur-[1px] flex items-center justify-center"><Badge variant="secondary">معطلة</Badge></div>}
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ===================== مودال تفاصيل الدفعة ===================== */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        
        <DialogContent className="max-w-xl p-0 overflow-y-auto max-h-[95vh] w-[95vw] sm:w-full rounded-2xl" dir="rtl">
          <DialogDescription className="hidden">  تفاصيل الدفعة </DialogDescription>
          <div className="bg-muted/30 border-b p-4 sm:p-6 flex items-start justify-between sticky top-0 backdrop-blur-md z-10">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black mb-1 flex items-center gap-2">
                عملية #{selectedPayment?.payment_number}
                {selectedPayment?.is_automated && <Zap className="w-4 h-4 text-emerald-500" fill="currentColor" />}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">{new Date(selectedPayment?.created_at).toLocaleString('ar')}</p>
            </div>
            <Badge className={`${statusColor[selectedPayment?.status]} text-white border-0 text-[10px] sm:text-xs px-2 sm:px-3 py-1 shadow-md`}>
              {statusLabel[selectedPayment?.status]}
            </Badge>
          </div>
          
          {selectedPayment && (
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div><p className="text-xs sm:text-sm text-primary/70 font-bold mb-1">المبلغ المدفوع</p><p className="font-black text-2xl sm:text-3xl text-primary">${selectedPayment.amount}</p></div>
                <div className="text-left"><p className="text-xs sm:text-sm text-muted-foreground mb-1">طريقة الدفع</p><p className="text-sm sm:text-base font-bold">{selectedPayment.payment_method}</p></div>
              </div>

              {selectedPayment.payment_details && Object.keys(selectedPayment.payment_details).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> تفاصيل العملية</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedPayment.payment_details).map(([key, val]) => (
                      <div key={key} className="bg-muted/40 p-3 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                        <p className="font-bold text-xs sm:text-sm truncate font-mono">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPayment.status === 'pending_confirmation' && !selectedPayment.is_automated && (
                <div className="pt-4 sm:pt-6 border-t border-border/50 space-y-3 sm:space-y-4">
                  <Button onClick={() => confirmPayment(selectedPayment.payment_number)} className="w-full h-10 sm:h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 text-sm sm:text-base">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 ml-2" /> تأكيد استلام المبلغ
                  </Button>
                  <div className="flex gap-2">
                    <Input placeholder="سبب الرفض (ليظهر للعميل)..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="h-10 sm:h-12 bg-muted/50 rounded-xl text-xs sm:text-sm" />
                    <Button onClick={() => rejectPayment(selectedPayment.payment_number)} variant="outline" className="h-10 sm:h-12 px-4 sm:px-6 text-red-500 border-red-500/30 hover:bg-red-500/10 rounded-xl">
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedPayment.is_automated && selectedPayment.status === 'confirmed' && (
                <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-xs sm:text-sm">عملية دفع مؤكدة آلياً</p>
                    <p className="text-[10px] sm:text-xs mt-1 opacity-80 leading-relaxed">تم تأكيد استلام هذا المبلغ تلقائياً من قبل البوابة ولا يتطلب تدخلاً يدوياً.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================== مودال إضافة/تعديل طريقة دفع ===================== */}
      <Dialog open={methodModalOpen} onOpenChange={setMethodModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-y-auto max-h-[95vh] w-[95vw] sm:w-full rounded-2xl" dir="rtl">
          <DialogDescription className="hidden">نموذج إدارة طريقة الدفع</DialogDescription>
          <div className="p-4 sm:p-6 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> {editingMethodId ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
            </DialogTitle>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            
            <div className="space-y-3">
              <Label className="text-xs sm:text-sm font-bold">نوع طريقة الدفع</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {Object.entries(METHOD_TYPES).map(([k, v]) => {
                  const Icon = v.icon;
                  return (
                    <button key={k} onClick={() => setMethodForm({ ...methodForm, type: k })} className={`p-3 rounded-xl border-2 flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all ${methodForm.type === k ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:border-border'}`}>
                      <Icon className={`w-5 h-5 ${methodForm.type === k ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-[9px] sm:text-[10px] font-bold ${methodForm.type === k ? 'text-primary' : 'text-muted-foreground'}`}>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* الحقول تختلف إذا كان الدفع عند الاستلام */}
            {methodForm.type !== 'cod' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">الاسم المعروض للعميل *</Label><Input value={methodForm.name} onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })} placeholder="مثال: الدفع بالبطاقة الائتمانية" className="h-10 bg-muted/50 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> رابط الأيقونة (اختياري)</Label><Input value={methodForm.details.icon_url} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, icon_url: e.target.value } })} placeholder="https://.../icon.png" className="h-10 bg-muted/50 text-sm" dir="ltr" /></div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
              <Switch checked={methodForm.is_active} onCheckedChange={(v) => setMethodForm({ ...methodForm, is_active: v })} />
              <Label className="text-xs sm:text-sm font-bold cursor-pointer">تفعيل هذه الطريقة ليتمكن العملاء من استخدامها</Label>
            </div>

            {/* حقول بوابة الدفع التلقائية */}
            {methodForm.type === 'gateway' && (
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1.5"><KeyRound className="w-4 h-4" /> إعدادات الربط البرمجي (API)</p>
                  <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"><Switch checked={methodForm.details.is_sandbox} onCheckedChange={(v) => setMethodForm({ ...methodForm, details: { ...methodForm.details, is_sandbox: v } })} /><Label className="text-[10px] sm:text-xs text-amber-700 font-bold cursor-pointer">وضع التجربة (Sandbox)</Label></div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">مزود الخدمة (مثل: stripe, moyasar)</Label><Input value={methodForm.details.gateway_provider} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, gateway_provider: e.target.value } })} className="bg-background text-sm" dir="ltr" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">المفتاح العام (Public Key)</Label><Input value={methodForm.details.public_key} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, public_key: e.target.value } })} className="bg-background font-mono text-xs" dir="ltr" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">المفتاح السري (Secret Key)</Label><Input type="password" value={methodForm.details.secret_key} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, secret_key: e.target.value } })} className="bg-background font-mono text-xs" dir="ltr" /></div>
                </div>
              </div>
            )}

            {/* حقول التحويل البنكي */}
            {methodForm.type === 'bank_transfer' && (
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs sm:text-sm font-bold text-blue-700 flex items-center gap-1.5"><Building2 className="w-4 h-4" /> بيانات الحساب البنكي</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">اسم البنك</Label><Input value={methodForm.details.bank_name} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, bank_name: e.target.value } })} className="bg-background text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">اسم صاحب الحساب</Label><Input value={methodForm.details.account_name} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, account_name: e.target.value } })} className="bg-background text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">رقم الحساب</Label><Input value={methodForm.details.account_number} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, account_number: e.target.value } })} className="bg-background text-sm" dir="ltr" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">الآيبان (IBAN)</Label><Input value={methodForm.details.iban} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, iban: e.target.value } })} className="bg-background text-sm" dir="ltr" /></div>
                </div>
              </div>
            )}

            {/* حقول المحفظة الإلكترونية */}
            {methodForm.type === 'e_wallet' && (
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                <p className="text-xs sm:text-sm font-bold text-purple-700 flex items-center gap-1.5"><Wallet className="w-4 h-4" /> بيانات المحفظة الإلكترونية</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">اسم المحفظة (PayPal, STC Pay...)</Label><Input value={methodForm.details.wallet_provider} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, wallet_provider: e.target.value } })} className="bg-background text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">اسم المستلم / صاحب المحفظة</Label><Input value={methodForm.details.wallet_receiver} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, wallet_receiver: e.target.value } })} className="bg-background text-sm" /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label className="text-xs text-muted-foreground">رقم الإيداع / رقم المحفظة / الإيميل</Label><Input value={methodForm.details.wallet_number} onChange={(e) => setMethodForm({ ...methodForm, details: { ...methodForm.details, wallet_number: e.target.value } })} className="bg-background text-sm font-mono" dir="ltr" /></div>
                </div>
              </div>
            )}

            {/* تعليمات الدفع (إلزامية للـ COD، اختيارية للبقية) */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-bold flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary" /> {methodForm.type === 'cod' ? 'وصف / تعليمات الدفع عند الاستلام' : 'تعليمات تظهر للعميل عند الدفع'}</Label>
              <Textarea value={methodForm.instructions} onChange={(e) => setMethodForm({ ...methodForm, instructions: e.target.value })} placeholder={methodForm.type === 'cod' ? 'سيتم تسليم الطلبية والدفع لشركة الشحن مباشرة...' : 'مثال: يرجى تحويل المبلغ للحساب المذكور وإرفاق صورة الإيصال...'} className="min-h-[100px] bg-muted/50 resize-none text-xs sm:text-sm leading-relaxed" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="ghost" className="text-xs sm:text-sm h-10" onClick={() => setMethodModalOpen(false)}>إلغاء</Button>
              <Button onClick={handleSaveMethod} className="gradient-bg text-white px-6 sm:px-8 rounded-xl shadow-lg shadow-primary/20 text-xs sm:text-sm h-10">حفظ الإعدادات</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}