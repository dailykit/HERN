import gql from 'graphql-tag'

export const ISTEST = gql`
   mutation ISTEST($keycloakId: String!, $isTest: Boolean!) {
      updateCustomer(
         pk_columns: { keycloakId: $keycloakId }
         _set: { isTest: $isTest }
      ) {
         isTest
      }
   }
`

export const COUPON_ACTIVE = gql`
   mutation COUPON_ACTIVE($couponId: Int!, $isActive: Boolean!) {
      updateCoupon(
         pk_columns: { id: $couponId }
         _set: { isActive: $isActive }
      ) {
         isActive
      }
   }
`

export const CAMPAIGN_ACTIVE = gql`
   mutation CAMPAIGN_ACTIVE($campaignId: Int!, $isActive: Boolean!) {
      updateCampaign(
         pk_columns: { id: $campaignId }
         _set: { isActive: $isActive }
      ) {
         id
         isActive
         type
      }
   }
`

export const CREATE_CAMPAIGN = gql`
   mutation CREATE_CAMPAIGN($object: crm_campaign_insert_input!) {
      createCampaign(object: $object) {
         id
         type
         isActive
         metaDetails
      }
   }
`
export const CREATE_CAMPAIGNS = gql`
   mutation MyMutation($objects: [crm_campaign_insert_input!]!) {
      createCampaigns(objects: $objects) {
         affected_rows
         returning {
            id
            metaDetails
         }
      }
   }
`
export const CREATE_COUPON = gql`
   mutation CREATE_COUPON($object: crm_coupon_insert_input!) {
      createCoupon(object: $object) {
         id
         code
      }
   }
`

export const CREATE_COUPONS = gql`
   mutation CreateCoupons($objects: [crm_coupon_insert_input!]!) {
      createCoupons(objects: $objects) {
         affected_rows
         returning {
            id
            code
         }
      }
   }
`

export const CREATE_REWARD = gql`
   mutation CREATE_REWARD($objects: [crm_reward_insert_input!]!) {
      insert_crm_reward(objects: $objects) {
         returning {
            id
            conditionId
         }
      }
   }
`

export const UPDATE_COUPON = gql`
   mutation UPDATE_COUPON($id: Int!, $set: crm_coupon_set_input) {
      updateCoupon(pk_columns: { id: $id }, _set: $set) {
         id
         code
         isActive
      }
   }
`
export const UPDATE_CAMPAIGN = gql`
   mutation UPDATE_CAMPAIGN($id: Int!, $set: crm_campaign_set_input) {
      updateCampaign(pk_columns: { id: $id }, _set: $set) {
         id
         type
         isActive
      }
   }
`
export const UPDATE_REWARD = gql`
   mutation UPDATE_REWARD($id: Int!, $set: crm_reward_set_input!) {
      update_crm_reward_by_pk(pk_columns: { id: $id }, _set: $set) {
         id
         type
      }
   }
`

export const DELETE_COUPON = gql`
   mutation DELETE_COUPON($id: Int!) {
      updateCoupon(pk_columns: { id: $id }, _set: { isArchived: true }) {
         id
         isArchived
      }
   }
`

export const DELETE_CAMPAIGN = gql`
   mutation DELETE_CAMPAIGN($campaignId: Int!) {
      updateCampaign(
         pk_columns: { id: $campaignId }
         _set: { isArchived: true }
      ) {
         id
         isArchived
      }
   }
`

export const DELETE_REWARD = gql`
   mutation DELETE_REWARD($id: Int!) {
      delete_crm_reward_by_pk(id: $id) {
         id
         campaignId
         type
      }
   }
`
export const UPSERT_BRAND_COUPON = gql`
   mutation UPSERT_BRAND_COUPON($object: crm_brand_coupon_insert_input!) {
      createBrandCoupon(
         object: $object
         on_conflict: {
            constraint: brand_coupon_pkey
            update_columns: isActive
         }
      ) {
         brandId
         couponId
         isActive
      }
   }
`

export const UPSERT_BRAND_CAMPAIGN = gql`
   mutation UPSERT_BRAND_CAMPAIGN($object: crm_brand_campaign_insert_input!) {
      createBrandCampaign(
         object: $object
         on_conflict: {
            constraint: brand_campaign_pkey
            update_columns: isActive
         }
      ) {
         brandId
         campaignId
         isActive
      }
   }
`
export const CUSTOMER_ARCHIVED = gql`
   mutation CUSTOMER_ARCHIVED($keycloakId: String!) {
      updateCustomer(
         pk_columns: { keycloakId: $keycloakId }
         _set: { isArchived: true }
      ) {
         keycloakId
         isArchived
      }
   }
`

export const CREATE_WALLET_TXN = gql`
   mutation CreateWalletTransaction(
      $object: crm_walletTransaction_insert_input!
   ) {
      createWalletTransaction(object: $object) {
         id
      }
   }
`

export const CREATE_LOYALTY_POINT_TXN = gql`
   mutation CreateLoyaltyPointTransaction(
      $object: crm_loyaltyPointTransaction_insert_input!
   ) {
      createLoyaltyPointsTransaction(object: $object) {
         id
      }
   }
`

export const IMPERSONATE_USER_TOKEN = gql`
   mutation ImpersonateUser($keycloakId: String!, $clientId: String!) {
      impersonateUser(keycloakId: $keycloakId, clientId: $clientId) {
         success
         message
         token
      }
   }
`
