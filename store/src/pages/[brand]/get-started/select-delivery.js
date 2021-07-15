import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import { webRenderer } from '@dailykit/web-renderer'

import { useConfig } from '../../../lib'
import { BRAND, GET_FILEID } from '../../../graphql'
import { useUser } from '../../../context'
import { SEO, Layout, StepsNavbar, Loader, Button } from '../../../components'

import {
   useDelivery,
   AddressSection,
   DeliverySection,
   DeliveryProvider,
   DeliveryDateSection,
} from '../../../sections/select-delivery'
import { getRoute, getSettings, get_env, isClient } from '../../../utils'

const SelectDelivery = props => {
   const router = useRouter()
   const { isAuthenticated } = useUser()
   const { seo, settings } = props
   React.useEffect(() => {
      if (!isAuthenticated) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated])

   React.useEffect(() => {
      if (isClient && !localStorage.getItem('plan')) {
         navigate('/get-started/select-plan')
      }
   }, [])

   return (
      <Layout noHeader settings={settings}>
         <SEO title="Delivery" />
         <StepsNavbar />
         <DeliveryProvider>
            <DeliveryContent />
         </DeliveryProvider>
      </Layout>
   )
}
export const getStaticProps = async () => {
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/select-delivery')
   return {
      props: {
         seo,
         settings,
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
export default SelectDelivery

const DeliveryContent = () => {
   const router = useRouter()
   const { user } = useUser()
   const { state } = useDelivery()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['select-delivery-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         if (fileData.length) {
            fileData.forEach(data => {
               if (data?.fileId) {
                  const fileId = [data?.fileId]
                  const cssPath =
                     data?.subscriptionDivFileId?.linkedCssFiles.map(file => {
                        return file?.cssFile?.path
                     })
                  const jsPath = data?.subscriptionDivFileId?.linkedJsFiles.map(
                     file => {
                        return file?.jsFile?.path
                     }
                  )
                  webRenderer({
                     type: 'file',
                     config: {
                        uri: isClient && get_env('DATA_HUB_HTTPS'),
                        adminSecret: isClient && get_env('ADMIN_SECRET'),
                        expressUrl: isClient && get_env('EXPRESS_URL'),
                     },
                     fileDetails: [
                        {
                           elementId: 'select-delivery-bottom-01',
                           fileId,
                           cssPath: cssPath,
                           jsPath: jsPath,
                        },
                     ],
                  })
               }
            })
         }
      },

      onError: error => {
         console.error(error)
      },
   })
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast('Successfully saved delivery preferences.', {
            appearance: 'success',
         })
         router.push(
            getRoute(
               `/get-started/select-menu/?date=${
                  state.delivery_date.selected.fulfillmentDate
               }${
                  state.skip_list.length > 0
                     ? `&previous=${state.skip_list}`
                     : ''
               }`
            )
         )
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const nextStep = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               subscriptionOnboardStatus: 'SELECT_MENU',
               subscriptionId: state.delivery.selected.id,
               subscriptionAddressId: state.address.selected.id,
            },
         },
      })
   }

   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }
   const theme = configOf('theme-color', 'Visual')
   if (loading) return <Loader inline />
   return (
      <Main>
         <header css={tw`flex items-center justify-between border-b`}>
            <Title theme={theme}>Delivery</Title>
         </header>
         <AddressSection />
         <SectionTitle theme={theme}>Delivery Day</SectionTitle>
         <DeliverySection />
         <SectionTitle theme={theme}>
            Select your first delivery date
         </SectionTitle>
         <DeliveryDateSection />
         <div tw="mt-4 w-full flex items-center justify-center">
            <Button bg={theme?.accent} onClick={nextStep} disabled={!isValid()}>
               Continue
            </Button>
         </div>
         <div id="select-delivery-bottom-01"></div>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   padding-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl py-3`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`my-3 text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)
