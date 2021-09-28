import bcrypt from 'bcrypt'
import { gql } from '@apollo/client'
import { graphqlClient } from '../../lib'
const SALT_ROUNDS = 10

const INSERT_PLATFORM_CUSTOMER = gql`
   mutation insertCustomer($object: platform_customer_insert_input!) {
      insertCustomer: insert_platform_customer_one(object: $object) {
         email
         password
      }
   }
`

export default async function handler(req, res) {
   if (req.method === 'POST') {
      const {
         firstName = '',
         lastName = '',
         phoneNumber,
         email = '',
         password = ''
      } = req.body
      const hash = await bcrypt.hash(password, SALT_ROUNDS)
      const client = await graphqlClient()
      //  create a new user entry in the platform customer table
      const {
         data: { insertCustomer }
      } = await client.mutate({
         mutation: INSERT_PLATFORM_CUSTOMER,
         variables: {
            object: { firstName, lastName, phoneNumber, email, password: hash }
         }
      })

      console.log({ insertCustomer })
      if (insertCustomer && insertCustomer.email) {
         return res
            .status(200)
            .json({ success: true, message: 'Successfully created a new user' })
      }
      return res
         .status(500)
         .json({ success: false, message: 'Error creating user' })
   }
}
