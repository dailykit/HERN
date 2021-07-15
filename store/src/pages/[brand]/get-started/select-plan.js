import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { fileParser, getRoute, getSettings, isClient } from '../../../utils'
import { GET_FILEID, GET_FILES } from '../../../graphql'
import { Plans } from '../../../sections/select-plan'
import { SEO, Layout, StepsNavbar } from '../../../components'
import { graphQLClient } from '../../../lib'
import ReactHtmlParser from 'react-html-parser'
import { useUser } from '../../../context'

const SelectPlan = props => {
   const router = useRouter()
   const { data, settings } = props
   const { isAuthenticated } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated])

   React.useEffect(() => {
      if (isClient) {
         const plan = localStorage.getItem('plan')
         if (plan) {
            router.push(getRoute('/get-started/select-delivery'))
         }
      }
   }, [])

   // useQuery(GET_FILEID, {
   //    variables: {
   //       divId: ['select-plan-top-01', 'select-plan-bottom-01'],
   //    },
   //    onCompleted: ({ content_subscriptionDivIds: fileData }) => {
   //       if (fileData.length) {
   //          fileData.forEach(data => {
   //             if (data?.fileId) {
   //                const fileIdsForTop = []
   //                const fileIdsForBottom = []
   //                let cssPathForTop = []
   //                let cssPathForBottom = []
   //                let jsPathForTop = []
   //                let jsPathForBottom = []
   //                if (data?.id === 'select-plan-top-01') {
   //                   fileIdsForTop.push(data.fileId)
   //                   cssPathForTop =
   //                      data?.subscriptionDivFileId?.linkedCssFiles.map(
   //                         file => {
   //                            return file?.cssFile?.path
   //                         }
   //                      )
   //                   jsPathForTop =
   //                      data?.subscriptionDivFileId?.linkedJsFiles.map(file => {
   //                         return file?.jsFile?.path
   //                      })
   //                } else if (data?.id === 'select-plan-bottom-01') {
   //                   fileIdsForBottom.push(data.fileId)
   //                   cssPathForBottom =
   //                      data?.subscriptionDivFileId?.linkedCssFiles.map(
   //                         file => {
   //                            return file?.cssFile?.path
   //                         }
   //                      )
   //                   jsPathForBottom =
   //                      data?.subscriptionDivFileId?.linkedJsFiles.map(file => {
   //                         return file?.jsFile?.path
   //                      })
   //                }

   //                webRenderer({
   //                   type: 'file',
   //                   config: {
   //                      uri: isClient && window._env_.DATA_HUB_HTTPS,
   //                      adminSecret: isClient && window._env_.ADMIN_SECRET,
   //                      expressUrl: isClient && window._env_.EXPRESS_URL,
   //                   },
   //                   fileDetails: [
   //                      {
   //                         elementId: 'select-plan-top-01',
   //                         fileId: fileIdsForTop,
   //                         cssPath: cssPathForTop,
   //                         jsPath: jsPathForTop,
   //                      },
   //                      {
   //                         elementId: 'select-plan-bottom-01',
   //                         fileId: fileIdsForBottom,
   //                         cssPath: cssPathForBottom,
   //                         jsPath: jsPathForBottom,
   //                      },
   //                   ],
   //                })
   //             }
   //          })
   //       }
   //    },

   //    onError: error => {
   //       console.error(error)
   //    },
   // })
   React.useEffect(() => {
      try {
         if (data.length && typeof document !== 'undefined') {
            const scripts = data.flatMap(fold => fold.scripts)
            const fragment = document.createDocumentFragment()

            scripts.forEach(script => {
               const s = document.createElement('script')
               s.setAttribute('type', 'text/javascript')
               s.setAttribute('src', script)
               fragment.appendChild(s)
            })

            document.body.appendChild(fragment)
         }
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [data])
   return (
      <Layout settings={settings}>
         <SEO title="Plans" />
         <StepsNavbar />
         <Main>
            <div id="select-plan-top-01">
               {Boolean(data.length) &&
                  ReactHtmlParser(
                     data.find(fold => fold.id === 'select-plan-top-01')
                        ?.content
                  )}
            </div>
            <Plans />
         </Main>
         <div id="select-plan-bottom-01">
            {Boolean(data.length) &&
               ReactHtmlParser(
                  data.find(fold => fold.id === 'select-plan-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export default SelectPlan

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Header = styled.header`
   height: 480px;
   position: relative;
   ${tw`bg-gray-100 flex flex-col items-center justify-center`}
   ::before {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 0;
      background-image: url(${props => props.url});
      ${tw`bg-no-repeat bg-center bg-cover`}
   }
   ::after {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 1;
      ${tw`bg-black opacity-25`}
   }
`
export const getStaticProps = async () => {
   const client = await graphQLClient()
   const data = await client.request(GET_FILES, {
      divId: ['select-plan-top-01', 'select-plan-bottom-01'],
   })
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(
      domain,
      '/get-started/select-plan'
   )
   const parsedData = await fileParser(data.content_subscriptionDivIds)
   return {
      props: { data: parsedData, seo, settings },
      revalidate: 60,
   }
}
export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
