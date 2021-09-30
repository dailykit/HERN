import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'

import { HelperBar, Loader } from '../../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
   useMenu,
} from '../../sections/select-menu'
import { useUser } from '../../context'
import { useConfig } from '../../lib'
import { getRoute } from '../../utils'

export const MenuView = () => {
   return (
      <MenuProvider>
         <MenuContent />
      </MenuProvider>
   )
}

const MenuContent = () => {
   const { user } = useUser()
   const { state } = useMenu()
   const router = useRouter()
   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')

   if (state?.isOccurencesLoading)
      return (
         <Main>
            <Loader inline />
         </Main>
      )
   if (user?.isSubscriber)
      return (
         <Main>
            <div>
               <WeekPicker />
               <Header
                  url={
                     !isEmpty(config?.header?.images)
                        ? config?.header?.images[0]?.url
                        : ''
                  }
               >
                  {config?.header?.heading && (
                     <h1 css={tw`text-4xl text-white z-10`}>
                        {config?.header?.heading}
                     </h1>
                  )}
                  {config?.header?.subHeading && (
                     <h3 css={tw`text-xl text-gray-100 z-10`}>
                        {config?.header?.subHeading}
                     </h3>
                  )}
               </Header>
               {!user.isSubscriptionCancelled &&
                  state.occurenceCustomer?.betweenPause && (
                     <MessageBar>
                        You've paused the plan for this week.&nbsp;
                        <Link href={getRoute('/account/profile')}>
                           UNPAUSE SUBSCRIPTION
                        </Link>
                     </MessageBar>
                  )}
               {user.isSubscriptionCancelled && (
                  <MessageBar large>
                     Oh! Looks like you cancelled your subscription.&nbsp;
                     <Link href={getRoute('/account/profile')}>
                        REACTIVATE SUBSCRIPTION
                     </Link>
                  </MessageBar>
               )}
            </div>
            {!user.isSubscriptionCancelled && (
               <Content>
                  <Menu />
                  <CartPanel />
               </Content>
            )}
         </Main>
      )
   return (
      <Main>
         <div tw="py-3 mx-auto container">
            <HelperBar type="info">
               <HelperBar.Title>No plans selected?</HelperBar.Title>
               <HelperBar.SubTitle>
                  Let's start with setting up a plan for you.
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() =>
                     router.push(getRoute('/get-started/select-plan'))
                  }
               >
                  Select Plan
               </HelperBar.Button>
            </HelperBar>
         </div>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   padding-bottom: 24px;
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

const MessageBar = styled.div`
   height: ${props => (props.large ? '120px' : '80px')};
   display: flex;
   align-items: center;
   justify-content: center;
   ${props =>
      props.large
         ? tw`bg-red-200 text-red-600 text-center`
         : tw`bg-yellow-200 text-yellow-600 text-center`}

   a {
      text-decoration: underline;
   }
`

const Content = styled.section`
   ${tw`px-4 grid gap-8`}
   grid-template-columns: 1fr 400px;
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`
