import React from 'react'
import { getDisallowedPageRoutes } from '../utils/getpageRoutes'

export const getServerSideProps = async context => {
    const { req, res } = context
    const { host } = req.headers
    const { pageRoutes } = await getDisallowedPageRoutes(req.headers.host)

    const robotstxt = `
User-agent: *
Allow: /

    ${pageRoutes.map(({ route }) => {
        return `
User-agent: *
Disallow: ${route}
\n`}).join('')}

# Host
Host: https://${host}

# Sitemaps
Sitemap: https://${host}/sitemap.xml`
    res.write(robotstxt)
    res.end()
    return {
        props: {},
    }
}
const Robots = () => {
    console.log('Rendering Robots...')
    return React.createElement('div', null, 'I am Robots')
}
export default Robots

// Example
// User-agent: Googlebot
// Disallow: /nogooglebot/

// User-agent: *
// Allow: /

// Sitemap: http://www.example.com/sitemap.xml