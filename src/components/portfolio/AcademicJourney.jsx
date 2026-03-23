import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Award, Calendar, ExternalLink, Medal,
  BookOpen, Hash, Clock, ArrowLeft, Verified, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';

/* ============================================ */
/*  Helpers                                     */
/* ============================================ */
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short' });
}
function formatYear(d) { return d ? new Date(d).getFullYear() : ''; }

/* ============================================ */
/*  خريطة التعليم — شريط أفقي مدمج             */
/* ============================================ */
function EducationRoadmap({ educations }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="mb-16">

      {/* ═══ Desktop: أفقي ═══ */}
      <div className="hidden md:block">
        <div className="relative">
          {/* الخط الأفقي */}
          <div className="relative h-[3px] mx-12">
            <div className="absolute inset-0 bg-border/20 rounded-full" />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 rounded-full origin-right"
              style={{ background: 'linear-gradient(90deg, #3b82f620, #3b82f6, #8b5cf6, #8b5cf620)' }}
            />

            {/* النقاط */}
            {educations.map((edu, i) => {
              const isActive = activeIndex === i;
              const pos = educations.length === 1
                ? 50
                : (i / (educations.length - 1)) * 100;

              return (
                <motion.div
                  key={edu.id || i}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 300 }}
                  className="absolute top-1/2"
                  style={{ right: `${pos}%`, transform: 'translateY(-50%) translateX(50%)' }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {/* النقطة */}
                  <motion.div
                    animate={{ scale: isActive ? 1.4 : 1 }}
                    className="relative cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-full border-[3px] transition-all duration-300 ${
                      edu.is_current
                        ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/40'
                        : isActive
                        ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/40'
                        : 'bg-background border-blue-500/50 hover:border-blue-500'
                    }`} />

                    {edu.is_current && (
                      <motion.div
                        animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-green-500"
                      />
                    )}
                  </motion.div>

                  {/* السنة تحت النقطة */}
                  <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                    {formatYear(edu.start_date)}
                  </span>

                  {/* البطاقة المنبثقة فوق النقطة */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
                      >
                        <div className="w-64 p-3 rounded-xl bg-card border border-border/60 shadow-2xl shadow-black/20 backdrop-blur-xl">
                          <div className="flex items-start gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-blue-500/20 bg-blue-500/5">
                              {edu.institution_logo ? (
                                <img src={edu.institution_logo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-blue-500/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs leading-tight line-clamp-2">
                                {edu.degree?.ar || edu.degree?.en}
                              </h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {edu.institution?.ar || edu.institution?.en}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-muted-foreground">
                                <Calendar className="w-2.5 h-2.5" />
                                {formatYear(edu.start_date)} — {edu.is_current ? 'الآن' : formatYear(edu.end_date)}
                                {edu.is_current && (
                                  <Badge className="bg-green-500/10 text-green-600 text-[8px] h-4 border-0 mr-1">
                                    حالياً
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* سهم */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card border-b border-r border-border/60" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* البطاقات الصغيرة تحت الخط */}
          <div
            className="grid gap-3 mt-16 px-6"
            style={{ gridTemplateColumns: `repeat(${educations.length}, 1fr)` }}
          >
            {educations.map((edu, i) => {
              const isActive = activeIndex === i;
              return (
                <motion.div
                  key={edu.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <motion.div
                    animate={{ y: isActive ? -4 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border cursor-default transition-all duration-300 ${
                      isActive
                        ? 'border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                        : 'border-border/30 bg-card/40 hover:border-border/50'
                    }`}
                  >
                    {/* صورة مصغرة */}
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border/30">
                      {edu.institution_logo ? (
                        <img src={edu.institution_logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-500/5 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-blue-500/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold leading-tight line-clamp-1">
                        {edu.degree?.ar || edu.degree?.en}
                      </p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">
                        {edu.institution?.ar || edu.institution?.en}
                      </p>
                    </div>
                    {edu.is_current && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Mobile: أفقي مبسط ═══ */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
          {educations.map((edu, i) => (
            <motion.div
              key={edu.id || i}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-[260px] snap-start"
            >
              <div className="relative flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/60">
                {/* خط يسار ملون */}
                <div className={`absolute top-0 bottom-0 right-0 w-[3px] rounded-r-xl ${
                  edu.is_current ? 'bg-green-500' : 'bg-blue-500/60'
                }`} />

                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-border/30 mr-1">
                  {edu.institution_logo ? (
                    <img src={edu.institution_logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-500/5 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-500/30" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">
                    {edu.degree?.ar || edu.degree?.en}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {edu.institution?.ar || edu.institution?.en}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] text-muted-foreground">
                      {formatYear(edu.start_date)} — {edu.is_current ? 'الآن' : formatYear(edu.end_date)}
                    </span>
                    {edu.is_current && (
                      <Badge className="bg-green-500/10 text-green-600 text-[8px] h-4 border-0">حالياً</Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/*  بطاقة شهادة                                 */
/* ============================================ */
function CertificateCard({ cert, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const amberShades = ['#f59e0b', '#d97706', '#b45309'];
  const shade = amberShades[index % amberShades.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.08 + 0.2, duration: 0.45 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
    >
      <motion.div
        animate={{ y: hovered ? -5 : 0 }}
        transition={{ duration: 0.25 }}
        className={`relative overflow-hidden rounded-2xl border transition-all duration-400 ${
          hovered
            ? 'border-amber-500/30 bg-card/90 shadow-2xl shadow-amber-500/10'
            : 'border-border/30 bg-card/50 shadow-sm'
        }`}
      >
        {/* توهج */}
        <motion.div
          animate={{ opacity: hovered ? 0.08 : 0 }}
          className="absolute -inset-4 rounded-3xl blur-2xl -z-10"
          style={{ background: `radial-gradient(circle, ${shade}, transparent)` }}
        />

        {/* خط علوي */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${shade}, transparent)` }}
          animate={{ opacity: hovered ? 1 : 0.3, scaleX: hovered ? 1 : 0.4 }}
        />

        {/* صورة الشهادة */}
        {cert.certificate_image && (
          <div className="relative h-32 overflow-hidden">
            <motion.img
              src={cert.certificate_image}
              alt=""
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

            {cert.credential_url && (
              <motion.div
                animate={{ rotate: hovered ? 0 : -10, scale: hovered ? 1.1 : 0.9 }}
                className="absolute top-3 left-3"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Verified className="w-3.5 h-3.5 text-white" />
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* الشعار + العنوان */}
          <div className="flex items-start gap-2.5 mb-3">
            <motion.div
              animate={{ rotate: hovered ? [0, -3, 3, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
              style={{ border: `1.5px solid ${shade}20`, backgroundColor: `${shade}06` }}
            >
              {cert.issuer_logo ? (
                <img src={cert.issuer_logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Award className="w-4.5 h-4.5" style={{ color: `${shade}50` }} />
              )}
            </motion.div>

            <div className="min-w-0 flex-1">
              <h4 className={`font-bold text-sm leading-tight line-clamp-2 transition-colors duration-300 ${
                hovered ? 'text-foreground' : 'text-foreground/85'
              }`}>
                {cert.title}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Medal className="w-3 h-3" style={{ color: shade }} />
                {cert.issuer}
              </p>
            </div>
          </div>

          {/* التاريخ + المعرف */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {cert.issue_date && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(cert.issue_date)}
              </span>
            )}
            {cert.credential_id && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md font-mono" dir="ltr">
                <Hash className="w-2.5 h-2.5" />
                {cert.credential_id}
              </span>
            )}
            {cert.has_expiry && cert.expiry_date && (
              <Badge variant="outline" className="text-[8px] h-4 border-red-500/30 text-red-500">
                ⏳ {formatDate(cert.expiry_date)}
              </Badge>
            )}
          </div>

          {/* المهارات */}
          {(cert.skills_gained || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {cert.skills_gained.slice(0, 4).map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.08 + i * 0.04 + 0.4 }}
                  className="px-1.5 py-0.5 text-[8px] rounded font-medium"
                  style={{ backgroundColor: `${shade}08`, color: shade, border: `1px solid ${shade}12` }}
                >
                  {s}
                </motion.span>
              ))}
              {cert.skills_gained.length > 4 && (
                <span className="px-1.5 py-0.5 text-[8px] rounded bg-muted text-muted-foreground">
                  +{cert.skills_gained.length - 4}
                </span>
              )}
            </div>
          )}

          {/* رابط التحقق */}
          {cert.credential_url && (
            <motion.a
              href={cert.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-medium rounded-lg px-2.5 py-1 transition-all duration-300"
              style={{
                backgroundColor: hovered ? `${shade}15` : `${shade}06`,
                color: shade,
                border: `1px solid ${hovered ? `${shade}25` : `${shade}10`}`,
              }}
              whileHover={{ x: -2 }}
            >
              <ExternalLink className="w-3 h-3" />
              تحقق
              <ArrowLeft className="w-3 h-3" />
            </motion.a>
          )}
        </div>

        {/* خط سفلي */}
        <motion.div
          className="h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${shade}, transparent)` }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ============================================ */
/*  القسم الرئيسي                               */
/* ============================================ */
export default function AcademicJourney() {
  const [educations, setEducations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eduRes, certRes] = await Promise.all([
          publicAPI.getEducations(),
          publicAPI.getCertificates(),
        ]);
        setEducations((eduRes.data.data || []).filter(e => e.is_published !== false));
        setCertificates((certRes.data.data || []).filter(c => c.is_published !== false));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading || (educations.length === 0 && certificates.length === 0)) return null;

  return (
    <section className="py-24 px-4 relative overflow-hidden" dir="rtl">
      {/* خلفيات */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-15" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[80px]"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ═══ العنوان ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/25"
          >
            <BookOpen className="w-7 h-7 text-white" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            المسيرة <span className="gradient-text">الأكاديمية</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            رحلتي التعليمية والشهادات المهنية التي شكلت خبرتي التقنية
          </p>

          {/* إحصائيات */}
          <div className="flex items-center justify-center gap-4 mt-5">
            {educations.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span>{educations.length} مؤهل</span>
              </div>
            )}
            {educations.length > 0 && certificates.length > 0 && (
              <span className="w-1 h-1 rounded-full bg-border" />
            )}
            {certificates.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{certificates.length} شهادة</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══ خريطة التعليم ═══ */}
        {educations.length > 0 && (
          <EducationRoadmap educations={educations} />
        )}

        {/* ═══ الشهادات ═══ */}
        {certificates.length > 0 && (
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f59e0bdd, #f59e0b88)', boxShadow: '0 4px 20px #f59e0b30' }}>
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">الشهادات المهنية</h3>
                  <Badge variant="outline" className="text-[10px] h-5 border-amber-500/40 text-amber-500">
                    {certificates.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">شهادات معتمدة في مجالات تقنية متعددة</p>
              </div>
            </motion.div>

            <div className={`grid gap-4 ${
              certificates.length === 1 ? 'grid-cols-1 max-w-sm' :
              certificates.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              certificates.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {certificates.map((cert, i) => (
                <CertificateCard key={cert.id || i} cert={cert} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}