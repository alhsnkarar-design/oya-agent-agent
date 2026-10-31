/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // published sites live under /s/<slug>/ and need the trailing slash for relative links
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ["pg"],
};
export default nextConfig;
