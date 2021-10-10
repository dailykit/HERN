import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Layout, Menu, Breadcrumb } from 'antd'
import { theme } from '../../theme'
import { PollIcon, BookingIcon } from '../../components'

export default function DashboardSideBar({ user }) {
   const router = useRouter()
   const handleClick = event => {
      const { key } = event
      router.push(key)
   }

   return (
      <Wrapper>
         <Layout.Sider className="dashboard-sidebar">
            <div className="image-wrapper">
               <Image
                  src={`https://ui-avatars.com/api/?name=${user?.email}&background=fff&color=15171F&size=500&rounded=true`}
                  alt="user-profile"
                  width={100}
                  height={100}
                  objectFit="cover"
               />
               <h5 className="user-email text7">
                  {user?.name || user?.email || 'User'}
               </h5>
            </div>
            <Menu
               onClick={handleClick}
               style={{ height: '100%', borderRight: 0 }}
               defaultSelectedKeys={[router.pathname]}
               mode="inline"
            >
               <Menu.Item key="/dashboard">Overview</Menu.Item>
               <Menu.Item key="/dashboard/myPolls">
                  <PollIcon
                     size="24"
                     backgroundColor={theme.colors.textColor5}
                     color={theme.colors.textColor4}
                  />
                  My Polls
               </Menu.Item>
               <Menu.Item key="/dashboard/myBookings">
                  <BookingIcon
                     size="24"
                     backgroundColor={theme.colors.textColor5}
                     color={theme.colors.textColor4}
                  />
                  My Bookings
               </Menu.Item>
            </Menu>
         </Layout.Sider>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   padding: 2rem 1rem 1rem 1rem;
   background: ${theme.colors.creamColor};
   position: sticky;
   height: 100vh;
   overflow-y: auto;
   top: 64px;
   z-index: 4;
   .dashboard-sidebar {
      width: 100% !important;
      max-width: 100% !important;
      background: none !important;
      .ant-menu {
         background: ${theme.colors.creamColor};
      }
      .ant-menu-item {
         font-weight: 500;
         font-family: Proxima Nova;
         font-size: ${theme.sizes.h4};
         color: ${theme.colors.textColor5};
         :hover {
            color: ${theme.colors.textColor};
            .ant-menu-title-content {
               svg path {
                  fill: ${theme.colors.textColor};
               }
            }
         }
         .ant-menu-title-content {
            display: flex;
            align-items: center;
            svg {
               margin-right: 8px;
            }
         }
      }
      .ant-menu-item-selected {
         color: ${theme.colors.textColor};
         background: ${theme.colors.textColor4} !important;
         .ant-menu-title-content {
            svg path {
               fill: ${theme.colors.textColor};
            }
         }
      }
      .ant-menu-inline .ant-menu-item::after {
         left: 0;
         right: unset;
         border-right-color: ${theme.colors.textColor};
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
         font-weight: 500;
         font-family: Proxima Nova;
         color: ${theme.colors.textColor5};
         text-align: center;
         line-height: 35px;
      }
   }

   @media (max-width: 769px) {
      .sidebar {
         display: none;
      }
   }
`
