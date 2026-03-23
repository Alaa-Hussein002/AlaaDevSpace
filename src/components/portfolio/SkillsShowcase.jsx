import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Code2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';

/* ============================================ */
/*  شريط الإتقان المتحرك                       */
/* ============================================ */
function AnimatedBar({ value, color, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${value}%` } : {}}
        transition={{ duration: 1, delay: delay * 0.08 + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-full rounded-full relative"
        style={{
          background: `linear-gradient(90deg, ${color}60, ${color})`,
        }}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </motion.div>
    </div>
  );
}

/* ============================================ */
/*  بطاقة تقنية واحدة — التصميم المُحسّن       */
/* ============================================ */
function TechCard({ tech, color, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.06 + 0.2, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
    >
      <motion.div
        animate={{
          scale: hovered ? 1.02 : 1,
          y: hovered ? -2 : 0,
        }}
        transition={{ duration: 0.25 }}
        className={`relative p-4 rounded-xl border transition-all duration-300 ${
          hovered
            ? 'border-border/60 bg-card/80 shadow-xl shadow-primary/5'
            : 'border-border/30 bg-card/40'
        }`}
      >
        {/* خط علوي متوهج عند hover */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          animate={{ opacity: hovered ? 0.7 : 0, scaleX: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />

        {/* الصف العلوي: الاسم + النسبة */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* أيقونة النقطة الملونة */}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300"
              style={{
                backgroundColor: color,
                boxShadow: hovered ? `0 0 10px ${color}60` : 'none',
              }}
            />

            {/* اسم التقنية — واضح وكبير */}
            <span className={`text-sm font-semibold transition-colors duration-300 truncate ${
              hovered ? 'text-foreground' : 'text-foreground/80'
            }`}>
              {tech.name}
            </span>

            {/* نجمة المميزة */}
            {tech.is_featured && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>

          {/* النسبة */}
          <motion.span
            animate={{
              scale: hovered ? 1.15 : 1,
            }}
            className="text-sm font-bold shrink-0 mr-2"
            style={{ color }}
          >
            {tech.proficiency}%
          </motion.span>
        </div>

        {/* شريط الإتقان */}
        <AnimatedBar value={tech.proficiency} color={color} delay={delay} />

        {/* سنوات الخبرة — تظهر دائماً إن وجدت */}
        {tech.years_of_experience > 0 && (
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[11px] text-muted-foreground">
              {tech.years_of_experience} {tech.years_of_experience === 1 ? 'سنة خبرة' : tech.years_of_experience <= 10 ? 'سنوات خبرة' : 'سنة خبرة'}
            </span>
            {/* مستوى الإتقان */}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${color}12`,
                color: color,
              }}
            >
              {tech.proficiency >= 90 ? 'خبير' :
               tech.proficiency >= 70 ? 'متقدم' :
               tech.proficiency >= 50 ? 'متوسط' : 'مبتدئ'}
            </span>
          </div>
        )}

        {/* خط سفلي خفيف */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px rounded-b-xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
          animate={{ opacity: hovered ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ============================================ */
/*  القسم الرئيسي: عرض المهارات                 */
/* ============================================ */
export default function SkillsShowcase() {
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await publicAPI.getSkills();
        setAllSkills(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ═══ فلترة: إظهار المنشورة فقط ═══
  const skills = allSkills.filter(s => s.is_published !== false);

  if (loading || skills.length === 0) return null;

  // ═══ تأكد أن activeCategory لا يتجاوز الحدود ═══
  const safeIndex = activeCategory >= skills.length ? 0 : activeCategory;
  const currentSkill = skills[safeIndex];
  const totalTechs = skills.reduce((s, c) => s + (c.technologies?.length || 0), 0);
  const totalFeatured = skills.reduce((s, c) => s + (c.technologies || []).filter(t => t.is_featured).length, 0);

  return (
    <section className="py-20 px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
        <div className="absolute inset-0 grid-bg opacity-15" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

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
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            المهارات <span className="gradient-text">التقنية</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {totalTechs}+ تقنية وأداة أستخدمها لبناء حلول برمجية متكاملة
          </p>
        </motion.div>

        {/* ═══ التبويبات ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm">
            {skills.map((skill, i) => {
              const isActive = safeIndex === i;
              const techCount = (skill.technologies || []).length;
              return (
                <button
                  key={skill.id || i}
                  onClick={() => setActiveCategory(i)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSkillTab"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${skill.color}dd, ${skill.color}88)`,
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 text-base">{skill.icon}</span>
                  <span className="relative z-10 hidden sm:inline">
                    {skill.category?.ar || skill.category?.en}
                  </span>
                  {/* عدد التقنيات */}
                  <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-md transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {techCount}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ محتوى الفئة النشطة ═══ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {/* رأس الفئة */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm"
                  style={{
                    backgroundColor: `${currentSkill.color}15`,
                    border: `1px solid ${currentSkill.color}25`,
                  }}
                >
                  {currentSkill.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {currentSkill.category?.ar || currentSkill.category?.en}
                  </h3>
                  {currentSkill.category?.en && currentSkill.category?.ar && (
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {currentSkill.category.en}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: `${currentSkill.color}40`,
                    color: currentSkill.color,
                  }}
                >
                  <Code2 className="w-3 h-3 ml-1" />
                  {(currentSkill.technologies || []).length} تقنية
                </Badge>
                {(currentSkill.technologies || []).filter(t => t.is_featured).length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-amber-400/40 text-amber-500"
                  >
                    <Star className="w-3 h-3 ml-1 fill-amber-400" />
                    {(currentSkill.technologies || []).filter(t => t.is_featured).length} مميزة
                  </Badge>
                )}
              </div>
            </div>

            {/* شبكة التقنيات */}
            {(currentSkill.technologies || []).length === 0 ? (
              <div className="text-center py-16">
                <Code2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لا توجد تقنيات في هذه الفئة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(currentSkill.technologies || [])
                  .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
                  .map((tech, i) => (
                    <TechCard
                      key={tech.name}
                      tech={tech}
                      color={currentSkill.color || '#3b82f6'}
                      delay={i}
                    />
                  ))}
              </div>
            )}

            {/* ═══ إحصائية الفئة ═══ */}
            {(currentSkill.technologies || []).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 py-4 px-6 rounded-xl bg-card/30 border border-border/20"
              >
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">عدد التقنيات</p>
                  <p className="text-lg font-bold" style={{ color: currentSkill.color }}>
                    {(currentSkill.technologies || []).length}
                  </p>
                </div>
                <div className="w-px h-8 bg-border/30 hidden sm:block" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">متوسط الإتقان</p>
                  <p className="text-lg font-bold" style={{ color: currentSkill.color }}>
                    {Math.round(
                      (currentSkill.technologies || []).reduce(
                        (s, t) => s + (t.proficiency || 0), 0
                      ) / (currentSkill.technologies || []).length
                    )}%
                  </p>
                </div>
                <div className="w-px h-8 bg-border/30 hidden sm:block" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">أعلى إتقان</p>
                  <p className="text-lg font-bold" style={{ color: currentSkill.color }}>
                    {Math.max(...(currentSkill.technologies || []).map(t => t.proficiency || 0))}%
                  </p>
                </div>
                <div className="w-px h-8 bg-border/30 hidden sm:block" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">مهارات مميزة</p>
                  <p className="text-lg font-bold text-amber-400">
                    {(currentSkill.technologies || []).filter(t => t.is_featured).length}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}