import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Calendar, Award, Code2, Building2,
  Clock, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';

/* ============================================ */
/*  ثوابت                                      */
/* ============================================ */
const TYPE_CONFIG = {
  full_time:  { label: 'دوام كامل', color: '#3b82f6' },
  part_time:  { label: 'دوام جزئي', color: '#8b5cf6' },
  freelance:  { label: 'عمل حر',   color: '#10b981' },
  internship: { label: 'تدريب',    color: '#f59e0b' },
  contract:   { label: 'عقد',      color: '#ec4899' },
};

function calcDuration(start, end, isCurrent) {
  if (!start) return '';
  const s = new Date(start);
  const e = isCurrent ? new Date() : (end ? new Date(end) : new Date());
  let months = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth();
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years > 0 && rem > 0) return `${years} سنة و ${rem} شهر`;
  if (years > 0) return `${years} سنة`;
  if (rem > 0) return `${rem} شهر`;
  return 'أقل من شهر';
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar', { year: 'numeric', month: 'short' });
}

/* ============================================ */
/*  بطاقة خبرة في Timeline                     */
/* ============================================ */
function TimelineItem({ item, index, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.full_time;
  const duration = calcDuration(item.start_date, item.end_date, item.is_current);
  const achCount = (item.achievements || []).length;
  const techCount = (item.technologies_used || []).length;
  const hasDetails = achCount > 0 || techCount > 0 || item.description?.ar || item.description?.en;

  return (
    <div ref={ref} className="relative flex gap-4 sm:gap-6 pb-10 sm:pb-12 last:pb-0">

      {/* ═══ خط Timeline + النقطة ═══ */}
      <div className="flex flex-col items-center shrink-0">
        {/* النقطة */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
          className={`relative z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] ${
            item.is_current
              ? 'border-green-500 bg-green-500'
              : 'border-border bg-background'
          }`}
          style={!item.is_current ? { borderColor: config.color } : {}}
        >
          {item.is_current && (
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-green-500"
            />
          )}
        </motion.div>

        {/* الخط */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            className="w-px flex-1 origin-top"
            style={{
              background: `linear-gradient(to bottom, ${config.color}40, ${config.color}10)`,
            }}
          />
        )}
      </div>

      {/* ═══ المحتوى ═══ */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
        className="flex-1 -mt-1 min-w-0"
      >
        {/* التاريخ */}
        <div className="flex items-center gap-2 mb-2 text-[11px] text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{formatDate(item.start_date)} — {item.is_current ? 'الآن' : formatDate(item.end_date)}</span>
          {duration && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="font-medium" style={{ color: config.color }}>{duration}</span>
            </>
          )}
        </div>

        {/* البطاقة */}
        <div className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
          expanded
            ? 'border-border/60 bg-card/80 shadow-lg shadow-primary/5'
            : 'border-border/30 bg-card/40 hover:border-border/50 hover:bg-card/60'
        }`}>
          <div className="p-4 sm:p-5">

            {/* الصف العلوي */}
            <div className="flex items-start gap-3">
              {/* شعار الشركة */}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center"
                style={{ borderColor: `${config.color}20`, backgroundColor: `${config.color}08` }}
              >
                {item.company_logo ? (
                  <img src={item.company_logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="w-5 h-5" style={{ color: `${config.color}50` }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* المسمى */}
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {item.position?.ar || item.position?.en}
                </h3>

                {/* الشركة + الموقع */}
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{item.company?.ar || item.company?.en}</span>
                  {item.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border inline-block" />
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {item.location}
                      </span>
                    </>
                  )}
                </p>

                {/* الشارات */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className="text-[9px] h-5"
                    style={{ borderColor: `${config.color}30`, color: config.color }}
                  >
                    {config.label}
                  </Badge>
                  {item.is_current && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] h-5 gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      حالياً
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* التقنيات (تظهر دائماً) */}
            {techCount > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {(item.technologies_used || []).slice(0, 5).map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[9px] rounded-md font-medium"
                    style={{
                      backgroundColor: `${config.color}08`,
                      color: config.color,
                      border: `1px solid ${config.color}12`,
                    }}
                  >
                    {t}
                  </span>
                ))}
                {techCount > 5 && (
                  <span className="px-2 py-0.5 text-[9px] rounded-md bg-muted text-muted-foreground">
                    +{techCount - 5}
                  </span>
                )}
              </div>
            )}

            {/* زر التوسيع */}
            {hasDetails && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary mt-3 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                {achCount > 0 && !expanded && (
                  <span className="text-[9px] text-muted-foreground/50"> • {achCount} إنجاز</span>
                )}
              </button>
            )}
          </div>

          {/* ═══ المحتوى المُوسّع ═══ */}
          <AnimatePresence>
            {expanded && hasDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-4 border-t border-border/30">

                  {/* الوصف */}
                  {(item.description?.ar || item.description?.en) && (
                    <p className="text-sm text-muted-foreground leading-relaxed pt-3">
                      {item.description?.ar || item.description?.en}
                    </p>
                  )}

                  {/* الإنجازات */}
                  {achCount > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" style={{ color: config.color }} />
                        الإنجازات
                      </h4>
                      <div className="space-y-1.5">
                        {(item.achievements || []).map((a, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ backgroundColor: config.color }}
                            />
                            <span>{a}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================ */
/*  القسم الرئيسي: عرض الخبرات                  */
/* ============================================ */
export default function ExperienceTimeline() {
  const [allExperiences, setAllExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await publicAPI.getExperiences();
        setAllExperiences(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ═══ فلترة: المنشورة فقط ═══
  const experiences = allExperiences.filter(exp => exp.is_published !== false);

  if (loading || experiences.length === 0) return null;

  const currentCount = experiences.filter(e => e.is_current).length;
  const totalYears = (() => {
    let months = 0;
    experiences.forEach(exp => {
      if (!exp.start_date) return;
      const s = new Date(exp.start_date);
      const e = exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date());
      months += (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth();
    });
    return Math.round(months / 12 * 10) / 10;
  })();

  return (
    <section className="py-20 px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-15" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* ═══ العنوان ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20"
          >
            <Briefcase className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            الخبرات <span className="gradient-text">العملية</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            مسيرتي المهنية والمشاريع التي عملت عليها
          </p>

          {/* إحصائيات سريعة */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span>{experiences.length} خبرة</span>
            </div>
            {totalYears > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>+{totalYears} سنة</span>
                </div>
              </>
            )}
            {currentCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{currentCount} حالي</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* ═══ Timeline ═══ */}
        <div className="pr-2">
          {experiences.map((exp, i) => (
            <TimelineItem
              key={exp.id || i}
              item={exp}
              index={i}
              isLast={i === experiences.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}