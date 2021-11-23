import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Layout, Menu, Breadcrumb } from 'antd'
import { theme } from '../../theme'
import {
   PollIcon,
   BookingIcon,
   OverviewIcon,
   PastBookingIcon,
   SettingIcon
} from '../../components'

export default function DashboardSideBar({ user }) {
   const router = useRouter()
   const handleClick = event => {
      const { key } = event
      if (key === 'no-action') return null
      router.push(key)
   }

   return (
      <Wrapper>
         <Layout.Sider className="dashboard-sidebar">
            <div className="image-wrapper">
               <Image
                  src={`https://ui-avatars.com/api/?name=${
                     user?.fullName || user?.email
                  }&background=fff&color=15171F&size=500&rounded=true`}
                  alt="user-profile"
                  width={100}
                  height={100}
                  objectFit="cover"
               />
               <h5 className="user-email text7">
                  {user?.fullName || user?.email || 'User'}
               </h5>
            </div>
            <Menu
               onClick={handleClick}
               style={{ height: '100%', borderRight: 0 }}
               defaultSelectedKeys={[router.pathname]}
               mode="inline"
            >
               <Menu.Item key="/dashboard">
                  <OverviewIcon size="26" color={theme.colors.textColor} />
                  Overview
               </Menu.Item>
               <Menu.Item key="/dashboard/myPolls">
                  <PollIcon size="24" color={theme.colors.textColor} />
                  My Polls
               </Menu.Item>
               <Menu.Item key="/dashboard/myBookings">
                  <BookingIcon size="26" color={theme.colors.textColor} />
                  My Bookings
               </Menu.Item>
               {/* <Menu.Item key="no-action" title="no action mapped yet">
                  <PastBookingIcon size="24" color={theme.colors.textColor} />
                  Past Bookings
               </Menu.Item>
               <Menu.Item key="no-action" title="no action mapped yet">
                  <SettingIcon size="24" color={theme.colors.textColor} />
                  Settings
               </Menu.Item> */}
            </Menu>
         </Layout.Sider>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   padding: 4rem 1rem 1rem 1rem;
   background: ${theme.colors.creamColor};
   position: sticky;
   height: 100vh;
   overflow-y: auto;
   top: 0px;
   z-index: 4;
   .dashboard-sidebar {
      width: 100% !important;
      max-width: 100% !important;
      background: none !important;
      .ant-menu {
         background: ${theme.colors.creamColor};
      }
      .ant-menu-item {
         .ant-menu-title-content {
            color: ${theme.colors.textColor5};
            font-family: 'Barlow Condensed';
            font-style: normal;
            font-weight: bold;
            font-size: 24px;
            line-height: 62px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
         }
         :hover {
            .ant-menu-title-content {
               color: ${theme.colors.textColor};
            }
         }
         .ant-menu-title-content {
            display: flex;
            align-items: center;
            svg {
               margin-right: 12px;
            }
         }
      }
      .ant-menu-item-selected {
         color: ${theme.colors.textColor};
         background: ${theme.colors.textColor4} !important;
      }
      .ant-menu-inline .ant-menu-item::after {
         left: 0;
         right: unset;
         border-right: 5px solid ${theme.colors.textColor};
      }
   }
   .image-wrapper {
      width: 100%;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .user-email {
         color: ${theme.colors.textColor5};
         font-family: Barlow Condensed;
         font-style: normal;
         font-weight: bold;
         font-size: 24px;
         line-height: 62px;
         text-align: center;
         letter-spacing: 0.08em;
         margin: 0.5rem 0;
      }
   }

   @media (max-width: 769px) {
      display: none;
   }
`
