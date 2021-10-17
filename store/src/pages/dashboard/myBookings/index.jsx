import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSubscription, useMutation } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import styled from 'styled-components'
import ReactHtmlParser from 'react-html-parser'
import { Layout, SEO, Card } from '../../../components'
import {
   BookingRecyclerView,
   DashboardSideBar
} from '../../../pageComponents/homeComponents'
import { theme } from '../../../theme'
import { useWindowDimensions, fileParser, isEmpty } from '../../../utils'
import { useUser } from '../../../Providers'
import { getNavigationMenuItems, getBannerData } from '../../../lib'

export default function DashboardPage({
   navigationMenuItems,
   parsedData = []
}) {
   const router = useRouter()
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const { width } = useWindowDimensions()

   return (
      <Layout navigationMenuItems={navigationMenuItems}>
         <SEO title="Dashboard" />
         <Wrapper>
            <div className="flex-wrapper">
               <div className="dashboard-left-div">
                  <DashboardSideBar user={user} />
               </div>
               <div className="dashboard-right-div">
                  <div id="myBookings-top-01">
                     {Boolean(parsedData.length) &&
                        ReactHtmlParser(
                           parsedData.find(
                              fold => fold.id === 'myBookings-top-01'
                           )?.content
                        )}
                  </div>
                  <div className="recycler-div">
                     <BookingRecyclerView keycloakId={user?.keycloakId} />
                  </div>
                  <div id="myBookings-bottom-01">
                     {Boolean(parsedData.length) &&
                        ReactHtmlParser(
                           parsedData.find(
                              fold => fold.id === 'myBookings-bottom-01'
                           )?.content
                        )}
                  </div>
               </div>
            </div>
         </Wrapper>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const where = {
      id: { _in: ['dashboard-top-01', 'dashboard-bottom-01'] }
   }
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const bannerData = await getBannerData(where)
   const parsedData = await fileParser(bannerData)

   return {
      props: {
         navigationMenuItems,
         parsedData
      }
   }
}

const Wrapper = styled.div`
   .heading {
      font-size: ${theme.sizes.h3};
      font-weight: 600;
      color: ${theme.colors.textColor4};
      text-align: center;
      margin: 2rem 0;
      line-height: 35px;
   }
   .flex-wrapper {
      display: flex;
      position: relative;
      .dashboard-left-div {
         width: 20%;
      }
      .dashboard-right-div {
         width: 80%;
         padding-top: 2rem;
         .experienceHeading {
            font-size: ${theme.sizes.h4};
            color: ${theme.colors.textColor4};
            font-weight: 600;
            text-align: center;
            margin-bottom: 20px;
         }
         .recycler-div {
            padding: 16px;
         }
         .wishlist-card-div {
            padding: 16px;
         }
         .my-masonry-grid {
            display: flex;
         }
         .my-masonry-grid_column > div {
            margin: 0 0 16px 16px;
         }
      }
   }

   @media (max-width: 769px) {
      .flex-wrapper {
         flex-direction: column;
         .dashboard-left-div {
            display: none;
         }
         .dashboard-right-div {
            width: 100%;
            .my-masonry-grid {
               margin-right: 1rem;
            }
            .my-masonry-grid_column > div {
               margin: 0 0 1rem 1rem;
            }
         }
      }
   }
`
