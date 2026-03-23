import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowDown, Code2, Rocket, ShoppingBag, Gamepad2,
  Download, ChevronLeft, FolderOpen, Zap,
  Terminal, Database, Globe, Cpu, GitBranch, Braces,
  MonitorSmartphone, GraduationCap, Award, Users, Coffee, FileText ,Calendar, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';
import SkillsShowcase from '@/components/portfolio/SkillsShowcase';
import ExperienceTimeline from '@/components/portfolio/ExperienceTimeline';
import AcademicJourney from '@/components/portfolio/AcademicJourney';

/* ============================================ */
/*  Aurora Background                           */
/* ============================================ */
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[100px] animate-gradient" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6, #0ea5e9, #2563eb)', backgroundSize: '200% 200%' }} />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[80px] animate-gradient" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb, #1d4ed8, #06b6d4)', backgroundSize: '200% 200%', animationDelay: '2s' }} />
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div key={`h-${i}`} className="absolute h-px w-full" style={{ top: `${15 + i * 14}%` }} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: [0, 0.06, 0], scaleX: [0, 1, 0] }} transition={{ duration: 8, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}>
            <div className="w-full h-full bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div key={`v-${i}`} className="absolute w-px h-full" style={{ left: `${20 + i * 15}%` }} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: [0, 0.04, 0], scaleY: [0, 1, 0] }} transition={{ duration: 10, repeat: Infinity, delay: i * 1.5 + 0.5, ease: 'easeInOut' }}>
            <div className="w-full h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          </motion.div>
        ))}
      </div>
      {[...Array(20)].map((_, i) => (
        <motion.div key={`p-${i}`} className="absolute w-1 h-1 rounded-full bg-primary/25" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0], scale: [0, 1, 0] }} transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 6, ease: 'easeInOut' }} />
      ))}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full border border-primary/10" />
      <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full border border-primary/10" />
    </div>
  );
}

/* ============================================ */
/*  Floating Code Block - ديناميكي              */
/* ============================================ */
function FloatingCodeBlock({ profile }) {
  const defaultLines = [
    { text: 'const developer = {', color: 'text-blue-400' },
    { text: '  name: "Developer",', color: 'text-emerald-400' },
    { text: '  role: "Full-Stack",', color: 'text-emerald-400' },
    { text: '  skills: ["React",', color: 'text-cyan-400' },
    { text: '    "Laravel"],', color: 'text-cyan-400' },
    { text: '  passion: "∞",', color: 'text-amber-400' },
    { text: '};', color: 'text-blue-400' },
  ];

  const codeLines = profile?.code_block_lines?.length > 0 ? profile.code_block_lines : defaultLines;

  return (
    <motion.div initial={{ opacity: 0, x: -50, rotateY: -15 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 1, delay: 0.8 }} className="hidden lg:block" style={{ perspective: '1000px' }}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative">
        <div className="w-[380px] rounded-2xl border border-border/50 bg-[#0d1117]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
            <span className="text-[11px] text-white/30 font-mono mr-3">developer.js</span>
          </div>
          <div className="p-4 font-mono text-sm leading-7" dir="ltr">
            {codeLines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + i * 0.15 }} className="flex">
                <span className="text-white/20 w-6 text-left text-xs select-none">{i + 1}</span>
                <span className={`${line.color || 'text-white/70'} mr-3`}>{line.text}</span>
              </motion.div>
            ))}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-2 h-4 bg-blue-400 mr-9 mt-1" />
          </div>
        </div>
        <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl -z-10" />
      </motion.div>
    </motion.div>
  );
}

/* ============================================ */
/*  Magnetic Button                              */
/* ============================================ */
function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.15);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.15);
  };

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }} className="inline-block">
      <Button className={className} {...props}>{children}</Button>
    </motion.div>
  );
}

/* ============================================ */
/*  Animated Counter                             */
/* ============================================ */
function AnimatedCounter({ value, label, iconSrc }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value) || 0;

  useEffect(() => {
    if (numericValue === 0) return;
    let start = 0;
    const increment = numericValue / (2000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) { setCount(numericValue); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center group">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors overflow-hidden">
        {iconSrc ? <img src={iconSrc} alt="" className="w-6 h-6 object-contain" /> : <Zap className="w-5 h-5 text-primary" />}
      </div>
      <div className="text-3xl font-bold gradient-text">{count}+</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

/* ============================================ */
/*  Hero Section - ديناميكي بالكامل             */
/* ============================================ */
function HeroSection({ profile }) {
  const [currentRole, setCurrentRole] = useState(0);

  const name = profile?.full_name?.ar || '';
  const bio = profile?.bio?.ar || '';
  const photo = profile?.photo || '/avatar.jpg';
  const cvFile = profile?.cv_file;
  const roles = profile?.rotating_roles?.length > 0 ? profile.rotating_roles : [];
  const techDisplay = profile?.tech_display?.length > 0 ? profile.tech_display : [];
  const status = profile?.availability_status || 'available';

  const availabilityLabel = { available: 'متاح للعمل الحر والتوظيف', partially_busy: 'منشغل جزئياً — يمكن التواصل', busy: 'منشغل حالياً' };
  const availabilityColor = { available: 'bg-green-500', partially_busy: 'bg-yellow-500', busy: 'bg-red-500' };

  useEffect(() => {
    if (roles.length === 0) return;
    const interval = setInterval(() => setCurrentRole((prev) => (prev + 1) % roles.length), 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  if (!profile) {
    return (
      <section className="relative min-h-screen flex items-center justify-center" dir="rtl">
        <AuroraBackground />
        <div className="relative z-10 text-center"><p className="text-muted-foreground">جاري التحميل...</p></div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" dir="rtl">
      <AuroraBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">

        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 items-center gap-6">
          <div>
            {status !== 'busy' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Badge className="mb-6 px-4 py-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/15 cursor-default">
                  <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`w-2 h-2 rounded-full ${availabilityColor[status]} inline-block ml-2`} />
                  {availabilityLabel[status]}
                </Badge>
              </motion.div>
            )}

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl font-bold leading-tight mb-4">
              <span className="block text-foreground mb-2">مرحباً، أنا</span>
              <span className="block gradient-text">{name}</span>
            </motion.h1>

            {roles.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="h-10 mb-5 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground text-lg">{'>'}</span>
                <AnimatePresence mode="wait">
                  <motion.span key={currentRole} initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4 }} className="text-lg font-semibold text-primary">{roles[currentRole]}</motion.span>
                </AnimatePresence>
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-primary text-lg">|</motion.span>
              </motion.div>
            )}

            {bio && (
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="text-[15px] text-muted-foreground leading-relaxed mb-7">{bio}</motion.p>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} className="flex flex-wrap gap-3">
              <Link to="/projects"><MagneticButton size="lg" className="gradient-bg text-white rounded-xl px-6 h-11 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow text-sm"><Rocket className="w-4 h-4 ml-2" /> استعرض أعمالي</MagneticButton></Link>
              <Link to="/store"><MagneticButton size="lg" variant="outline" className="rounded-xl px-6 h-11 border-border hover:border-primary/50 hover:bg-primary/5 text-sm"><ShoppingBag className="w-4 h-4 ml-2" /> المتجر الرقمي</MagneticButton></Link>
            </motion.div>

            {cvFile && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-3">
                <a href={cvFile} target="_blank" rel="noopener noreferrer"><MagneticButton size="sm" variant="ghost" className="rounded-xl px-5 h-9 hover:bg-primary/5 text-sm text-muted-foreground"><Download className="w-4 h-4 ml-2" /> تحميل CV</MagneticButton></a>
              </motion.div>
            )}

            {techDisplay.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="flex items-center gap-3 mt-8">
                <span className="text-xs text-muted-foreground">أعمل بـ</span>
                <div className="flex gap-1.5 flex-wrap">
                  {techDisplay.map((tech, i) => (
                    <motion.span key={tech} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 + i * 0.1 }} whileHover={{ scale: 1.1, y: -2 }} className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-card border border-border text-foreground/70 cursor-default hover:border-primary/30 hover:text-primary transition-all">{tech}</motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* الصورة */}
          <div className="flex justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3, type: 'spring' }} className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/15 blur-[60px] scale-[2]" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute -inset-10 rounded-full border border-dashed border-primary/15">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/40 shadow-lg shadow-primary/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400/40" />
              </motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} className="absolute -inset-5 rounded-full border border-dashed border-primary/20">
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-400/50 shadow-lg shadow-sky-400/30" />
              </motion.div>

              {techDisplay.slice(0, 3).map((tech, i) => {
                const positions = [
                  { className: 'absolute -top-6 -right-8 z-20', anim: { y: [0, -8, 0] }, delay: 0 },
                  { className: 'absolute -bottom-5 -left-10 z-20', anim: { y: [0, 8, 0] }, delay: 1 },
                  { className: 'absolute top-1/3 -left-12 z-20', anim: { y: [0, -6, 0] }, delay: 0.5 },
                ];
                const pos = positions[i];
                return (
                  <motion.div key={tech} animate={pos.anim} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: pos.delay }} className={`${pos.className} px-2.5 py-1.5 rounded-lg bg-card border border-border shadow-lg text-[10px] font-medium flex items-center gap-1.5`}>
                    <span className="w-2 h-2 rounded-full bg-primary/60" />{tech}
                  </motion.div>
                );
              })}

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10">
                <div className="w-48 h-48 rounded-full overflow-hidden border-[3px] border-primary/25 shadow-2xl shadow-primary/15">
                  <img src={photo} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="w-full h-full gradient-bg items-center justify-center text-white text-5xl font-bold hidden absolute inset-0">{name?.[0] || '?'}</div>
                </div>
                <div className={`absolute bottom-2 right-2 z-20 w-7 h-7 rounded-full ${availabilityColor[status]} border-[3px] border-background flex items-center justify-center`}>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="flex justify-end"><FloatingCodeBlock profile={profile} /></div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/15 blur-[40px] scale-[2]" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10">
              <div className="w-32 h-32 rounded-full overflow-hidden border-[3px] border-primary/25 shadow-2xl shadow-primary/15">
                <img src={photo} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="w-full h-full gradient-bg items-center justify-center text-white text-4xl font-bold hidden absolute inset-0">{name?.[0] || '?'}</div>
              </div>
            </motion.div>
          </motion.div>

          {status !== 'busy' && (
            <Badge className="mb-5 px-4 py-2 bg-primary/10 border-primary/20 text-primary">
              <span className={`w-2 h-2 rounded-full ${availabilityColor[status]} inline-block ml-2`} />{availabilityLabel[status]}
            </Badge>
          )}

          <h1 className="text-4xl font-bold leading-tight mb-4">
            <span className="block text-foreground mb-1">مرحباً، أنا</span>
            <span className="block gradient-text">{name}</span>
          </h1>

          {roles.length > 0 && (
            <div className="h-8 mb-5 flex items-center justify-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <AnimatePresence mode="wait">
                <motion.span key={currentRole} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-base font-semibold text-primary">{roles[currentRole]}</motion.span>
              </AnimatePresence>
            </div>
          )}

          {bio && <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-md">{bio}</p>}

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/projects"><Button size="default" className="gradient-bg text-white rounded-xl px-6 shadow-lg shadow-primary/25 text-sm"><Rocket className="w-4 h-4 ml-2" /> أعمالي</Button></Link>
            <Link to="/store"><Button size="default" variant="outline" className="rounded-xl px-6 text-sm"><ShoppingBag className="w-4 h-4 ml-2" /> المتجر</Button></Link>
          </div>
        </div>
      </div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] text-muted-foreground">مرر للأسفل</span>
        <ArrowDown className="w-4 h-4 text-muted-foreground/60" />
      </motion.div>
    </section>
  );
}

/* ============================================ */
/*  Stats Section - ديناميكي                    */
/* ============================================ */
function StatsSection({ profile }) {
  const highlights = profile?.highlights;
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="py-16 relative" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold mb-2">الإنجازات <span className="gradient-text">والأرقام</span></h2>
          <p className="text-sm text-muted-foreground">أبرز الأرقام والإنجازات في مسيرتي</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
        >
          {highlights.map((h, i) => (
            <AnimatedCounter key={i} value={h.value?.replace('+', '') || '0'} label={h.label} iconSrc={h.icon} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================ */
/*  Sections Grid                               */
/* ============================================ */
function SectionsGrid() {
  const sections = [
    { icon: FolderOpen, title: 'المشاريع', desc: 'أنظمة ويب متكاملة، تطبيقات إدارية، ولوحات تحكم ذكية', path: '/projects', gradient: 'from-blue-500/20 to-cyan-500/20', iconBg: 'from-blue-500 to-cyan-500' },
    { icon: ShoppingBag, title: 'المتجر الرقمي', desc: 'قوالب جاهزة، أكواد مفتوحة المصدر، وأدوات رقمية احترافية', path: '/store', gradient: 'from-purple-500/20 to-pink-500/20', iconBg: 'from-purple-500 to-pink-500' },
    { icon: Gamepad2, title: 'صالة الألعاب', desc: 'ألعاب فورية ممتعة تختبر ذكاءك وسرعة بديهتك', path: '/games', gradient: 'from-orange-500/20 to-red-500/20', iconBg: 'from-orange-500 to-red-500' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 px-3 py-1"><Zap className="w-3 h-3 ml-1" /> استكشف</Badge>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">عالمي <span className="gradient-text">الرقمي</span></h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">من تطوير الأنظمة المعقدة إلى تصميم الواجهات الجذابة</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}>
              <Link to={section.path} className="block group">
                <Card className="relative p-6 border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden card-hover h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}><Icon className="w-6 h-6 text-white" /></div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{section.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{section.desc}</p>
                    <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">استكشف<ChevronLeft className="w-4 h-4 mr-1" /></div>
                  </div>
                  <div className={`absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-l ${section.iconBg} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right`} />
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================ */
/*  Tech Stack - ديناميكي بالكامل               */
/* ============================================ */
function TechStack({ profile }) {
  const tools = profile?.tools;
  const techDisplay = profile?.tech_display;

  if ((!tools || tools.length === 0) && (!techDisplay || techDisplay.length === 0)) return null;

  const defaultIcons = [Braces, Code2, Database, Zap, Globe, GitBranch, Cpu, MonitorSmartphone];
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  const hasTools = tools && tools.length > 0;

  const items = hasTools
    ? tools.map((tool, i) => ({ name: tool.name, icon: tool.icon, type: 'image', color: colors[i % colors.length] }))
    : techDisplay.map((name, i) => ({ name, icon: null, type: 'lucide', color: colors[i % colors.length], LucideIcon: defaultIcons[i % defaultIcons.length] }));

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="py-16 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">التقنيات <span className="gradient-text">والأدوات</span></h2>
          <p className="text-xs text-muted-foreground">أدوات أستخدمها يومياً لبناء منتجات عالية الجودة</p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {items.map((item, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.08 : hoveredIndex !== null ? 0.97 : 1,
                    opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`relative overflow-hidden rounded-xl border p-3.5 flex items-center gap-2.5 cursor-default transition-all duration-300 ${isHovered ? 'border-primary/50 bg-card shadow-lg shadow-primary/10' : 'border-border/30 bg-card/40'}`}
                >
                  <motion.div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }} animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 0.7 : 0 }} transition={{ duration: 0.4 }} />

                  <motion.div
                    animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? [0, -3, 3, 0] : 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ backgroundColor: isHovered ? `${item.color}18` : `${item.color}08` }}
                  >
                    {item.type === 'image' && item.icon ? (
                      <img src={item.icon} alt={item.name} className="w-4.5 h-4.5 object-contain" />
                    ) : item.LucideIcon ? (
                      <item.LucideIcon className="w-4 h-4" style={{ color: item.color }} />
                    ) : (
                      <Cpu className="w-4 h-4" style={{ color: item.color }} />
                    )}
                  </motion.div>

                  <span className="text-xs font-medium truncate" style={{ color: isHovered ? item.color : undefined }}>{item.name}</span>

                  <motion.div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }} animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 0.5 : 0 }} transition={{ duration: 0.3, delay: 0.1 }} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================ */
/*  CTA Section                                 */
/* ============================================ */
function CTASection() {
  return (
    <section className="py-20 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/5 blur-3xl" />
            <Card className="relative p-10 sm:p-14 border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              <div className="relative z-10">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-5xl mb-6">🚀</motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">هل لديك <span className="gradient-text">مشروع</span> في بالك؟</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm leading-relaxed">سواء كنت تبحث عن تطوير نظام كامل، تصميم واجهة مستخدم، أو استشارة تقنية — أنا هنا لمساعدتك</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/contact"><MagneticButton size="lg" className="gradient-bg text-white rounded-xl px-8 h-12 shadow-lg shadow-primary/25">تواصل معي الآن<ChevronLeft className="w-4 h-4 mr-2" /></MagneticButton></Link>
                  <Link to="/projects"><MagneticButton size="lg" variant="outline" className="rounded-xl px-8 h-12">شاهد أعمالي</MagneticButton></Link>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================ */
/*  Main Home Page                              */
/* ============================================ */
export default function Home() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await publicAPI.getProfile();
        setProfile(data.data);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  return (
    <div>
      <HeroSection profile={profile} />
      <StatsSection profile={profile} />
      <SectionsGrid />
      <SkillsShowcase />
      <ExperienceTimeline />       {/* ← القسم الجديد */}
      <TechStack profile={profile} />
      <AcademicJourney />
      <CTASection />
    </div>
  );
}