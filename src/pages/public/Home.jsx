import { useEffect, useState, useRef, useMemo, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowDown, Code2, Rocket, ShoppingBag, Gamepad2,
  Download, ChevronLeft, FolderOpen, Zap,
  Terminal, Database, Globe, Cpu, GitBranch, Braces,
  MonitorSmartphone, GraduationCap, Award, Users, Coffee, FileText, Calendar, Clock, Mail, PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';

/* ============================================ */
/*  ⚡ LAZY LOADING COMPONENTS                  */
/* ============================================ */
const SkillsShowcase = lazy(() => import('@/components/portfolio/SkillsShowcase'));
const ExperienceTimeline = lazy(() => import('@/components/portfolio/ExperienceTimeline'));
const AcademicJourney = lazy(() => import('@/components/portfolio/AcademicJourney'));

/* ============================================ */
/*  🎭 SKELETON LOADERS - شامل لكل الأقسام     */
/* ============================================ */

// 1️⃣ Aurora Background Skeleton
function AuroraBackgroundSkeleton() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 animate-pulse" />
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[100px] bg-muted/30 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[80px] bg-muted/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* خطوط أفقية */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div key={`h-${i}`} className="absolute h-px w-full bg-muted/10 animate-pulse" style={{ top: `${15 + i * 14}%`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      
      {/* خطوط عمودية */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div key={`v-${i}`} className="absolute w-px h-full bg-muted/8 animate-pulse" style={{ left: `${20 + i * 15}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
      
      {/* نقاط متحركة */}
      {[...Array(15)].map((_, i) => (
        <div key={`p-${i}`} className="absolute w-1 h-1 rounded-full bg-muted/20 animate-pulse" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
      ))}
    </div>
  );
}

// 2️⃣ Floating Code Block Skeleton
function FloatingCodeBlockSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="hidden lg:block"
    >
      <div className="relative">
        <div className="w-[380px] rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden animate-pulse">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted/50" />
              <div className="w-3 h-3 rounded-full bg-muted/50" />
              <div className="w-3 h-3 rounded-full bg-muted/50" />
            </div>
            <div className="h-3 bg-muted/30 rounded w-20 mr-3" />
          </div>
          
          {/* Code Lines */}
          <div className="p-4 space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-3 bg-muted/20 rounded" />
                <div className="h-3 bg-muted/40 rounded" style={{ width: `${60 + Math.random() * 35}%` }} />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-6 h-3 bg-muted/20 rounded" />
              <div className="w-2 h-4 bg-primary/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl -z-10 animate-pulse" />
      </div>
    </motion.div>
  );
}

// 3️⃣ Magnetic Button Skeleton
function MagneticButtonSkeleton({ size = 'lg', className = '' }) {
  const heights = { sm: 'h-9', default: 'h-10', lg: 'h-11', xl: 'h-12' };
  const widths = { sm: 'w-28', default: 'w-32', lg: 'w-36', xl: 'w-40' };
  
  return (
    <div className={`${heights[size]} ${widths[size]} rounded-xl bg-muted/50 animate-pulse ${className}`} />
  );
}

// 4️⃣ Animated Counter Skeleton
function AnimatedCounterSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-center animate-pulse"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50" />
      <div className="h-8 bg-muted/50 rounded w-16 mx-auto mb-2" />
      <div className="h-3 bg-muted/30 rounded w-20 mx-auto" />
    </motion.div>
  );
}

// 5️⃣ Hero Section Skeleton
function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" dir="rtl">
      <AuroraBackgroundSkeleton />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 items-center gap-6">
          {/* Right Column - Text Content */}
          <div className="space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="h-10 bg-muted/50 rounded-lg w-56 animate-pulse"
            />
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-3"
            >
              <div className="h-6 bg-muted/50 rounded w-32 animate-pulse" />
              <div className="h-14 bg-muted/60 rounded-lg w-64 animate-pulse" />
            </motion.div>
            
            {/* Role */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded bg-muted/40 animate-pulse" />
              <div className="h-6 bg-muted/50 rounded w-48 animate-pulse" />
            </motion.div>
            
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <div className="h-4 bg-muted/40 rounded w-full animate-pulse" />
              <div className="h-4 bg-muted/40 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-muted/40 rounded w-4/6 animate-pulse" />
            </motion.div>
            
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex gap-3"
            >
              <MagneticButtonSkeleton size="lg" />
              <MagneticButtonSkeleton size="lg" />
            </motion.div>
            
            {/* CV Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <MagneticButtonSkeleton size="sm" className="w-32" />
            </motion.div>
            
            {/* Tech Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-3"
            >
              <div className="h-3 bg-muted/30 rounded w-16 animate-pulse" />
              <div className="flex gap-1.5 flex-wrap">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-muted/40 rounded-md animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center - Avatar */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              {/* Blur Background */}
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-[60px] scale-[2] animate-pulse" />
              
              {/* Rotating Circles */}
              <div className="absolute -inset-10 rounded-full border border-dashed border-muted/20 animate-pulse">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-muted/25" />
              </div>
              
              <div className="absolute -inset-5 rounded-full border border-dashed border-muted/15 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-muted/30" />
              </div>

              {/* Floating Tech Pills */}
              {[
                { className: 'absolute -top-6 -right-8 z-20', delay: '0s' },
                { className: 'absolute -bottom-5 -left-10 z-20', delay: '0.3s' },
                { className: 'absolute top-1/3 -left-12 z-20', delay: '0.6s' },
              ].map((pos, i) => (
                <div key={i} className={`${pos.className} px-2.5 py-1.5 rounded-lg bg-card/80 border border-border/50 shadow-lg animate-pulse`} style={{ animationDelay: pos.delay }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted/40" />
                    <div className="h-3 w-12 bg-muted/40 rounded" />
                  </div>
                </div>
              ))}

              {/* Avatar */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <div className="w-48 h-48 rounded-full bg-muted/50 border-[3px] border-muted/30 shadow-2xl animate-pulse" />
                
                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 z-20 w-7 h-7 rounded-full bg-muted/40 border-[3px] border-background animate-pulse" />
              </motion.div>
            </motion.div>
          </div>

          {/* Left - Code Block */}
          <div className="flex justify-end">
            <FloatingCodeBlockSkeleton />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center text-center">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-[40px] scale-[2] animate-pulse" />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="w-32 h-32 rounded-full bg-muted/50 border-[3px] border-muted/30 shadow-2xl animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <div className="h-9 bg-muted/50 rounded-lg w-52 mb-5 animate-pulse" />

          {/* Title */}
          <div className="space-y-3 mb-4 w-full max-w-sm">
            <div className="h-5 bg-muted/50 rounded w-40 mx-auto animate-pulse" />
            <div className="h-10 bg-muted/60 rounded-lg w-48 mx-auto animate-pulse" />
          </div>

          {/* Role */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-4 h-4 rounded bg-muted/40 animate-pulse" />
            <div className="h-5 bg-muted/50 rounded w-40 animate-pulse" />
          </div>

          {/* Bio */}
          <div className="space-y-2 mb-7 w-full max-w-md">
            <div className="h-4 bg-muted/40 rounded w-full animate-pulse" />
            <div className="h-4 bg-muted/40 rounded w-5/6 mx-auto animate-pulse" />
            <div className="h-4 bg-muted/40 rounded w-4/6 mx-auto animate-pulse" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <MagneticButtonSkeleton size="default" className="w-28" />
            <MagneticButtonSkeleton size="default" className="w-28" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-pulse"
      >
        <div className="h-3 bg-muted/30 rounded w-16" />
        <div className="w-4 h-4 rounded bg-muted/30" />
      </motion.div>
    </section>
  );
}

// 6️⃣ Stats Section Skeleton
function StatsSkeleton() {
  return (
    <section className="py-16 relative" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="h-8 bg-muted/50 rounded-lg w-56 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-muted/40 rounded w-72 mx-auto animate-pulse" />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
        >
          {[...Array(4)].map((_, i) => (
            <AnimatedCounterSkeleton key={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// 7️⃣ Sections Grid Skeleton
function SectionsGridSkeleton() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="h-7 bg-muted/50 rounded-lg w-24 mx-auto mb-4 animate-pulse" />
        <div className="h-10 bg-muted/60 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-muted/40 rounded w-80 mx-auto animate-pulse" />
      </motion.div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
          >
            <Card className="relative p-6 border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden h-full">
              <div className="space-y-4 animate-pulse">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-muted/50" />
                
                {/* Title */}
                <div className="h-6 bg-muted/50 rounded w-32" />
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted/40 rounded w-full" />
                  <div className="h-4 bg-muted/40 rounded w-5/6" />
                </div>
                
                {/* Link */}
                <div className="h-5 bg-muted/40 rounded w-24" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// 8️⃣ Tech Stack Skeleton
function TechStackSkeleton() {
  return (
    <section className="py-16 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 grid-bg opacity-20 animate-pulse" />

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="h-8 bg-muted/50 rounded-lg w-56 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-muted/40 rounded w-80 mx-auto animate-pulse" />
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
            >
              <div className="rounded-xl border border-border/30 bg-card/40 p-3.5 flex items-center gap-2.5 animate-pulse">
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-muted/50 shrink-0" />
                
                {/* Text */}
                <div className="h-3 bg-muted/40 rounded flex-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 9️⃣ CTA Section Skeleton
function CTASkeleton() {
  return (
    <section className="py-20 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/5 blur-3xl animate-pulse" />
            
            <Card className="relative p-10 sm:p-14 border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              
              <div className="relative z-10 space-y-6 animate-pulse">
                {/* Emoji */}
                <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto" />
                
                {/* Title */}
                <div className="space-y-3">
                  <div className="h-10 bg-muted/50 rounded-lg w-96 mx-auto max-w-full" />
                </div>
                
                {/* Description */}
                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="h-4 bg-muted/40 rounded w-full" />
                  <div className="h-4 bg-muted/40 rounded w-5/6 mx-auto" />
                </div>
                
                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <MagneticButtonSkeleton size="xl" />
                  <MagneticButtonSkeleton size="xl" />
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 mx-auto mb-4" />
          <div className="h-8 bg-muted/50 rounded-lg w-64 mx-auto mb-2" />
          <div className="h-4 bg-muted/40 rounded w-96 mx-auto max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-card/50 rounded-xl border border-border/30 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================ */
/*  🎯 LAZY SECTION WRAPPER                     */
/* ============================================ */
function LazySection({ children, fallback = <SectionSkeleton /> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: '200px' // تحميل قبل 200px من الوصول
  });

  return (
    <div ref={ref}>
      {isInView ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

// 🔟 Full Page Skeleton (يجمع كل الأقسام)
function FullPageSkeleton() {
  return (
    <div>
      <HeroSkeleton />
      <StatsSkeleton />
      <SectionsGridSkeleton />
      <TechStackSkeleton />
      <CTASkeleton />
    </div>
  );
}

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
const FloatingCodeBlock = ({ profile }) => {
  const codeLines = useMemo(() => {
    if (profile?.code_block_lines?.length > 0) return profile.code_block_lines;
    return [
      { text: 'const developer = {', color: 'text-blue-400' },
      { text: '  name: "Developer",', color: 'text-emerald-400' },
      { text: '  role: "Full-Stack",', color: 'text-emerald-400' },
      { text: '  skills: ["React",', color: 'text-cyan-400' },
      { text: '    "Laravel"],', color: 'text-cyan-400' },
      { text: '  passion: "∞",', color: 'text-amber-400' },
      { text: '};', color: 'text-blue-400' },
    ];
  }, [profile?.code_block_lines]);

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
};

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
const AnimatedCounter = ({ value, label, iconSrc }) => {
  const [count, setCount] = useState(0);
  const numericValue = useMemo(() => parseInt(value) || 0, [value]);

  useEffect(() => {
    if (numericValue === 0) return;
    let start = 0;
    const increment = numericValue / (2000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
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
};

/* ============================================ */
/*  Hero Section - ديناميكي بالكامل             */
/* ============================================ */
const HeroSection = ({ profile }) => {
  const [currentRole, setCurrentRole] = useState(0);

  const name = profile?.full_name?.ar || '';
  const bio = profile?.bio?.ar || '';
  const photo = profile?.photo || '/avatar.jpg';
  const cvFile = profile?.cv_file;
  const roles = useMemo(() => profile?.rotating_roles || [], [profile?.rotating_roles]);
  const techDisplay = useMemo(() => profile?.tech_display || [], [profile?.tech_display]);
  const status = profile?.availability_status || 'available';

  const availabilityLabel = useMemo(() => ({
    available: 'متاح للعمل الحر والتوظيف',
    partially_busy: 'منشغل جزئياً — يمكن التواصل',
    busy: 'منشغل حالياً'
  }), []);

  const availabilityColor = useMemo(() => ({
    available: 'bg-green-500',
    partially_busy: 'bg-yellow-500',
    busy: 'bg-red-500'
  }), []);

  useEffect(() => {
    if (roles.length === 0) return;
    const interval = setInterval(() => setCurrentRole((prev) => (prev + 1) % roles.length), 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

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
              <span className="block text-foreground mb-2"> {profile?.hero_greeting || 'مرحباً، أنا'} </span>
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

            {/* الأزرار الرئيسية */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 1, duration: 0.6 }} 
              className="flex flex-wrap gap-3"
            >
              {/* زر أعمالي - بارز */}
              <Link to="/projects">
                <MagneticButton 
                  size="lg" 
                  className="gradient-bg text-white rounded-xl px-6 h-11 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm font-semibold"
                >
                  <Rocket className="w-4 h-4 ml-2" /> 
                  استعرض أعمالي
                </MagneticButton>
              </Link>
            </motion.div>
            
            {/* زر CV - الأبرز والأكثر جاذبية */}
            {cvFile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 1.1 }} 
                className="mt-4"
              >
                <a href={cvFile} target="_blank" rel="noopener noreferrer">
                  <MagneticButton 
                    size="lg" 
                    className="relative overflow-hidden rounded-xl px-6 h-11 text-sm font-bold
                               bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
                               text-white shadow-xl shadow-emerald-500/30
                               hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-110
                               transition-all duration-500
                               before:absolute before:inset-0 
                               before:bg-gradient-to-r before:from-emerald-400 before:via-green-400 before:to-teal-400
                               before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
                               border-2 border-emerald-400/30 hover:border-emerald-300/60"
                  >
                    <span className="relative z-10 flex items-center">
                      <Download className="w-5 h-5 ml-2 animate-bounce" /> 
                      تحميل السيرة الذاتية
                    </span>
                    
                    {/* تأثير التوهج */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-200%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'linear',
                      }}
                    />
                  </MagneticButton>
                </a>
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
            <span className="block text-foreground mb-1"> {profile?.hero_greeting || 'مرحباً، أنا'} </span>
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

          {/* الأزرار */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full max-w-sm">
            {/* زر أعمالي - بارز */}
            <Link to="/projects" className="w-full sm:w-auto">
              <Button 
                size="default" 
                className="w-full sm:w-auto gradient-bg text-white rounded-xl px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm font-semibold"
              >
                <Rocket className="w-4 h-4 ml-2" /> 
                أعمالي
              </Button>
            </Link>
          </div>
          
          {/* زر CV - الأبرز */}
          {cvFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mt-4 w-full max-w-sm"
            >
              <a href={cvFile} target="_blank" rel="noopener noreferrer" className="block">
                <Button
                  size="lg"
                  className="relative overflow-hidden w-full rounded-xl h-12 text-sm font-bold
                             bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
                             text-white shadow-xl shadow-emerald-500/30
                             hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105
                             transition-all duration-500
                             border-2 border-emerald-400/30 hover:border-emerald-300/60"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Download className="w-5 h-5 ml-2 animate-bounce" />
                    تحميل السيرة الذاتية
                  </span>
                  
                  {/* تأثير التوهج المتحرك */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: 'linear',
                    }}
                  />
                </Button>
              </a>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] text-muted-foreground">مرر للأسفل</span>
        <ArrowDown className="w-4 h-4 text-muted-foreground/60" />
      </motion.div>
    </section>
  );
};

/* ============================================ */
/*  Stats Section - ديناميكي                    */
/* ============================================ */
const StatsSection = ({ profile }) => {
  const highlights = useMemo(() => profile?.highlights || [], [profile?.highlights]);
  
  if (highlights.length === 0) return null;

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
};

/* ============================================ */
/*  Sections Grid                               */
/* ============================================ */
const SectionsGrid = () => {
  const sections = useMemo(() => [
    { 
      icon: FolderOpen, 
      title: 'المشاريع', 
      desc: 'أنظمة ويب متكاملة، تطبيقات إدارية، ولوحات تحكم ذكية', 
      path: '/projects', 
      gradient: 'from-blue-500/20 to-cyan-500/20', 
      iconBg: 'from-blue-500 to-cyan-500',
      available: true
    },
    { 
      icon: FileText, // أو PenTool
      title: 'مقالاتي التقنية', 
      desc: 'مقالات تقنية متخصصة، دروس برمجية، وتجارب عملية في التطوير', 
      path: '/articles', 
      gradient: 'from-purple-500/20 to-pink-500/20', 
      iconBg: 'from-purple-500 to-pink-500',
      available: true
    },
    { 
      icon: Mail, 
      title: 'تواصل معي', 
      desc: 'هل لديك مشروع أو فكرة؟ تواصل معي الآن ودعنا نحولها إلى واقع', 
      path: '/contact', 
      gradient: 'from-emerald-500/20 to-teal-500/20', 
      iconBg: 'from-emerald-500 to-teal-500',
      available: true
    },
  ], []);

  const upcomingSections = useMemo(() => [
    { 
      icon: ShoppingBag, 
      title: 'المتجر الرقمي', 
      desc: 'قوالب جاهزة، أكواد مفتوحة المصدر، وأدوات رقمية احترافية', 
      gradient: 'from-orange-500/20 to-amber-500/20', 
      iconBg: 'from-orange-500 to-amber-500',
    },
    { 
      icon: Gamepad2, 
      title: 'صالة الألعاب', 
      desc: 'ألعاب فورية ممتعة تختبر ذكاءك وسرعة بديهتك', 
      gradient: 'from-rose-500/20 to-red-500/20', 
      iconBg: 'from-rose-500 to-red-500',
    },
  ], []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="text-center mb-16"
      >
        <Badge variant="secondary" className="mb-4 px-3 py-1">
          <Zap className="w-3 h-3 ml-1" /> استكشف
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          عالمي <span className="gradient-text">الرقمي</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          من تطوير الأنظمة المعقدة إلى كتابة المقالات التقنية والتواصل المباشر
        </p>
      </motion.div>

      {/* الأقسام المتاحة */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <Link to={section.path} className="block group">
                <Card className="relative p-6 border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden card-hover h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      {section.desc}
                    </p>
                    
                    <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      استكشف
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </div>
                  </div>
                  
                  <div className={`absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-l ${section.iconBg} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right`} />
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* الأقسام القادمة (Soon) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2 px-3 py-1 border-muted-foreground/30">
            <Clock className="w-3 h-3 ml-1" /> قريباً
          </Badge>
          <p className="text-xs text-muted-foreground">أقسام جديدة قيد التطوير</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {upcomingSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <Card className="relative p-6 border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden h-full opacity-60 cursor-not-allowed">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-30`} />
                  
                  {/* شارة "قريباً" */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                      <Clock className="w-3 h-3 ml-1 animate-pulse" />
                      قريباً
                    </Badge>
                  </div>

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.iconBg} opacity-50 flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-muted-foreground">
                      {section.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      {section.desc}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">جاري التطوير</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {i === 0 ? '65%' : '45%'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: i === 0 ? '65%' : '45%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.8 + i * 0.2 }}
                          className={`h-full bg-gradient-to-r ${section.iconBg} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

/* ============================================ */
/*  Tech Stack - ديناميكي بالكامل               */
/* ============================================ */
const TechStack = ({ profile }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const tools = useMemo(() => profile?.tools || [], [profile?.tools]);
  const techDisplay = useMemo(() => profile?.tech_display || [], [profile?.tech_display]);

  const defaultIcons = useMemo(() => [Braces, Code2, Database, Zap, Globe, GitBranch, Cpu, MonitorSmartphone], []);
  const colors = useMemo(() => ['#3b82f6', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'], []);

  const items = useMemo(() => {
    const hasTools = tools.length > 0;
    return hasTools
      ? tools.map((tool, i) => ({ name: tool.name, icon: tool.icon, type: 'image', color: colors[i % colors.length] }))
      : techDisplay.map((name, i) => ({ name, icon: null, type: 'lucide', color: colors[i % colors.length], LucideIcon: defaultIcons[i % defaultIcons.length] }));
  }, [tools, techDisplay, colors, defaultIcons]);

  if (items.length === 0) return null;

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
};

/* ============================================ */
/*  CTA Section                                 */
/* ============================================ */
const CTASection = () => {
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
};

/* ============================================ */
/*  Main Home Page - مُحسّن بالكامل              */
/* ============================================ */
export default function Home() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { seoData, loading: seoLoading } = useSEO();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // ⚡ تحميل البيانات الحرجة فقط (Hero + Stats)
        const profileRes = await publicAPI.getProfile();
        setProfile(profileRes.data.data);

      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        // تأخير بسيط لضمان smooth transition
        setTimeout(() => setLoading(false), 200);
      }
    };

    loadData();
  }, []);

  // ✅ عرض Skeleton Loaders الشامل أثناء التحميل
  if (loading) {
    return (
      <div>
        <HeroSkeleton />
        <StatsSkeleton />
      </div>
    );
  }

  // ✅ عرض المحتوى الفعلي
  return (
    <>
      {/* ✅ إضافة SEO */}
      {!seoLoading && seoData && (
        <SEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          ogImage={seoData.ogImage || seoData.photo}
          ogType="website"
        />
      )}
      <div>
        {/* 🔴 CRITICAL - تحميل فوري */}
        <HeroSection profile={profile} />
        <StatsSection profile={profile} />
        
        {/* 🟡 HIGH PRIORITY - Lazy Load مع Intersection Observer */}
        <LazySection fallback={<SectionSkeleton />}>
          <SkillsShowcase />
        </LazySection>
  
        <LazySection fallback={<SectionSkeleton />}>
          <ExperienceTimeline />
        </LazySection>
  
        <LazySection fallback={<SectionSkeleton />}>
          <AcademicJourney />
        </LazySection>
  
        {/* 🟢 MEDIUM PRIORITY */}
        <LazySection fallback={<TechStackSkeleton />}>
          <TechStack profile={profile} />
        </LazySection>
  
        <LazySection fallback={<SectionsGridSkeleton />}>
          <SectionsGrid />
        </LazySection>
  
        {/* 🔵 LOW PRIORITY */}
        <LazySection fallback={<CTASkeleton />}>
          <CTASection />
        </LazySection>
      </div>
    </>
  );
}