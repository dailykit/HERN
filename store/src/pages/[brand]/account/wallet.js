import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { graphQLClient, useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { SEO, Layout, ProfileSidebar, Form } from '../../../components'
import { formatCurrency, getRoute, getSettings, isClient } from '../../../utils'
import * as moment from 'moment'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../../../graphql'

const Wallet = props => {
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
         <SEO title="Wallet" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/account/wallet',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/account/wallet')
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

export default Wallet

const Content = () => {
   const { user } = useUser()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const { isAvailable = false, label = 'Wallet' } = configOf(
      'Wallet',
      'rewards'
   )
   return (
      <section tw="px-6 w-full md:w-6/12">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>{label}</Title>
         </header>
         {isAvailable && !!user.wallet && (
            <>
               <Form.Label>Balance</Form.Label>
               {formatCurrency(user.wallet.amount)}
               <div tw="h-4" />
               <Form.Label>Transactions</Form.Label>
               <Styles.Table>
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Created At</th>
                     </tr>
                  </thead>
                  <tbody>
                     {user.wallet.walletTransactions.map(txn => (
                        <tr key={txn.id}>
                           <Styles.Cell>{txn.id}</Styles.Cell>
                           <Styles.Cell title={txn.type}>
                              {txn.type}
                           </Styles.Cell>
                           <Styles.Cell>
                              {formatCurrency(txn.amount)}
                           </Styles.Cell>
                           <Styles.Cell>
                              {moment(txn.created_at).format(
                                 'MMMM Do YYYY, h:mm:ss a'
                              )}
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

const Styles = {
   Table: styled.table`
      ${tw`my-2 w-full table-auto`}
      th {
         text-align: left;
      }
      tr:nth-of-type(even) {
         ${tw`bg-gray-100`}
      }
      tr {
         td:last-child {
            text-align: right;
         }
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
