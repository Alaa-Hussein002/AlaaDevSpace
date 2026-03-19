import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Reply, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getMessages();
      setMessages(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyText('');
    if (msg.status === 'unread') {
      try { await adminAPI.getMessage(msg._id); } catch (e) {}
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error('اكتب الرد');
    setReplying(true);
    try {
      await adminAPI.replyMessage(selected._id, { reply: replyText });
      toast.success('تم إرسال الرد');
      setSelected(null);
      load();
    } catch (e) { toast.error('فشل الإرسال'); }
    finally { setReplying(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف الرسالة؟')) return;
    try {
      await adminAPI.deleteMessage(id);
      toast.success('تم الحذف');
      load();
    } catch (e) { toast.error('فشل'); }
  };

  const statusIcon = { unread: Mail, read: MailOpen, replied: Reply };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold">الرسائل</h1>
        <p className="text-sm text-muted-foreground">{messages.filter(m => m.status === 'unread').length} غير مقروءة</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد رسائل</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, i) => {
            const Icon = statusIcon[msg.status] || Mail;
            return (
              <motion.div key={msg._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className={`p-4 border-border/50 cursor-pointer hover:shadow-sm transition-all ${msg.status === 'unread' ? 'bg-primary/[0.02] border-primary/20' : ''}`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${msg.status === 'unread' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`w-4 h-4 ${msg.status === 'unread' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm ${msg.status === 'unread' ? 'font-bold' : 'font-medium'}`}>{msg.name}</span>
                        <Badge variant="secondary" className="text-[9px]">{msg.status === 'unread' ? 'جديدة' : msg.status === 'replied' ? 'تم الرد' : 'مقروءة'}</Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground/80 mb-0.5">{msg.subject}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleDateString('ar')}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog عرض الرسالة */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>رسالة من {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">البريد:</span> <span className="font-medium">{selected.email}</span></div>
                <div><span className="text-muted-foreground">الهاتف:</span> <span className="font-medium">{selected.phone || '—'}</span></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">الموضوع</p>
                <p className="text-sm font-medium">{selected.subject}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm leading-relaxed">{selected.message}</p>
              </div>

              {selected.reply && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-primary font-medium mb-1">ردك:</p>
                  <p className="text-sm">{selected.reply}</p>
                </div>
              )}

              {selected.status !== 'replied' && (
                <div className="space-y-2">
                  <Textarea placeholder="اكتب ردك..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[80px] bg-background resize-none" />
                  <Button onClick={handleReply} disabled={replying} className="gradient-bg text-white rounded-xl w-full">
                    <Reply className="w-4 h-4 ml-2" />
                    {replying ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}