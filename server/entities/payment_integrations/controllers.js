import moment from 'moment'
import { GraphQLClient } from 'graphql-request'

import {
   PAYMENT,
   UPDATE_CART,
   PAYMENT_PARTNERSHIP,
   INSERT_PAYMENT_RECORD,
   UPDATE_PAYMENT_RECORD
} from './graphql'
import { logger } from '../../utils'
import * as razorpay from './razorpay'
import { client } from '../../lib/graphql'

export const initiate = async (req, res) => {
   try {
      const {
         cartId = '',
         amount = null,
         keycloakId = null,
         partnershipId = null
      } = req.body

      if (!partnershipId) throw Error('Missing partnership id!')
      if (!amount) throw Error('Amount is required!')
      if (amount <= 0) throw Error('Amount must be greater than 0!')
      if (!keycloakId) throw Error('Missing customer user id!')

      const { partnership = null } = await client.request(PAYMENT_PARTNERSHIP, {
         id: partnershipId
      })

      if (!partnership) throw Error('Partnership does not exist!')

      const { insertPaymentRecord } = await client.request(
         INSERT_PAYMENT_RECORD,
         {
            object: {
               amount,
               orderCartId: cartId,
               paymentStatus: 'PENDING',
               paymentRequestInfo: req.body,
               customerKeycloakId: keycloakId,
               paymentPartnershipId: partnership.id,
               ...(partnership.isPayoutRequired
                  ? { payouts: { data: {} } }
                  : { commissions: { data: {} } })
            }
         }
      )

      return res.status(200).json({ success: true, data: insertPaymentRecord })
   } catch (error) {
      logger('/api/payment/request/initiate', JSON.stringify(error))
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const processRequest = async (req, res) => {
   try {
      const { paymentPartnershipId } = req.body.event.data.new

      const { partnership = null } = await client.request(PAYMENT_PARTNERSHIP, {
         id: paymentPartnershipId
      })

      const { company = null } = partnership

      if (!company)
         throw Error('No payment provider linked with this partnership!')

      if (!partnership.publishableConfig) {
         throw Error('Publishable keys are required!')
      }
      if (Object.keys(partnership.publishableConfig).length === 0) {
         throw Error('Publishable keys are required!')
      }
      if (!partnership.secretConfig) {
         throw Error('Secret keys are required!')
      }
      if (Object.keys(partnership.secretConfig).length === 0) {
         throw Error('Secret keys are required!')
      }

      const { identifier } = company

      if (!identifier in providers)
         throw Error('Missing integration with this payment provider')

      let request = {}

      request = await providers[identifier].request({
         keys: {
            publishable: partnership.publishableConfig,
            secret: partnership.secretConfig
         },
         data: { ...req.body.event.data.new, currency: partnership.currency }
      })

      return res.status(200).json({ success: true, data: request })
   } catch (error) {
      logger('/api/payment/request/process', JSON.stringify(error))
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const processTransaction = async (req, res) => {
   try {
      const { paymentId = '' } = req.body

      if (!paymentId) throw Error('Payment id is required!')

      const { payment = null } = await client.request(PAYMENT, {
         id: paymentId
      })

      if (!payment) throw Error('No such payment exists!')

      const { partnership: { company: { identifier = '' } = {} } = {} } =
         payment

      if (!identifier) throw Error('Payment integration is not mapped yet!')

      let transaction

      transaction = await providers[identifier].transaction({
         data: req.body,
         payment
      })
      return res.status(200).json({ success: true, data: { transaction } })
   } catch (error) {
      logger('/api/payment/transaction/process', JSON.stringify(error))
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const handleCart = async (req, res) => {
   try {
      const {
         id,
         orderCartId,
         paymentStatus,
         paymentRequestInfo,
         paymentPartnershipId,
         paymentTransactionId,
         paymentTransactionInfo
      } = req.body.event.data.new

      const { partnership } = await client.request(PAYMENT_PARTNERSHIP, {
         id: paymentPartnershipId
      })

      if (!partnership)
         throw Error('No payment provider linked with this partnership!')

      if (!('organization' in partnership))
         throw Error('No organization is linked with partnership!')
      if (
         !('datahubUrl' in partnership.organization || {}) &&
         !partnership.organization.datahubUrl
      )
         throw Error('Missing datahub url!')
      if (
         !('adminSecret' in partnership.organization || {}) &&
         !partnership.organization.adminSecret
      )
         throw Error('Missing admin secret!')

      await client.request(UPDATE_CART, {
         id: orderCartId,
         _set: {
            ...(paymentStatus === 'DISCARDED'
               ? {
                    paymentId: null,
                    transactionId: null,
                    paymentStatus: 'PENDING',
                    paymentRequestInfo: null,
                    paymentUpdatedAt: null,
                    transactionRemark: null
                 }
               : {
                    paymentId: id,
                    paymentStatus,
                    paymentRequestInfo,
                    transactionId: paymentTransactionId,
                    paymentUpdatedAt: moment().toISOString(),
                    transactionRemark: paymentTransactionInfo
                 })
         }
      })
      return res.status(200).json({ success: true, message: 'Cart updated!' })
   } catch (error) {
      logger('/api/payment/cart', JSON.stringify(error))
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const discard = async (req, res) => {
   try {
      const { paymentId = '' } = req.body
      if (!paymentId) throw Error('Payment Id is required!')

      await client.request(UPDATE_PAYMENT_RECORD, {
         pk_columns: { id: paymentId },
         _set: { paymentStatus: 'DISCARDED' }
      })
   } catch (error) {
      logger('/api/payment/discard', JSON.stringify(error))
      return res.status(400).json({ success: false, error: error.message })
   }
}

const providers = {
   '924bf963-28e6-4cdb-9773-0df63d04a89c': {
      request: razorpay.request,
      transaction: razorpay.transaction
   }
}
