/** Situs statis (output: export) — dilayani Cloudflare Workers assets. Konten terbaru diambil dari tutorial-api saat dijalankan. */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  webpack: (config) => { config.resolve.alias = { ...config.resolve.alias, sharp: false, 'onnxruntime-node': false }; return config; },
  experimental: { optimizePackageImports: ['lucide-react', 'motion', 'recharts'] },
};
export default nextConfig;
