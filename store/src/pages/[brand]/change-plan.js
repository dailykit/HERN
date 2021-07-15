import React from 'react'
import tw, { css, styled } from 'twin.macro'
import { Layout, SEO } from '../../components'
import { useUser } from '../../context'
import { useToasts } from 'react-toast-notifications'
import { graphQLClient, useConfig } from '../../lib'
import { Plans } from '../../sections/select-plan'
import { useRouter } from 'next/router'
import {
   AddressSection,
   DeliveryDateSection,
   DeliveryProvider,
   DeliverySection,
   useDelivery,
} from '../../sections/select-delivery'
import { BRAND, NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { useMutation } from '@apollo/react-hooks'
import { getRoute, getSettings, isClient } from '../../utils'

const ChangePlan = props => {
   const router = useRouter()
   const { user, isAuthenticated, isLoading } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { state, dispatch } = useDelivery()
   const { seo, settings, navigationMenus } = props.props
   const theme = configOf('theme-color', 'Visual')

   const [selectedPlanId, setSelectedPlanId] = React.useState(null)

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      dispatch({ type: 'RESET' })
   }, [selectedPlanId])

   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast('Successfully changed plan.', {
            appearance: 'success',
         })
         router.push(getRoute(`/account/profile`))
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   const handleSubmit = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               subscriptionId: state.delivery.selected.id,
               subscriptionAddressId: state.address.selected.id,
            },
         },
      })
   }

   const handlePlanClick = planId => {
      // TODO: don't allow user to select their current plan
      addToast('Plan Selected!', { appearance: 'success' })
      setSelectedPlanId(planId)
   }

   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Profile" />
         <Title theme={theme}>Change Plan</Title>
         <Plans handlePlanClick={handlePlanClick} />
         {!!selectedPlanId && (
            <div tw="lg:w-8/12 w-11/12 m-auto">
               <AddressSection />
               <SectionTitle theme={theme}>Delivery Day</SectionTitle>
               <DeliverySection planId={selectedPlanId} />
               <SectionTitle theme={theme}>
                  Select your first delivery date
               </SectionTitle>
               <DeliveryDateSection />
               <div tw="m-4 w-full flex items-center justify-center">
                  <Button
                     bg={theme?.accent}
                     onClick={handleSubmit}
                     disabled={!isValid()}
                  >
                     Continue
                  </Button>
               </div>
            </div>
         )}
      </Layout>
   )
}

const ChangePlanWrapper = props => {
   return (
      <DeliveryProvider>
         <ChangePlan props={props} />
      </DeliveryProvider>
   )
}

export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/change-plan',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/change-plan')
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         seo,
         settings,
         navigationMenus,
      },
      revalidate: 1,
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

export default ChangePlanWrapper

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl text-center m-8`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`my-3 text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Button = styled.button(
   ({ disabled, bg }) => css`
      ${tw`h-10 rounded px-8 text-white bg-green-600`}
      ${disabled && tw`cursor-not-allowed bg-green-300`}
      ${bg && `background-color: ${bg};`}
   `
)
