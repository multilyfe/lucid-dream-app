/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
  // NOTE: intentionally no `output: "export"` here
};
export default nextConfig;
