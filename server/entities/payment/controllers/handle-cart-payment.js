import { client } from '../../../lib/graphql'
import {
   UPDATE_CART_PAYMENT,
   CREATE_CART_PAYMENT,
   CART_PAYMENTS,
   CART
} from '../graphql'
export const handleCartPayment = async (req, res) => {
   try {
      const payload = req.body.event.data.new
      const { cart = {} } = await client.request(CART, { id: payload.id })
      console.log('cart', cart)
      if (cart.balancePayment > 0) {
         const { cartPayments = [] } = await client.request(CART_PAYMENTS, {
            where: {
               cartId: {
                  _eq: cart.id
               },
               paymentStatus: {
                  _neq: 'SUCCEEDED'
               }
            }
         })
         console.log('CartPayments', cartPayments)

         if (cartPayments.length > 0) {
            if (
               cartPayments.length > 1 ||
               cartPayments[0].amount !== cart.balancePayment
            ) {
               //cancell all invalid previous cart...
               const cancelledCartPayments = await Promise.all(
                  cartPayments.map(async cartPayment => {
                     try {
                        const { updateCartPayment = {} } = await client.request(
                           UPDATE_CART_PAYMENT,
                           {
                              id: cartPayment.id,
                              _inc: {
                                 cancelAttempt: 1
                              }
                           }
                        )
                        return updateCartPayment
                     } catch (error) {
                        return {
                           success: false,
                           message: error.message
                        }
                     }
                  })
               )

               console.log({ cancelledCartPayments })

               const { createCartPayment = {} } = await client.request(
                  CREATE_CART_PAYMENT,
                  {
                     object: {
                        cartId: cart.id,
                        paymentRetryAttempt: 1,
                        amount: cart.balancePayment,
                        isTest: cart.isTest,
                        paymentMethodId: cart.paymentMethodId,
                        stripeCustomerId: cart.stripeCustomerId
                     }
                  }
               )
               res.status(200).json(createCartPayment)
            } else {
               const updatedCartPayment = await Promise.all(
                  cartPayments.map(async cartPayment => {
                     try {
                        const { updateCartPayment = {} } = await client.request(
                           UPDATE_CART_PAYMENT,
                           {
                              id: cartPayment.id,
                              _inc: {
                                 paymentRetryAttempt: 1
                              }
                           }
                        )
                        return updateCartPayment
                     } catch (error) {
                        return {
                           success: false,
                           message: error.message
                        }
                     }
                  })
               )
               console.log({ updatedCartPayment })
               res.status(200).json(updatedCartPayment)
            }
         } else {
            const { createCartPayment = {} } = await client.request(
               CREATE_CART_PAYMENT,
               {
                  object: {
                     cartId: cart.id,
                     paymentRetryAttempt: 1,
                     amount: cart.balancePayment,
                     isTest: cart.isTest,
                     paymentMethodId: cart.paymentMethodId,
                     stripeCustomerId: cart.stripeCustomerId
                  }
               }
            )
            console.log({ createCartPayment })
            res.status(200).json(createCartPayment)
         }
      }
   } catch (error) {
      console.log(error)
      res.status(400).json({
         success: false,
         message: error.message
      })
   }
}
