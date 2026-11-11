/// <reference lib="webworker" />
// Pekerja AI: Qwen3-0.6B (ONNX) berjalan lokal di peramban lewat Transformers.js + WebGPU. Tidak ada data yang dikirim ke server.
import { pipeline, TextStreamer, InterruptableStoppingCriteria, env } from '@huggingface/transformers';

const MODEL = 'onnx-community/Qwen3-0.6B-ONNX';
env.allowLocalModels = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gen: any = null;
let loading = false;
const stopper = new InterruptableStoppingCriteria();
const post = (m: unknown) => (self as unknown as Worker).postMessage(m);

async function load() {
  if (gen || loading) return;
  loading = true;
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu || !(await gpu.requestAdapter())) throw new Error('webgpu-unavailable');
    const files: Record<string, { loaded: number; total: number }> = {};
    gen = await pipeline('text-generation', MODEL, {
      device: 'webgpu', dtype: 'q4f16',
      progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
        if (p.status === 'progress' && p.file) {
          files[p.file] = { loaded: p.loaded ?? 0, total: p.total ?? 0 };
          let l = 0, t = 0; for (const f of Object.values(files)) { l += f.loaded; t += f.total; }
          post({ type: 'progress', loaded: l, total: t });
        }
      },
    });
    post({ type: 'ready' });
  } catch (e) {
    gen = null;
    post({ type: 'error', code: (e as Error).message === 'webgpu-unavailable' ? 'webgpu' : 'load', message: String((e as Error).message || e) });
  } finally { loading = false; }
}

async function run(id: number, messages: { role: string; content: string }[]) {
  if (!gen) { post({ type: 'error', code: 'notready', id }); return; }
  stopper.reset();
  try {
    let text = '';
    const streamer = new TextStreamer(gen.tokenizer, {
      skip_prompt: true, skip_special_tokens: true,
      callback_function: (t: string) => { text += t; post({ type: 'token', id, text }); },
    });
    await gen(messages, {
      max_new_tokens: 380, do_sample: false, repetition_penalty: 1.1, streamer,
      tokenizer_encode_kwargs: { enable_thinking: false },
      stopping_criteria: stopper,
    });
    post({ type: 'done', id, text: text.replace(/<think>[\s\S]*?<\/think>/g, '').trim() });
  } catch (e) { post({ type: 'error', code: 'gen', id, message: String((e as Error).message || e) }); }
}

self.onmessage = (ev: MessageEvent) => {
  const m = ev.data;
  if (m.type === 'load') void load();
  else if (m.type === 'generate') void run(m.id, m.messages);
  else if (m.type === 'stop') stopper.interrupt();
};
