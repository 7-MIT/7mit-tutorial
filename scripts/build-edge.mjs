// Gabungkan shared/mapping.ts + shared/api.ts menjadi satu berkas untuk edge function.
import { readFileSync, writeFileSync } from 'node:fs';
const m = readFileSync('shared/mapping.ts', 'utf8');
const a = readFileSync('shared/api.ts', 'utf8');
const lines = a.split('\n');
const importIdx = lines.findIndex((l) => l.startsWith('import '));
const head = lines.slice(0, importIdx + 1).join('\n');
const rest = lines.slice(importIdx + 1).join('\n');
writeFileSync('supabase/functions/tutorial-api.ts', `// @ts-nocheck\n${head.replace('// @ts-nocheck\n','')}\n${m}\n${rest}`);
console.log('ok');
