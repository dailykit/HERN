import React from 'react'
import styled from 'styled-components'
import ReactHtmlParser from 'react-html-parser'
import { useRouter } from 'next/router'
import { Button, Layout, SEO } from '../components'
import { theme } from '../theme'
import { fileParser } from '../utils'
import { getBannerData, getNavigationMenuItems, getGlobalFooter } from '../lib'

export default function Custom404({
   navigationMenuItems = [],
   parsedData = [],
   footerHtml = ''
}) {
   const router = useRouter()
   const handleExploreMore = () => {
      router.push('/')
   }
   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Page Not Found" />
         <div id="custom404-top-01">
            {Boolean(parsedData.length) &&
               ReactHtmlParser(
                  parsedData.find(fold => fold.id === 'custom404-top-01')
                     ?.content
               )}
         </div>
         <Wrapper>
            <div className="info_wrapper">
               <h1 className="custom404_heading text1">
                  Something's wrong here...!
               </h1>
               <p className="custom404_para text6">
                  We can't find the page you are looking for. Check out our
                  other pages or head back to home.
               </p>
               <Button
                  className="custom404_exploreBtn text7"
                  onClick={handleExploreMore}
               >
                  Go to Home
               </Button>
            </div>
            <div id="custom404-bottom-01">
               {Boolean(parsedData.length) &&
                  ReactHtmlParser(
                     parsedData.find(fold => fold.id === 'custom404-bottom-01')
                        ?.content
                  )}
            </div>
         </Wrapper>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['custom404-top-01', 'custom404-bottom-01'] }
   }
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)
   const footerHtml = await getGlobalFooter()

   return {
      props: {
         navigationMenuItems,
         parsedData,
         footerHtml
      }
   }
}

const Wrapper = styled.div`
   height: 100vh;
   background-image: url('https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/77185-404%201.jpg');
   background-size: cover;
   background-position: center;
   background-repeat: no-repeat;
   .info_wrapper {
      padding: 4rem 6rem;
      .custom404_heading {
         font-family: 'Barlow Condensed';
         font-style: normal;
         font-weight: normal;
         color: ${theme.colors.textColor4};
         margin-bottom: 0;
      }
      .custom404_para {
         color: ${theme.colors.textColor4};
         font-family: 'Barlow Condensed';
         font-style: normal;
         font-weight: normal;
         margin-bottom: 0;
      }
      .custom404_exploreBtn {
         width: auto;
         display: flex;
         align-items: center;
         justify-content: center;
         font-family: 'Maven Pro';
         font-style: normal;
         font-weight: 800;
         color: ${theme.colors.textColor};
         padding: 24px 64px;
         letter-spacing: 0.16em;
         margin-top: 2rem;
      }
   }
`
