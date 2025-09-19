/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Allow local network IP origin in dev to silence cross-origin warning
  allowedDevOrigins: ['100.112.205.72']
  // NOTE: intentionally no `output: "export"` here
};
export default nextConfig;
