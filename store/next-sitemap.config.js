
const siteUrl = "https://testhern.dailykit.org";

module.exports = {
    siteUrl,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    generateRobotsTxt: true,
    exclude: ['/api/*', '/404', '/sitemap'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '/[brand]',
                allow: '/',
            },
            {
                userAgent: '*',
                disallow: "/checkout",
            }
        ],
        // additionalSitemaps: [
        //     'https://testhern.dailykit.org/sitemap.xml',
        //     'https://testhern.dailykit.org/sitemap.xml'
        // ]
    },
}