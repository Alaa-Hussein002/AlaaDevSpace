import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function ImageUpload({ value, onChange, folder = 'general', label = 'صورة', className = '' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('يرجى اختيار صورة');
    if (file.size > 10 * 1024 * 1024) return toast.error('الحد الأقصى 10 ميجا');

    setUploading(true);
    setImgError(false); // إعادة ضبط حالة الخطأ عند رفع صورة جديدة
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const { data } = await adminAPI.uploadMedia(formData);
      const url = data.data?.file_url || data.data?.file_path;

      // بناء الرابط المضمون (يدعم روابط Cloudinary والرابط المباشر)
      const fullUrl = url?.startsWith('http') ? url : url;
      onChange(fullUrl);
      toast.success('تم رفع الصورة');
    } catch (e) {
      toast.error('فشل رفع الصورة');
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setImgError(false);
    onChange(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-2"
          >
            {/* حاوية المعاينة */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square flex items-center justify-center">
              {imgError ? (
                <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mb-1 opacity-40" />
                  <span className="text-xs">الصورة غير متاحة</span>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              )}

              {/* مؤشر التحميل في حال الرفع فوق صورة موجودة */}
              {uploading && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* ✅ أزرار التحكم ظاهرة وثابتة أسفل الصورة دائمًا */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                className="flex-1 text-xs h-8 gap-1.5"
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تغيير
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={uploading}
                className="flex-1 text-xs h-8 gap-1.5"
                onClick={handleRemove}
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all aspect-square flex flex-col items-center justify-center ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">جاري الرفع...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">اضغط أو اسحب الصورة هنا</p>
                  <p className="text-[10px] text-muted-foreground/70">PNG, JPG حتى 10MB</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}