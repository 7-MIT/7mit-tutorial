'use client';
import { useState } from 'react';
import { useApp } from '@/lib/i18n';
import { PageTitle, ServiceCard } from '@/components/Cards';
import { SERVICE_STATUSES } from '@/lib/schemas';
import { STATUS_LABEL } from '@/lib/content';

export default function Services() {
  const { t, tr, bundle } = useApp();
  const [st, setSt] = useState('');
  const list = bundle.services.filter((s) => !st || s.status === st);
  return (<>
    <PageTitle title={t('services')} sub={tr({ id: 'Status ditentukan dari pemeriksaan nyata. Layanan yang belum terjangkau ditandai Rencana dan belum terverifikasi.', en: 'Status comes from real checks. Services we could not reach are marked Planned and unverified.' })} />
    <div className="flex flex-wrap gap-2 mb-6">{['', ...SERVICE_STATUSES].map((s) => <button key={s} type="button" aria-pressed={st === s} onClick={() => setSt(s)} className={`rounded-full px-4 py-1.5 text-sm border ${st === s ? 'bg-brand text-on-brand border-brand' : 'border-line hover:bg-sunken'}`}>{s ? tr(STATUS_LABEL[s]) : t('all')}</button>)}</div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{list.map((s) => <ServiceCard key={s.slug} s={s} />)}</div>
  </>);
}
