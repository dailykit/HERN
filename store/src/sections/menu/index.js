import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'

import { HelperBar, Loader, PageBanner, PlanInfo } from '../../components'
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
      <>
         <PlanInfo />
         <MenuProvider>
            <MenuContent />
         </MenuProvider>
      </>
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
               <PageBanner
                  image={config?.header?.images?.value}
                  heading={config?.header?.heading?.value}
                  subHeading={config?.header?.subHeading?.value}
               />
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
