module.exports = {
   webpack: (config, { webpack }) => {
      config.module.rules.push({
         test: /\.svg$/,
         use: ['@svgr/webpack']
      })
      config.plugins.push(
         new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
         })
      )
      config: {
         resolve: {
            fallback = {
               ...config.resolve.fallback,
               fs: false
            }
         }
      }
      return config
   },
   images: {
      domains: [
         'dailykit-239-primanti.s3.us-east-2.amazonaws.com',
         'dailykit-133-test.s3.us-east-2.amazonaws.com',
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
