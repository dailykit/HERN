import React from 'react'
import tw, { styled, css } from 'twin.macro'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { ProfileSidebar, Form } from '../../components'
import { formatCurrency } from '../../utils'
import * as moment from 'moment'

export const Wallet = () => {
   return (
      <Main>
         <ProfileSidebar />
         <Content />
      </Main>
   )
}

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
