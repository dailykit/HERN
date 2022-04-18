import React from "react";
import fs from 'fs'
import glob from "glob";
import path from 'path';

const Sitemap = () => { };

export const getServerSideProps = ({ req, res }) => {

    // const baseUrl = {
    //     development: "http://localhost:3000",
    //     production: "https://testhern.dailykit.org",
    // }[process.env.NODE_ENV];
    // console.log(process.cwd())

    // using hostname as baseURL-------(1)
    const baseUrl = 'https://' + req.headers.host

    //getting paths of all files
    const paths = glob.sync(path.join(process.cwd(), "src/pages/**/*.js"))

    //formating the url that goes to sitemap string------(2)
    const formattedPath = paths.map((path) => {
        const dirNameReplaced = process.cwd().replace(/\\/g, '/')
        const pagePath = path.replace(dirNameReplaced, '').replace('/src/pages/[brand]', '')
            .replace('/src/pages', '')
            .replace('.js', '')
            .replace('/index', '')
        return pagePath;
    })

    //disallow certain pages to not get seen-------(3)
    const staticPages = formattedPath.filter((staticPage) => {
        //removed pages and api folder
        return ![
            '/_app',
            '/_document',
            '/_error',
            '/_middleware',
            "/sitemap.xml",
            "/404",
        ].includes(staticPage) && !staticPage.startsWith('/api');
    })

        .map((staticPagePath) => {
            console.log(staticPagePath)
            // joining baseUrl with staticPagePath--------(4)
            return `${baseUrl}${staticPagePath}`
        })

    // generating sitemap-url for each page-------(5)
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${staticPages
            .map((url) => {
                return `
                <url>
                  <loc>${url}</loc>
                  <lastmod>${new Date().toISOString()}</lastmod>
                  <changefreq>monthly</changefreq>
                  <priority>1.0</priority>
                </url>
              `;
            })
            .join("")}
        </urlset>
      `;

    //header on the response to signal back to the browser that we're returning an .xml file-----(5)
    res.setHeader("Content-Type", "text/xml");
    // passing the generated 'sitemap' string-------(6)
    res.write(sitemap);
    res.end();
    //no use of this props, but to meet the requirements of the getServerSideProps function so that it doesn't throw error
    return {
        props: {},
    };
};

export default Sitemap;

// Name of the page is like this so that it look like this https://mydomain.com/sitemap.xml
//because Google and other browsers looks for this name in the pages folder.