'use strict'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
   enabled: false,
})
module.exports = withBundleAnalyzer({
   pageExtensions: ['js', 'jsx'],
   webpack: (config, { isServer }) => {
      // Fixes npm packages that depend on `fs` module
      if (!isServer) {
         config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            module: false,
         }
      }
      config.module.rules.push({
         test: /\.svg$/,
         use: ['@svgr/webpack'],
      })
      return config
   },
})
