import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, Ticket, ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import useCartStore from '@/store/cartStore';

export default function CustomerCart() {
  const { cart, loading, fetchCart, removeItem, updateQuantity, applyCoupon, removeCoupon, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const result = await applyCoupon(couponCode);
    if (result.success) { toast.success('تم تطبيق الكوبون'); setCouponCode(''); }
    else toast.error(result.message);
    setApplyingCoupon(false);
  };

  const items = cart?.items || [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" /> سلة التسوق
          </h1>
        </motion.div>

        {loading ? (
          <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">سلتك فارغة</p>
            <Link to="/store"><Button variant="outline" className="rounded-xl mt-2">تصفح المتجر</Button></Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* المنتجات */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        {item.product_thumbnail ? <img src={item.product_thumbnail} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-muted-foreground/30" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{item.product_name?.ar || item.product_name?.en || item.product_name}</h3>
                        <p className="text-xs text-muted-foreground">${item.unit_price} للوحدة</p>
                      </div>
                      {item.product_type !== 'digital' && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      <div className="text-left shrink-0">
                        <p className="font-bold text-primary">${item.total_price}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" onClick={() => { removeItem(item.product_id); toast.success('تم الحذف'); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              <Button variant="ghost" size="sm" className="text-red-500 text-xs" onClick={() => { clearCart(); toast.success('تم تفريغ السلة'); }}>
                <Trash2 className="w-3 h-3 ml-1" /> تفريغ السلة
              </Button>
            </div>

            {/* الملخص */}
            <div>
              <Card className="p-5 border-border/50 sticky top-24 space-y-4">
                <h3 className="font-bold">ملخص الطلب</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span><span>${cart?.subtotal || 0}</span></div>
                  {cart?.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600"><span>الخصم</span><span>-${cart.discount_amount}</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span className="text-primary">${cart?.total || 0}</span></div>
                </div>

                {/* الكوبون */}
                {cart?.coupon_code ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Ticket className="w-3 h-3" /> {cart.coupon_code}</span>
                    <Button variant="ghost" size="sm" className="text-xs text-red-500 h-6" onClick={() => removeCoupon()}>إزالة</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="كود الخصم" className="h-9 bg-background text-xs font-mono" dir="ltr" />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applyingCoupon} className="h-9 text-xs shrink-0">
                      {applyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'تطبيق'}
                    </Button>
                  </div>
                )}

                <Button onClick={() => navigate('/checkout')} className="w-full h-11 gradient-bg text-white rounded-xl shadow-lg shadow-primary/20">
                  إتمام الشراء <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}