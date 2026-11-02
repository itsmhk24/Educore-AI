import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdfjs-dist optionally requires the `canvas` package on Node. Aliasing it
    // away keeps the client bundle clean and avoids resolution warnings.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
