import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { graphQLClient, useConfig } from '../../../lib'
import { useUser } from '../../../context'
import {
   SEO,
   Layout,
   ProfileSidebar,
   Form,
   Button,
   Loader,
} from '../../../components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useToasts } from 'react-toast-notifications'
import { useQuery } from '@apollo/react-hooks'
import {
   CUSTOMERS_REFERRED,
   NAVIGATION_MENU,
   WEBSITE_PAGE,
} from '../../../graphql'
import { getRoute, getSettings, isClient } from '../../../utils'

const Referrals = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { seo, settings, navigationMenus } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Referrals" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/account/referrals',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/account/referrals')
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

export default Referrals

const Content = () => {
   const { addToast } = useToasts()
   const { user } = useUser()
   const { brand, configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable

   const { data: { customerReferrals = [] } = {}, loading } = useQuery(
      CUSTOMERS_REFERRED,
      {
         skip: !user.customerReferral?.referralCode,
         variables: {
            brandId: brand.id,
            code: user.customerReferral?.referralCode,
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   if (loading) return <Loader inline />
   return (
      <section tw="px-6 w-full md:w-5/12">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>Referrals</Title>
         </header>
         {referralsAllowed && !!user.customerReferral && (
            <>
               <Form.Label>Referral Code</Form.Label>
               <Flex>{user.customerReferral.referralCode}</Flex>
               <CopyToClipboard
                  text={`${window.location.origin}/?invite-code=${user.customerReferral.referralCode}`}
                  onCopy={() =>
                     addToast('Invite like copied!', {
                        appearance: 'success',
                     })
                  }
               >
                  <Button size="sm"> Copy invite link </Button>
               </CopyToClipboard>
               <div tw="h-4" />
               <Form.Label>
                  Customers Referred ({customerReferrals.length}){' '}
               </Form.Label>
               <Styles.Table>
                  <thead>
                     <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                     </tr>
                  </thead>
                  <tbody>
                     {customerReferrals.map(ref => (
                        <tr key={ref.id}>
                           <Styles.Cell>
                              {ref.customer.platform_customer.firstName}
                           </Styles.Cell>
                           <Styles.Cell>
                              {ref.customer.platform_customer.lastName}
                           </Styles.Cell>
                        </tr>
                     ))}
                  </tbody>
               </Styles.Table>
            </>
         )}
      </section>
   )
}

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   min-height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
   position: relative;
   @media (max-width: 768px) {
      display: block;
   }
`

const Flex = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 10px;
`

const Styles = {
   Table: styled.table`
      ${tw`my-2 w-full table-auto`}
      th {
         text-align: left;
      }
      tr:nth-of-type(even) {
         ${tw`bg-gray-100`}
      }
   `,
   Cell: styled.td`
      ${tw`border px-2 py-1`}
      min-width: 100px;
   `,
   Comment: styled.p`
      ${tw`text-sm text-gray-600`}
   `,
}
