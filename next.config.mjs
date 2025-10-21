/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: output: "export" removed to enable API routes (/api/payments/validate)
  images: {
    unoptimized: true,
  },
  typescript: {
    // Temporarily ignore build errors from original code to allow build completion
    // These should be fixed in the original files
    ignoreBuildErrors: false,
  },
  eslint: {
    // Temporarily ignore lint errors during build
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
