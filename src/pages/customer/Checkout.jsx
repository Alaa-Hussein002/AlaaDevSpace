import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Landmark, Loader2, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { customerAPI, publicAPI } from '@/api/services';

const methodIcons = { bank_transfer: Landmark, wallet: Wallet, cash_point: CreditCard };

export default function Checkout() {
  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    fetchCart();
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const { data } = await publicAPI.getPaymentMethods();
      setMethods(data.data || []);
      if (data.data?.length > 0) setSelectedMethod(data.data[0].key);
    } catch (e) {}
  };

  const handlePlaceOrder = async () => {
    if (!selectedMethod) return toast.error('اختر طريقة الدفع');
    setPlacing(true);
    try {
      const { data } = await customerAPI.createOrder({
        payment_method: selectedMethod,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        customer_note: note,
      });
      setOrderPlaced(data.data);
      toast.success('تم إنشاء الطلب بنجاح!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل إنشاء الطلب');
    } finally { setPlacing(false); }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 max-w-md text-center border-border/50">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">تم إنشاء طلبك!</h2>
            <p className="text-muted-foreground text-sm mb-4">رقم الطلب: <span className="font-mono font-bold text-primary">{orderPlaced.order_number}</span></p>
            <p className="text-xs text-muted-foreground mb-6">يرجى إتمام الدفع عبر {selectedMethod === 'bank_transfer' ? 'التحويل البنكي' : selectedMethod === 'wallet' ? 'المحفظة' : 'نقطة الحساب'} ثم إرسال إثبات الدفع</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/my-orders')} className="gradient-bg text-white rounded-xl">متابعة طلباتي</Button>
              <Button onClick={() => navigate('/store')} variant="outline" className="rounded-xl">تصفح المتجر</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">إتمام الشراء</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">السلة فارغة</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* طريقة الدفع */}
              <Card className="p-5 border-border/50">
                <h3 className="font-bold mb-4">طريقة الدفع</h3>
                <div className="space-y-2">
                  {methods.map((method) => {
                    const Icon = methodIcons[method.key] || CreditCard;
                    return (
                      <button
                        key={method.key}
                        onClick={() => setSelectedMethod(method.key)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          selectedMethod === method.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedMethod === method.key ? 'bg-primary text-white' : 'bg-muted'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-right flex-1">
                          <p className="font-medium text-sm">{method.label?.ar || method.key}</p>
                          {method.instructions?.ar && <p className="text-[10px] text-muted-foreground">{method.instructions.ar}</p>}
                        </div>
                        {selectedMethod === method.key && <Check className="w-5 h-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                {/* تفاصيل الدفع */}
                {selectedMethod && methods.find((m) => m.key === selectedMethod) && (
                  <div className="mt-4 p-4 rounded-xl bg-muted/50 space-y-2 text-sm">
                    {methods.find((m) => m.key === selectedMethod)?.accounts?.map((acc, i) => (
                      <div key={i}>
                        <p className="font-medium">{acc.bank_name}</p>
                        <p className="text-muted-foreground font-mono">{acc.account_number}</p>
                        <p className="text-muted-foreground">{acc.account_holder}</p>
                      </div>
                    ))}
                    {methods.find((m) => m.key === selectedMethod)?.wallets?.map((w, i) => (
                      <div key={i}>
                        <p className="font-medium">{w.provider}</p>
                        <p className="text-muted-foreground font-mono">{w.number}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* ملاحظة */}
              <Card className="p-5 border-border/50">
                <Label className="mb-2 block">ملاحظة (اختياري)</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[60px] bg-background resize-none" placeholder="أي ملاحظات على الطلب..." />
              </Card>
            </div>

            {/* الملخص */}
            <div>
              <Card className="p-5 border-border/50 sticky top-24 space-y-4">
                <h3 className="font-bold">ملخص الطلب</h3>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[180px]">{item.product_name?.ar || item.product_name} ×{item.quantity}</span>
                      <span className="font-medium">${item.total_price}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">المجموع</span><span>${cart?.subtotal || 0}</span></div>
                  {cart?.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>-${cart.discount_amount}</span></div>}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span className="text-primary">${cart?.total || 0}</span></div>
                </div>
                <Button onClick={handlePlaceOrder} disabled={placing} className="w-full h-12 gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 text-base">
                  {placing ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : null}
                  {placing ? 'جاري إنشاء الطلب...' : `تأكيد الطلب — $${cart?.total || 0}`}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}