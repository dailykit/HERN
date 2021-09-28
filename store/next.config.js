module.exports = {
   webpack: config => {
      config.module.rules.push({
         test: /\.svg$/,
         use: ['@svgr/webpack']
      })
      config.resolve.fallback = {
         ...config.resolve.fallback,
         fs: false
      }
      return config
   },
   images: {
      domains: [
         'dailykit-239-primanti.s3.us-east-2.amazonaws.com',
         'via.placeholder.com',
         'ui-avatars.com'
      ]
   },
   eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true
   }
}
