import get_env from '../../../get_env'
import { client } from '../../lib/graphql'
const {
   FULL_OCCURENCE_REPORT,
   CREATE_SUBSCRIPTION_OCCURENCE,
   HASURA_OPERATION_EXTRACT_TO_BE_OCCURECES,
   HASURA_OPERATION
} = require('./graphql')
export const fullOccurenceReport = async (req, res) => {
   try {
      let data = await client.request(FULL_OCCURENCE_REPORT)
      let toBeOccurencesArray = []
      console.log('Step1 start', new Date())
      data.brandCustomers.forEach(each => {
         const subscriptionSubscriptionOccurencesIds =
            each.subscription.subscriptionOccurences.map(
               subscriptionOccurence => subscriptionOccurence.id
            )
         const upcomingOccurencesIds = each.upcomingOccurences.map(
            upcomingOccurence => upcomingOccurence.id
         )
         const toBeOccurences = subscriptionSubscriptionOccurencesIds.filter(
            id => upcomingOccurencesIds.indexOf(id) == -1
         )
         if (toBeOccurences.length > 0) {
            toBeOccurences.forEach(toBeOccurenceId => {
               const newObject = {
                  brand_customerId: each.id,
                  subscriptionOccurenceId: toBeOccurenceId
               }
               toBeOccurencesArray = [...toBeOccurencesArray, newObject]
            })
         }
      })

      const DATA_HUB = await get_env('DATA_HUB')
      await fetch(DATA_HUB, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            query: CREATE_SUBSCRIPTION_OCCURENCE,
            variables: {
               object: toBeOccurencesArray
            }
         })
      })
      const updatedData = await client.request(FULL_OCCURENCE_REPORT)

      let finalArray = []
      const newData = updatedData.brandCustomers

      newData.forEach(each => {
         const allOccurences = [
            ...each.pastOccurences,
            ...each.upcomingOccurences
         ]
         const sortAllOccurence = allOccurences.sort(
            (a, b) =>
               new Date(a.subscriptionOccurence.fulfillmentDate) -
               new Date(b.subscriptionOccurence.fulfillmentDate)
         )
         sortAllOccurence.map((occurence, index) => {
            let skipAtThisStage = 0
            for (let i = 0; i < index; i++) {
               if (sortAllOccurence[i]['isSkipped']) {
                  skipAtThisStage += 1
               }
            }
            occurence.brandCustomerId = each.id
            occurence.email = each.customer.email
            occurence.skipAtThisStage = skipAtThisStage
            occurence.allTimeRank = index + 1
            occurence.percentageOfSkipping = parseFloat(
               (skipAtThisStage / (index + 1)) * 100
            ).toFixed(2)
         })
         console.log('this is sortallo', sortAllOccurence)
         sortAllOccurence.forEach(eachOccurence => {
            const flattenOccurence = {
               brand_customerId: eachOccurence.brandCustomerId,
               email: eachOccurence.email,
               subscriptionOccurenceId: eachOccurence.subscriptionOccurence.id,
               fulfillmentDate:
                  eachOccurence.subscriptionOccurence.fulfillmentDate,
               cutoffTimeStamp:
                  eachOccurence.subscriptionOccurence.cutoffTimeStamp,
               startTimeStamp:
                  eachOccurence.subscriptionOccurence.startTimeStamp,
               betweenPause: eachOccurence.betweenPause,
               paymentStatus:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.paymentStatus
                     : null,
               cartStatus:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.status
                     : null,
               cartTotalPrice:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.totalPrice
                     : null,
               cartId:
                  eachOccurence.cart !== null ? eachOccurence.cart.id : null,
               paymentRetryAttempt:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.paymentRetryAttempt
                     : null,
               discount:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.discount
                     : null,
               hasCart: eachOccurence.validStatus.hasCart,
               isItemCountValid: eachOccurence.validStatus.itemCountValid,
               addedProductsCount: eachOccurence.validStatus.addedProductsCount,
               pendingProductCount:
                  eachOccurence.validStatus.pendingProductsCount,
               itemCountValidComment:
                  eachOccurence.validStatus.itemCountValidComment,
               subscriptionItemCount:
                  eachOccurence.subscriptionOccurence.view_subscription
                     .subscriptionItemCount,
               subscriptionServingSize:
                  eachOccurence.subscriptionOccurence.view_subscription
                     .subscriptionServingSize,
               rrule: eachOccurence.subscriptionOccurence.view_subscription
                  .rrule,
               title: eachOccurence.subscriptionOccurence.view_subscription
                  .title,
               isPaused: eachOccurence.isPaused,
               isSkipped: eachOccurence.isSkipped,
               skippedAtThisStage: eachOccurence.skipAtThisStage,
               allTimeRank: eachOccurence.allTimeRank,
               percentageSkipped: eachOccurence.percentageOfSkipping
            }
            finalArray = [...finalArray, flattenOccurence]
         })
      })
      console.log('Step2 end', new Date())
      console.log('this is to be array', toBeOccurencesArray)
      res.json({
         data: finalArray
      })
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         message: 'error happened',
         error: error
      })
   }
}
export const actionFullOccurenceReport = async (req, res) => {
   try {
      console.log('this is body', req.body)
      const { brandCustomerFilter } = req.body.input
      const data = await client.request(
         HASURA_OPERATION_EXTRACT_TO_BE_OCCURECES,
         {
            brandCustomerFilter: brandCustomerFilter
         }
      )
      let toBeOccurencesArray = []
      data.brandCustomers.forEach(each => {
         if (each.subscription !== null) {
            const subscriptionSubscriptionOccurencesIds =
               each.subscription.subscriptionOccurences.map(
                  subscriptionOccurence => subscriptionOccurence.id
               )
            const upcomingOccurencesIds =
               each.upcomingOccurences.map(upcomingOccurence => {
                  return upcomingOccurence.subscriptionOccurence.id
               }) || []
            const toBeOccurences = subscriptionSubscriptionOccurencesIds.filter(
               id => upcomingOccurencesIds.indexOf(id) == -1
            )
            if (toBeOccurences.length > 0) {
               toBeOccurences.forEach(toBeOccurenceId => {
                  const newObject = {
                     brand_customerId: each.id,
                     subscriptionOccurenceId: toBeOccurenceId,
                     keycloakId: each.keycloakId
                  }
                  toBeOccurencesArray = [...toBeOccurencesArray, newObject]
               })
            }
         }
      })
      if (toBeOccurencesArray.length > 0) {
         await client.request(CREATE_SUBSCRIPTION_OCCURENCE, {
            objects: toBeOccurencesArray
         })
      }
      const updatedData = await client.request(HASURA_OPERATION, {
         brandCustomerFilter: brandCustomerFilter
      })

      let fullOccurenceReport = []
      const newData = updatedData.brandCustomers

      newData.forEach(each => {
         const allOccurences = [
            ...each.pastOccurences,
            ...each.upcomingOccurences
         ]
         const sortAllOccurence = allOccurences.sort(
            (a, b) =>
               new Date(a.subscriptionOccurence.fulfillmentDate) -
               new Date(b.subscriptionOccurence.fulfillmentDate)
         )
         sortAllOccurence.map((occurence, index) => {
            let skipAtThisStage = 0
            let pauseAtThisStage = 0
            for (let i = 0; i < index; i++) {
               if (sortAllOccurence[i]['isSkipped']) {
                  skipAtThisStage += 1
               }
               if (sortAllOccurence[i]['isPaused']) {
                  pauseAtThisStage += 1
               }
            }
            occurence.brandCustomerId = each.id
            occurence.email = each.customer.email
            occurence.fullName = each.customer.platform_customer
               ? each.customer.platform_customer.fullName
               : 'N/A'
            // occurence.fullName = 'Rahul'
            occurence.skipAtThisStage = skipAtThisStage
            occurence.allTimeRank = index + 1
            ;(occurence.percentageOfSkipping = parseFloat(
               (skipAtThisStage / (index + 1)) * 100
            ).toFixed(2)),
               (occurence.percentagePaused = parseFloat(
                  (pauseAtThisStage / (index + 1)) * 100
               ).toFixed(2))
         })
         // console.log('this is sortallo', sortAllOccurence)
         sortAllOccurence.forEach(eachOccurence => {
            const flattenOccurence = {
               brand_customerId: eachOccurence.brandCustomerId,
               email: eachOccurence.email,
               fullName: eachOccurence.fullName,
               subscriptionOccurenceId: eachOccurence.subscriptionOccurence.id,
               fulfillmentDate:
                  eachOccurence.subscriptionOccurence.fulfillmentDate,
               cutoffTimeStamp:
                  eachOccurence.subscriptionOccurence.cutoffTimeStamp,
               startTimeStamp:
                  eachOccurence.subscriptionOccurence.startTimeStamp,
               betweenPause: eachOccurence.betweenPause,
               paymentStatus:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.paymentStatus
                     : null,
               cartStatus:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.status
                     : null,
               cartTotalPrice:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.totalPrice
                     : null,
               cartId:
                  eachOccurence.cart !== null ? eachOccurence.cart.id : null,
               orderId:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.orderId
                     : null,
               paymentRetryAttempt:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.paymentRetryAttempt
                     : null,
               discount:
                  eachOccurence.cart !== null
                     ? eachOccurence.cart.discount
                     : null,
               hasCart: eachOccurence.validStatus.hasCart,
               isItemCountValid: eachOccurence.validStatus.itemCountValid,
               addedProductsCount: eachOccurence.validStatus.addedProductsCount,
               pendingProductCount:
                  eachOccurence.validStatus.pendingProductsCount,
               itemCountValidComment:
                  eachOccurence.validStatus.itemCountValidComment,
               subscriptionItemCount:
                  eachOccurence.subscriptionOccurence.view_subscription
                     .subscriptionItemCount,
               subscriptionServingSize:
                  eachOccurence.subscriptionOccurence.view_subscription
                     .subscriptionServingSize,
               rrule: eachOccurence.subscriptionOccurence.view_subscription
                  .rrule,
               title: eachOccurence.subscriptionOccurence.view_subscription
                  .title,
               isPaused: eachOccurence.isPaused,
               isSkipped: eachOccurence.isSkipped,
               skippedAtThisStage: eachOccurence.skipAtThisStage,
               allTimeRank: eachOccurence.allTimeRank,
               percentageSkipped: eachOccurence.percentageOfSkipping,
               percentagePaused: eachOccurence.percentagePaused
            }
            fullOccurenceReport = [...fullOccurenceReport, flattenOccurence]
         })
      })
      res.status(200).json(fullOccurenceReport)
   } catch (error) {
      console.log('this is', error)
      return res.status(400).json({ success: false, error: error.message })
   }
}
