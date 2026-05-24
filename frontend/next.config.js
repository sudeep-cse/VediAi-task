/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We load Google Fonts via a <link> tag (runtime). Disable build-time font
  // optimization so the build never needs network access.
  optimizeFonts: false,
};
module.exports = nextConfig;
