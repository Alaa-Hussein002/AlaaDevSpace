import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MailOpen, Reply, Trash2, AlertTriangle, Clock, Search,
  Filter, Archive, Shield, Download, Eye, PhoneCall, MapPin,
  Calendar, User, Tag, AlertCircle, CheckCircle2, XCircle,
  MoreVertical, RefreshCw, TrendingUp, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getMessages();
      setMessages(data.data || []);
    } catch (e) {
      toast.error('فشل تحميل الرسائل');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyText(msg.reply || '');
    if (msg.status === 'unread') {
      try {
        await adminAPI.getMessage(msg.id);  // ✅ تصحيح
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));  // ✅
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReply = async (sendMethod = 'none') => {
    if (!replyText.trim()) {
      toast.error('الرجاء كتابة الرد');
      return;
    }
  
    setReplying(true);
    
    try {
      const { data } = await adminAPI.replyMessage(selected.id, { 
        reply: replyText,
        send_method: sendMethod 
      });
  
      toast.success('تم حفظ الرد بنجاح');
      
      // التوجيه حسب طريقة الإرسال
      if (sendMethod === 'email' || sendMethod === 'both') {
        const subject = encodeURIComponent(`رد على: ${selected.subject}`);
        const body = encodeURIComponent(replyText);
        const mailtoLink = `mailto:${selected.email}?subject=${subject}&body=${body}`;
        
        // فتح تطبيق البريد
        window.open(mailtoLink, '_blank');
        
        if (sendMethod === 'email') {
          toast.info('تم فتح تطبيق البريد الإلكتروني');
        }
      }
  
      if (sendMethod === 'whatsapp' || sendMethod === 'both') {
        // تنظيف رقم الهاتف من المسافات والرموز
        const phoneNumber = selected.phone.replace(/[^0-9+]/g, '');
        const message = encodeURIComponent(
          `مرحباً ${selected.name},\n\n` +
          `بخصوص رسالتك: "${selected.subject}"\n\n` +
          `${replyText}\n\n` +
          `تحياتي`
        );
        
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;
        
        // فتح واتساب
        window.open(whatsappLink, '_blank');
        
        if (sendMethod === 'both') {
          setTimeout(() => {
            toast.info('تم فتح واتساب أيضاً');
          }, 1000);
        } else {
          toast.info('تم فتح واتساب');
        }
      }
  
      // إغلاق الـ Dialog وتحديث القائمة
      setTimeout(() => {
        setSelected(null);
        load();
      }, sendMethod === 'none' ? 500 : 2000);
      
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(error.response?.data?.message || 'فشل حفظ الرد');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await adminAPI.deleteMessage(id);
      toast.success('تم حذف الرسالة');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      toast.error('فشل الحذف');
    }
  };

  const handleMarkAsSpam = async (id, e) => {
    e?.stopPropagation();
    try {
      await adminAPI.markAsSpam(id);
      toast.success('تم تأشير الرسالة كمزعجة');
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_spam: true, status: 'spam' } : m));
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      toast.error('فشل العملية');
    }
  };

  // Filtering and Search
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || msg.category === filterCategory;
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'unread' && msg.status === 'unread') ||
      (activeTab === 'read' && msg.status === 'read') ||
      (activeTab === 'replied' && msg.status === 'replied') ||
      (activeTab === 'spam' && msg.is_spam);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesTab && !msg.is_spam;
  });

  // Statistics
  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread' && !m.is_spam).length,
    read: messages.filter(m => m.status === 'read' && !m.is_spam).length,
    replied: messages.filter(m => m.status === 'replied' && !m.is_spam).length,
    spam: messages.filter(m => m.is_spam).length,
    highPriority: messages.filter(m => m.priority === 'high' && !m.is_spam).length,
  };

  // Status Config
  const statusConfig = {
    unread: { icon: Mail, label: 'جديدة', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    read: { icon: MailOpen, label: 'مقروءة', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    replied: { icon: Reply, label: 'تم الرد', color: 'text-green-500', bg: 'bg-green-500/10' },
    spam: { icon: AlertTriangle, label: 'مزعجة', color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  // Priority Config
  const priorityConfig = {
    low: { label: 'منخفضة', color: 'bg-gray-500' },
    medium: { label: 'متوسطة', color: 'bg-blue-500' },
    high: { label: 'عالية', color: 'bg-orange-500' },
    urgent: { label: 'عاجلة', color: 'bg-red-500' },
  };

  // Category Config
  const categoryConfig = {
    general: { label: 'عام', icon: Inbox },
    support: { label: 'دعم فني', icon: Shield },
    sales: { label: 'مبيعات', icon: TrendingUp },
    feedback: { label: 'ملاحظات', icon: AlertCircle },
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            إدارة الرسائل
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} رسالة - {stats.unread} غير مقروءة
          </p>
        </div>
        <Button onClick={refresh} disabled={refreshing} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, icon: Inbox, color: 'from-blue-500 to-blue-600' },
          { label: 'جديدة', value: stats.unread, icon: Mail, color: 'from-purple-500 to-purple-600' },
          { label: 'مقروءة', value: stats.read, icon: MailOpen, color: 'from-gray-500 to-gray-600' },
          { label: 'تم الرد', value: stats.replied, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
          { label: 'عالية الأولوية', value: stats.highPriority, icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
          { label: 'مزعجة', value: stats.spam, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <Card className="p-4 border-border/50">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الرسائل (الاسم، البريد، الموضوع، المحتوى...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="unread">جديدة</SelectItem>
                <SelectItem value="read">مقروءة</SelectItem>
                <SelectItem value="replied">تم الرد</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="general">عام</SelectItem>
                <SelectItem value="support">دعم فني</SelectItem>
                <SelectItem value="sales">مبيعات</SelectItem>
                <SelectItem value="feedback">ملاحظات</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterCategory('all');
                }}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                مسح
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all" className="gap-2">
            <Inbox className="w-4 h-4" />
            <span className="hidden sm:inline">الكل</span>
            <Badge variant="secondary" className="text-xs">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">جديدة</span>
            {stats.unread > 0 && <Badge variant="default" className="text-xs">{stats.unread}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-2">
            <MailOpen className="w-4 h-4" />
            <span className="hidden sm:inline">مقروءة</span>
          </TabsTrigger>
          <TabsTrigger value="replied" className="gap-2">
            <Reply className="w-4 h-4" />
            <span className="hidden sm:inline">تم الرد</span>
          </TabsTrigger>
          <TabsTrigger value="spam" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">مزعجة</span>
            {stats.spam > 0 && <Badge variant="destructive" className="text-xs">{stats.spam}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Messages List */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} className="p-4 border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card className="p-16 text-center border-border/50">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold mb-2">لا توجد رسائل</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                  ? 'لم يتم العثور على نتائج مطابقة للفلاتر المحددة'
                  : 'لم يتم استلام أي رسائل بعد'}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredMessages.map((msg, i) => {
                  const StatusIcon = statusConfig[msg.status]?.icon || Mail;
                  const CategoryIcon = categoryConfig[msg.category]?.icon || Inbox;
                  const priority = priorityConfig[msg.priority] || priorityConfig.medium;

                  return (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Card
                        className={`p-4 border-border/50 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group ${
                          msg.status === 'unread' ? 'bg-primary/[0.02] border-primary/20' : ''
                        } ${msg.priority === 'high' || msg.priority === 'urgent' ? 'border-r-4 border-r-orange-500' : ''}`}
                        onClick={() => openMessage(msg)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar/Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusConfig[msg.status]?.bg || 'bg-muted'}`}>
                            <StatusIcon className={`w-6 h-6 ${statusConfig[msg.status]?.color || 'text-muted-foreground'}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`text-sm font-semibold ${msg.status === 'unread' ? 'text-foreground' : 'text-foreground/80'}`}>
                                  {msg.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {statusConfig[msg.status]?.label}
                                </Badge>
                                {msg.priority && (
                                  <Badge className={`text-xs text-white ${priority.color}`}>
                                    {priority.label}
                                  </Badge>
                                )}
                                {msg.category && (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <CategoryIcon className="w-3 h-3" />
                                    {categoryConfig[msg.category]?.label}
                                  </Badge>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(msg.created_at)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openMessage(msg)} className="gap-2">
                                      <Eye className="w-4 h-4" />
                                      عرض
                                    </DropdownMenuItem>
                                    {msg.status !== 'replied' && (
                                      <DropdownMenuItem onClick={() => openMessage(msg)} className="gap-2">
                                        <Reply className="w-4 h-4" />
                                        رد
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => handleMarkAsSpam(msg.id, e)} className="gap-2 text-orange-600">  {/* ✅ */}
                                      <AlertTriangle className="w-4 h-4" />
                                      تأشير كمزعجة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => handleDelete(msg.id, e)} className="gap-2 text-red-600">  {/* ✅ */}
                                      <Trash2 className="w-4 h-4" />
                                      حذف
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Subject */}
                            <p className={`text-sm ${msg.status === 'unread' ? 'font-semibold' : 'font-medium'} text-foreground/90`}>
                              {msg.subject}
                            </p>

                            {/* Message Preview */}
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {msg.message}
                            </p>

                            {/* Footer Info */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {msg.email}
                              </span>
                              {msg.phone && (
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3" />
                                  {msg.phone}
                                </span>
                              )}
                              {msg.ip_address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {msg.ip_address}
                                </span>
                              )}
                              {msg.replied_at && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  تم الرد {formatDate(msg.replied_at)}
                                </span>
                              )}
                            </div>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex items-center gap-2 pt-2">
                                <Download className="w-4 h-4 text-primary" />
                                <span className="text-xs text-primary font-medium">
                                  {msg.attachments.length} مرفق
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Tabs>

      {/* Message Details Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl">تفاصيل الرسالة</DialogTitle>
            <DialogDescription>
              {selected && `رسالة من ${selected.name} - ${formatDate(selected.created_at)}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-6 mt-4">
              {/* Sender Info Card */}
              <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">الاسم</p>
                          <p className="font-semibold">{selected.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                          <p className="font-medium text-sm">{selected.email}</p>
                        </div>
                      </div>
                      {selected.phone && (
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                            <p className="font-medium">{selected.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">تاريخ الإرسال</p>
                          <p className="font-medium text-sm">{new Date(selected.created_at).toLocaleString('ar-SA')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-primary/20">
                      <Badge variant="outline" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {statusConfig[selected.status]?.label}
                      </Badge>
                      {selected.priority && (
                        <Badge className={`text-white ${priorityConfig[selected.priority]?.color}`}>
                          الأولوية: {priorityConfig[selected.priority]?.label}
                        </Badge>
                      )}
                      {selected.category && (
                        <Badge variant="secondary" className="gap-1">
                          {(() => {
                            const CategoryIcon = categoryConfig[selected.category]?.icon;
                            return CategoryIcon ? <CategoryIcon className="w-3 h-3" /> : null;
                          })()}
                          {categoryConfig[selected.category]?.label}
                        </Badge>
                      )}
                      {selected.ip_address && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          {selected.ip_address}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">الموضوع</label>
                <Card className="p-4 bg-muted/30">
                  <p className="font-semibold text-lg">{selected.subject}</p>
                </Card>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">نص الرسالة</label>
                <Card className="p-5 bg-background">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </Card>
              </div>

              {/* Attachments */}
              {selected.attachments && selected.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">المرفقات ({selected.attachments.length})</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selected.attachments.map((file, idx) => (
                      <Card key={idx} className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <Download className="w-5 h-5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name || `مرفق ${idx + 1}`}</p>
                          <p className="text-xs text-muted-foreground">{file.size || 'غير معروف'}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Reply */}
              {selected.status === 'replied' && selected.reply && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">الرد السابق</label>
                  <Card className="p-5 bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-700 mb-1">تم الرد على هذه الرسالة</p>
                        {selected.replied_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(selected.replied_at).toLocaleString('ar-SA')}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap pr-8">{selected.reply}</p>
                  </Card>
                </div>
              )}

              {/* Reply Section */}
              {selected.status !== 'replied' && (
                <div className="space-y-4 pt-4 border-t">
                  <label className="text-sm font-medium text-foreground block">كتابة الرد</label>
                  <Textarea
                    placeholder="اكتب ردك هنا..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[150px] resize-none"
                    dir="rtl"
                  />
                  
                  {/* Send Options */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">اختر طريقة الإرسال:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Email Option */}
                      {selected.email && (
                        <Button
                          onClick={() => handleReply('email')}
                          disabled={replying || !replyText.trim()}
                          variant="outline"
                          className="h-auto py-4 px-4 flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all group"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-sm text-foreground">إرسال عبر البريد الإلكتروني</p>
                              <p className="text-xs text-muted-foreground truncate">{selected.email}</p>
                            </div>
                          </div>
                        </Button>
                      )}
              
                      {/* WhatsApp Option */}
                      {selected.phone && (
                        <Button
                          onClick={() => handleReply('whatsapp')}
                          disabled={replying || !replyText.trim()}
                          variant="outline"
                          className="h-auto py-4 px-4 flex-col items-start gap-2 hover:bg-green-50 hover:border-green-300 transition-all group"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center transition-colors">
                              <PhoneCall className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-sm text-foreground">إرسال عبر واتساب</p>
                              <p className="text-xs text-muted-foreground">{selected.phone}</p>
                            </div>
                          </div>
                        </Button>
                      )}
                    </div>
              
                    {/* Both Options (if available) */}
                    {selected.email && selected.phone && (
                      <Button
                        onClick={() => handleReply('both')}
                        disabled={replying || !replyText.trim()}
                        className="w-full gradient-bg text-white rounded-xl h-12 gap-2 text-base font-semibold"
                      >
                        <Reply className="w-5 h-5" />
                        {replying ? 'جاري الحفظ...' : 'حفظ الرد وإرسال للبريد والواتساب'}
                      </Button>
                    )}
              
                    {/* Just Save (no send) */}
                    <Button
                      onClick={() => handleReply('none')}
                      disabled={replying || !replyText.trim()}
                      variant="outline"
                      className="w-full h-11 gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      {replying ? 'جاري الحفظ...' : 'حفظ الرد فقط (بدون إرسال)'}
                    </Button>
                  </div>
              
                  <Button
                    variant="ghost"
                    onClick={() => setSelected(null)}
                    className="w-full"
                  >
                    إلغاء
                  </Button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleMarkAsSpam(selected.id, e)} 
                  className="gap-2 text-orange-600 hover:text-orange-700"
                >
                  <AlertTriangle className="w-4 h-4" />
                  تأشير كمزعجة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleDelete(selected.id, e)} 
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف الرسالة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}