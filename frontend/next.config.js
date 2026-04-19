/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['horizon-testnet.stellar.org'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js native modules from browser bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        buffer: false,
      };
      // Exclude sodium-native entirely from client bundle
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('sodium-native');
      }
    }
    // Ignore critical dependency warnings from stellar-sdk
    config.ignoreWarnings = [
      { module: /sodium-native/ },
      { module: /require-addon/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
