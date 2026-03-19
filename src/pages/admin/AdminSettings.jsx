import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Globe, CreditCard, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getSettings();
      setSettings(data.data || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveSettings = async (group, key, value) => {
    setSaving(true);
    try {
      await adminAPI.updateSetting({ group, key, value });
      toast.success('تم حفظ الإعدادات');
      load();
    } catch (e) { toast.error('فشل الحفظ'); }
    finally { setSaving(false); }
  };

  const siteSettings = settings.site_settings || {};
  const paymentSettings = settings.payment_settings || {};

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold">الإعدادات</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="text-xs"><Globe className="w-3 h-3 ml-1" /> عام</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs"><CreditCard className="w-3 h-3 ml-1" /> الدفع</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6 border-border/50">
            <h3 className="font-bold mb-4">إعدادات الموقع</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الموقع (عربي)</Label>
                  <Input value={siteSettings.site_name?.ar || ''} readOnly className="h-10 bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>اسم الموقع (إنجليزي)</Label>
                  <Input value={siteSettings.site_name?.en || ''} readOnly className="h-10 bg-muted" dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>اللون الأساسي</Label>
                <Input value={siteSettings.primary_color || '#2563eb'} readOnly className="h-10 bg-muted w-40" dir="ltr" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!siteSettings.maintenance_mode} disabled />
                <Label>الموقع يعمل (إيقاف = وضع الصيانة)</Label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6 border-border/50">
            <h3 className="font-bold mb-4">إعدادات الدفع</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>العملة الافتراضية</Label>
                <Input value={paymentSettings.default_currency || 'USD'} readOnly className="h-10 bg-muted w-32" dir="ltr" />
              </div>
              <div className="space-y-3">
                <Label>طرق الدفع المفعلة</Label>
                {Object.entries(paymentSettings.payment_methods || {}).map(([key, method]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span>{method.icon}</span>
                      <span className="text-sm font-medium">{method.label?.ar || key}</span>
                    </div>
                    <Badge variant={method.enabled ? 'default' : 'secondary'} className={method.enabled ? 'bg-green-500 text-white' : ''}>
                      {method.enabled ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}