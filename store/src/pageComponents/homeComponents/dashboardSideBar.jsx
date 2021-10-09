import React from 'react'
import styled from 'styled-components'
import { theme } from '../../theme'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardSideBar({ user }) {
   return (
      <Wrapper>
         <div className="image-wrapper">
            <Image
               src={`https://ui-avatars.com/api/?name=${user?.email}&background=fff&color=15171F&size=500&rounded=true`}
               alt="user-profile"
               width={100}
               height={100}
               objectFit="cover"
            />
            <h5 className="user-email text8">
               {user?.name || user?.email || 'User'}
            </h5>
         </div>
         <ul className="nav-list">
            <li className="nav-list-item">
               <Link href="/myPolls">
                  <a>My Polls</a>
               </Link>
            </li>
            <li className="nav-list-item">
               <Link href="/myBookings">
                  <a>My Bookings</a>
               </Link>
            </li>
         </ul>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   margin-right: 1rem;
   padding-top: 2rem;
   background: ${theme.colors.creamColor};
   position: sticky;
   height: 100vh;
   overflow-y: auto;
   top: 64px;
   z-index: 4;
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
         color: ${theme.colors.textColor5};
         text-align: center;
         margin: 1rem;
         line-height: 35px;
      }
   }
   .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      margin: 0;
   }
   .nav-list-item {
      list-style: none;
      font-size: ${theme.sizes.h4};
      position: relative;
      display: flex;
      flex-direction: column;
      &:hover {
         a {
            color: ${theme.colors.textColor};
         }
      }
      &:last-child {
         margin-bottom: 32px;
      }
      a {
         position: relative;
         padding: 8px;
         text-decoration: none;
         color: ${theme.colors.textColor5};
         text-align: center;
      }
   }

   @media (max-width: 769px) {
      .sidebar {
         display: none;
      }
   }
`
