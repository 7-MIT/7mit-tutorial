'use client';
import { useEffect, useState } from 'react';
/** Slug dari parameter rute; pada halaman cadangan (__fallback) dibaca dari alamat peramban. */
export function useSlug(param: string, segment: string) {
  const [slug, setSlug] = useState(param === '__fallback' ? '' : param);
  useEffect(() => {
    if (param !== '__fallback') return;
    const parts = location.pathname.split('/').filter(Boolean);
    const i = parts.indexOf(segment);
    setSlug(i >= 0 ? decodeURIComponent(parts[i + 1] ?? '') : '');
  }, [param, segment]);
  return slug;
}
