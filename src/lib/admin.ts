import { API, ANON } from './content';
import { articleToPayload } from '../../shared/mapping';
import { Block, hasVisual, type Article } from './schemas';
import { z } from 'zod';

const SKEY = 't7-admin-session';
export const getToken = () => { try { return sessionStorage.getItem(SKEY) || ''; } catch { return ''; } };
export const setToken = (t: string) => { try { t ? sessionStorage.setItem(SKEY, t) : sessionStorage.removeItem(SKEY); } catch { /* abaikan */ } };
export class ApiError extends Error { constructor(m: string, public status: number, public payload?: unknown) { super(m); } }

async function post(url: string, body: unknown, token = ''): Promise<any> {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', apikey: ANON, authorization: `Bearer ${ANON}`, ...(token ? { 'x-7mit-session': token } : {}) }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.ok === false) throw new ApiError(j.message || j.error || `HTTP ${r.status}`, r.status, j);
  return j;
}
export const adminCall = (action: string, extra: Record<string, unknown> = {}) => post(API, { action, ...extra }, getToken());
export const akunLogin = (username: string, password: string, account_key = '') => post('https://lajzrempjyoqkubkumhb.supabase.co/functions/v1/akun-auth', { action: 'login', username: username.replace(/@7mit$/i, ''), password, account_key });

export function validateArticle(a: Article, publish: boolean): string[] {
  const errs: string[] = [];
  if (!/^[a-z0-9-]{3,90}$/.test(a.slug)) errs.push('Slug harus huruf kecil/angka/tanda hubung, 3–90 karakter.');
  if (!a.title.id.trim()) errs.push('Judul (Indonesia) wajib diisi.');
  if (!a.blocks.length) errs.push('Tambahkan minimal satu blok.');
  const r = z.array(Block).safeParse(a.blocks);
  if (!r.success) for (const i of r.error.issues.slice(0, 4)) errs.push(`Blok ${Number(i.path[0]) + 1}: ${i.message} (${i.path.slice(1).join('.') || 'isi'})`);
  if (publish && !hasVisual(a.blocks)) errs.push('Artikel terbit wajib punya minimal satu visual interaktif.');
  return errs;
}
export const saveArticle = (a: Article, note: string) => adminCall('save_article', { payload: articleToPayload(a), note });
