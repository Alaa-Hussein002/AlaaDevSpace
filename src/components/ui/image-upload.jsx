import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminAPI } from '@/api/services';

export default function ImageUpload({ value, onChange, folder = 'general', label = 'صورة', className = '' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('يرجى اختيار صورة');
    if (file.size > 10 * 1024 * 1024) return toast.error('الحد الأقصى 10 ميجا');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const { data } = await adminAPI.uploadMedia(formData);
      const url = data.data?.file_url || data.data?.file_path;

      // بناء الرابط الكامل
      const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
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
    onChange(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">{label}</label>

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group rounded-xl overflow-hidden border border-border bg-muted"
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover"
              onError={(e) => { e.target.src = ''; e.target.className = 'hidden'; }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-lg text-xs"
                onClick={() => inputRef.current?.click()}
              >
                تغيير
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="rounded-lg text-xs"
                onClick={handleRemove}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  اسحب الصورة هنا أو <span className="text-primary font-medium">اختر ملف</span>
                </p>
                <p className="text-[10px] text-muted-foreground/60">PNG, JPG, WEBP — حتى 10MB</p>
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