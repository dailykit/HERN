import axios from 'axios'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { client } from '../../lib/graphql'
import get_env from '../../../get_env'

const SALT_ROUNDS = 10

export const nutritionInfo = async (req, res) => {
   try {
      //console.log(req.body.input.simpleRecipeYieldIds)
      const { simpleRecipeYields } = await client.request(
         FETCH_NUTRITION_INFO,
         {
            ids: req.body.input.simpleRecipeYieldIds
         }
      )
      //console.log(simpleRecipeYields)

      let filtered = {}
      await simpleRecipeYields.map((item, index) => {
         const nutritionalInfo = item.nutritionalInfo
         //console.log(nutritionalInfo.excludes)
         const allowed = [
            'iron',
            'sodium',
            'sugars',
            'calcium',
            'protein',
            'calories',
            'totalFat',
            'transFat',
            'vitaminA',
            'vitaminC',
            'cholesterol',
            'dietaryFibre',
            'saturatedFat',
            'totalCarbohydrates',
            'excludes'
         ]
         if (nutritionalInfo !== null) {
            if (nutritionalInfo.excludes === null) {
               nutritionalInfo.excludes = []
            }
            filtered = Object.keys(nutritionalInfo)
               .filter(key => allowed.includes(key))
               .reduce((obj, key) => {
                  obj[key] = nutritionalInfo[key]
                  return obj
               }, {})
         } else {
            filtered = {}
         }

         //console.log(filtered)
         //console.log(item.nutritionId)
         const { update_products_nutritionInfo } = client.request(
            UPDATE_NUTRITION_INFO,
            {
               _eq: item.nutritionId,
               _set: filtered
            }
         )
         //console.log(update_products_nutritionInfo)
      })
      return res.json({
         success: true,
         message: 'Successfully generated nutrition info!'
      })
   } catch (error) {
      console.log(error)
      return res.json({ error: error.message })
   }
}

export const forgotPassword = async (req, res) => {
   try {
      console.log(req.body)
      const { email, origin, type = '', redirectUrl = '' } = req.body.input
      const organizationId = await get_env('ORGANIZATION_ID')
      const privateKey = await get_env('PRIVATE_KEY')
      console.log({ email, origin, organizationId })

      const { platform_customers = [] } = await client.request(
         PLATFORM_CUSTOMER,
         {
            where: { email: { _eq: email } }
         }
      )

      if (platform_customers.length > 0) {
         const [customer] = platform_customers

         const token = jwt.sign(
            {
               type,
               redirectUrl,
               email: customer.email,
               keycloakId: customer.keycloakId
            },
            privateKey,
            { expiresIn: type === 'set_password' ? '30d' : '2h' }
         )

         const url = `${origin}/reset-password?token=${token}`
         const emailInput = {
            to: email,
            attachments: [],
            from: 'noreply@dailykit.org',
            html: html({ type, email, url }),
            subject: (type === 'set_password' ? 'Set' : 'Reset') + ' Password'
         }

         await client.request(SEND_EMAIL, { emailInput })
      }

      return res.status(200).json({ success: true, message: 'Email sent!' })
   } catch (error) {
      console.log(error)
      return res.status(200).json({ success: false, message: error.message })
   }
}

export const verifyResetPasswordToken = async (req, res) => {
   try {
      const { token } = req.body.input

      const privateKey = await get_env('PRIVATE_KEY')

      const decoded = jwt.verify(token, privateKey)

      if (decoded && decoded.keycloakId) {
         return res
            .status(200)
            .json({ success: true, message: 'Token is valid!' })
      }

      return res
         .status(200)
         .json({ success: false, message: 'Token is invalid!' })
   } catch (error) {
      console.log(error)
      return res.status(200).json({ success: false, message: error.message })
   }
}

export const resetPassword = async (req, res) => {
   try {
      const { token, password } = req.body.input
      if (!password) throw Error('Password is required!')
      if (!token) throw Error('Token is required!')
      const privateKey = await get_env('PRIVATE_KEY')
      const decoded = jwt.verify(token, privateKey)

      if (decoded.keycloakId) {
         const hash = await bcrypt.hash(password, SALT_ROUNDS)

         await client.request(UPDATE_PASSWORD, {
            keycloakId: decoded.keycloakId,
            _set: { password: hash }
         })

         return res
            .status(200)
            .json({ success: true, message: 'Password changed successfully!' })
      }

      throw Error('Invalid token!')
   } catch (error) {
      console.log(error)
      return res.status(200).json({ success: false, message: error.message })
   }
}

const FETCH_NUTRITION_INFO = `
   query fetchNutritionInfo($ids: [Int!]!){
      simpleRecipeYields(where: {id: {_in: $ids}}) {
         nutritionId
         nutritionalInfo
       }
   } 
`

const UPDATE_NUTRITION_INFO = `
   mutation updateNutritionInfo($_eq: Int!, $_set: products_nutritionInfo_set_input!) {
      update_products_nutritionInfo(where: {id: {_eq: $_eq}}, _set: $_set) {
      returning {
         id
      }
      }
   }
`

const PLATFORM_CUSTOMER = `
   query platform_customers($where: platform_customer__bool_exp = {}) {
      platform_customers: platform_customer_(where: $where) {
         keycloakId
         firstName
         lastName
         email
         phoneNumber
         created_at
      }
   }
`

const SEND_EMAIL = `
   mutation SendEmail($emailInput: EmailInput!) {
      sendEmail(emailInput: $emailInput) {
         success
         message
      }
   }
`

const UPDATE_PASSWORD = `
   mutation update_platform_customer(
      $keycloakId: String!
      $_set: platform_customer__set_input = {}
   ) {
      update_platform_customer: update_platform_customer__by_pk(
         pk_columns: { keycloakId: $keycloakId }
         _set: $_set
      ) {
         id: keycloakId
      }
   }
`

const html = ({ type, email, url }) => {
   return `
      <div class="sc-qPlga bDWFjp">
         <div class="sc-qXhiz kaaBUI">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
         </div>
      </div>
      <div id="in5lx" class="row">
         <div id="iave6" class="cell">
            <div id="ihl2i" class="cell">
               <img
                  id="iqswg"
                  src="https://s3.us-east-2.amazonaws.com/dailykit.org/dailykit.webp"
               />
            </div>
            <div id="i69hl">
               Hello,
               <div>
                  <br />
                  <div draggable="true">
                     We received your request to
                     ${type === 'set_password' ? 'set' : 'reset'} the password
                     for your account associated with ${email}.
                  </div>
                  <div draggable="true"><br /></div>
                  <div draggable="true">
                     No changes have been made to the account yet.
                  </div>
               </div>
            </div>
            <div id="i24wo">
               <div>
                  You can ${type === 'set_password' ? 'set' : 'reset'} the
                  password by clicking below. Please note: Your
                  ${type === 'set_password' ? 'set' : 'reset'} password request
                  expires in ${type === 'set_password' ? '30 days' : '12 hours'}
                  .
               </div>
            </div>
            <a id="ithla" href="${url}"
               >${type === 'set_password' ? 'Set' : 'Reset'} Your Password</a
            >
            <div id="icedh">
               <div>
                  If you did not request a new password, please ignore this
                  email.
               </div>
               <div><br /></div>
               <div>- Thanks</div>
               <div>Team, DailyKIT</div>
            </div>
         </div>
      </div>
      <style>
         * {
            box-sizing: border-box;
         }
         body {
            margin: 0;
         }
         * {
            box-sizing: border-box;
         }
         body {
            margin-top: 0px;
            margin-right: 0px;
            margin-bottom: 0px;
            margin-left: 0px;
            background-color: rgb(234, 234, 234);
         }
         .row {
            display: flex;
            justify-content: flex-start;
            align-items: stretch;
            flex-wrap: nowrap;
            padding-top: 10px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
         }
         .cell {
            min-height: 75px;
            flex-grow: 1;
            flex-basis: 100%;
         }
         #iqswg {
            color: black;
            width: 222px;
            height: 69px;
         }
         #ihl2i {
            flex-basis: 47.94%;
            display: block;
         }
         #icedh {
            padding-top: 10px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            font-size: 16px;
            margin-top: 30px;
            margin-right: 0px;
            margin-bottom: 0px;
            margin-left: 0px;
            font-family: Helvetica, sans-serif;
         }
         #iave6 {
            padding-top: 30px;
            padding-right: 20px;
            padding-bottom: 0px;
            padding-left: 20px;
            background-image: initial;
            background-position-x: initial;
            background-position-y: initial;
            background-size: initial;
            background-repeat-x: initial;
            background-repeat-y: initial;
            background-attachment: initial;
            background-origin: initial;
            background-clip: initial;
            background-color: rgb(255, 255, 255);
            height: 100vh;
         }
         #ithla {
            padding-top: 10px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            background-image: initial;
            background-position-x: initial;
            background-position-y: initial;
            background-size: initial;
            background-repeat-x: initial;
            background-repeat-y: initial;
            background-attachment: initial;
            background-origin: initial;
            background-clip: initial;
            background-color: rgb(17, 27, 43);
            width: 100%;
            text-align: center;
            font-size: 30px;
            color: rgb(255, 255, 255);
         }
         #i69hl {
            padding-top: 10px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            font-size: 20px;
            margin-top: 30px;
            margin-right: 0px;
            margin-bottom: 0px;
            margin-left: 0px;
            text-align: left;
            font-family: Helvetica, sans-serif;
         }
         #i24wo {
            padding-top: 10px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
            font-size: 16px;
            margin-top: 30px;
            margin-right: 0px;
            margin-bottom: 0px;
            margin-left: 0px;
            text-align: center;
            font-family: Helvetica, sans-serif;
         }
         @media (max-width: 768px) {
            .row {
               flex-wrap: wrap;
            }
         }
         @media (max-width: 480px) {
            #ithla {
               font-size: 20px;
            }
         }
      </style>
   `
}
