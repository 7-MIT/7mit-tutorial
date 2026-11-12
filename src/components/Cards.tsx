'use client';
import Link from 'next/link';
import { Activity, Archive, BookOpen, BrainCircuit, ChartColumn, ClipboardList, Clock, Cloud, Database, Folder, Globe, GraduationCap, House, LayoutDashboard, Link2, Monitor, PenTool, Rocket, Server, Shield, ShieldCheck, Sparkles, UserRound, Wallet, Zap, type LucideIcon } from 'lucide-react';
import type { Article, Service } from '@/lib/schemas';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/content';
import { useApp } from '@/lib/i18n';

const ICONS: Record<string, LucideIcon> = { rocket: Rocket, 'shield-check': ShieldCheck, 'graduation-cap': GraduationCap, zap: Zap, sparkles: Sparkles, server: Server, 'bar-chart-3': ChartColumn, 'user-round': UserRound, 'layout-dashboard': LayoutDashboard, 'brain-circuit': BrainCircuit, 'clipboard-list': ClipboardList, 'book-open': BookOpen, database: Database, cloud: Cloud, globe: Globe, wallet: Wallet, activity: Activity, 'link-2': Link2, 'pen-tool': PenTool, shield: Shield, monitor: Monitor, house: House, archive: Archive, folder: Folder };
export const Icon = ({ name, size = 22, className = '' }: { name: string; size?: number; className?: string }) => { const I = ICONS[name] ?? Globe; return <I size={size} className={className} aria-hidden />; };

export function StatusBadge({ status }: { status: string }) {
  const { tr } = useApp();
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status] ?? ''}`}>{tr(STATUS_LABEL[status])}</span>;
}
export function ArticleCard({ a }: { a: Article }) {
  const { tr, t, bundle } = useApp();
  const svc = bundle.services.find((s) => s.slug === a.service);
  return (
    <Link href={`/help/article/${a.slug}/`} className="group rounded-lg border border-line bg-raised p-4 shadow-card hover:border-brand transition-colors flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-muted"><span>{svc?.name ?? a.service}</span>{!a.verified && <span className="rounded-full bg-sunken px-2 py-0.5">{t('draft')}</span>}</div>
      <h3 className="font-display text-lg text-ink group-hover:text-brand-ink">{tr(a.title)}</h3>
      <p className="text-sm text-muted line-clamp-2">{tr(a.summary)}</p>
      <p className="mt-auto flex items-center gap-1 text-xs text-muted"><Clock size={12} aria-hidden />{a.minutes} {t('min')}</p>
    </Link>
  );
}
export function ServiceCard({ s }: { s: Service }) {
  const { tr, bundle, t } = useApp();
  const n = bundle.articles.filter((a) => a.services.includes(s.slug)).length;
  return (
    <Link href={`/services/${s.slug}/`} className="rounded-lg border border-line bg-raised p-4 shadow-card hover:border-brand transition-colors flex flex-col gap-2">
      <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand-ink"><Icon name={s.icon} /></span><StatusBadge status={s.status} /></div>
      <h3 className="font-display text-lg">{s.name}</h3>
      <p className="text-sm text-muted line-clamp-2">{tr(s.summary)}</p>
      <p className="mt-auto text-xs text-muted">{n} {t('articles')}{!s.verified && <> · {t('unverified')}</>}</p>
    </Link>
  );
}
export const PageTitle = ({ title, sub }: { title: string; sub?: string }) => (<div className="mb-8"><h1 className="font-display text-3xl md:text-4xl text-ink">{title}</h1>{sub && <p className="mt-2 text-muted max-w-2xl">{sub}</p>}</div>);
