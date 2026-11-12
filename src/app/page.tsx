'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Bot, Search } from 'lucide-react';
import { useApp } from '@/lib/i18n';
import { ArticleCard, Icon, ServiceCard } from '@/components/Cards';

export default function Home() {
  const { t, tr, bundle, setOpenSearch } = useApp();
  const reduce = useReducedMotion();
  const pub = bundle.articles.filter((a) => a.status === 'published');
  const featured = pub.filter((a) => a.featured).slice(0, 3);
  const popular = pub.filter((a) => a.popular).slice(0, 4);
  const services = bundle.services.filter((s) => !s.legacy && s.slug !== 'main');
  return (
    <div className="grid gap-16">
      <section className="rounded-xl p-8 md:p-14 text-center" style={{ background: 'linear-gradient(135deg,var(--banner-1),var(--banner-3) 70%,var(--banner-4))', color: 'var(--banner-ink)' }}>
        <motion.h1 initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-5xl">{t('heroTitle')}</motion.h1>
        <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-3 max-w-2xl mx-auto" style={{ color: 'var(--banner-ink-soft)' }}>{t('heroSub')}</motion.p>
        <button type="button" onClick={() => setOpenSearch(true)} className="mt-8 mx-auto flex w-full max-w-xl items-center gap-3 rounded-full bg-cream text-left px-5 py-4 shadow-card" style={{ background: 'var(--cream)', color: '#6f6467' }}><Search size={20} aria-hidden />{t('searchPh')}</button>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          <Link href="/ai/" className="inline-flex items-center gap-1 rounded-full px-4 py-2 border border-white/40 hover:bg-white/10"><Bot size={16} aria-hidden />{t('ai')}</Link>
          <Link href="/troubleshooting/" className="rounded-full px-4 py-2 border border-white/40 hover:bg-white/10">{t('trouble')}</Link>
        </div>
      </section>
      <section aria-labelledby="cat"><div className="flex items-end justify-between mb-4"><h2 id="cat" className="font-display text-2xl">{t('categories')}</h2><Link href="/help/categories/" className="text-sm text-brand-ink inline-flex items-center gap-1">{t('all')}<ArrowRight size={14} aria-hidden /></Link></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{bundle.categories.map((c, i) => (
          <motion.div key={c.slug} initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <Link href={`/help/category/${c.slug}/`} className="flex items-center gap-3 rounded-lg border border-line bg-raised p-4 hover:border-brand h-full"><span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand-ink shrink-0"><Icon name={c.icon} /></span><span className="font-medium">{tr(c.name)}</span></Link></motion.div>))}</div></section>
      {featured.length > 0 && <section aria-labelledby="feat"><h2 id="feat" className="font-display text-2xl mb-4">{t('featured')}</h2><div className="grid md:grid-cols-3 gap-4">{featured.map((a) => <ArticleCard key={a.slug} a={a} />)}</div></section>}
      <section aria-labelledby="svc"><div className="flex items-end justify-between mb-4"><h2 id="svc" className="font-display text-2xl">{t('services')}</h2><Link href="/services/" className="text-sm text-brand-ink inline-flex items-center gap-1">{t('all')}<ArrowRight size={14} aria-hidden /></Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{services.slice(0, 6).map((s) => <ServiceCard key={s.slug} s={s} />)}</div></section>
      {popular.length > 0 && <section aria-labelledby="pop"><h2 id="pop" className="font-display text-2xl mb-4">{t('popular')}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{popular.map((a) => <ArticleCard key={a.slug} a={a} />)}</div></section>}
    </div>
  );
}
