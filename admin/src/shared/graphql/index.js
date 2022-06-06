import gql from 'graphql-tag'

export const APPS = {
   PERMISSIONS: gql`
      subscription roles(
         $email: String_comparison_exp!
         $title: String_comparison_exp!
      ) {
         roles(
            where: {
               users: { user: { email: $email } }
               apps: { app: { title: $title } }
            }
         ) {
            id
            title
            apps(where: { app: { title: $title } }) {
               id
               permissions(where: { value: { _eq: true } }) {
                  permission {
                     id
                     route
                     title
                  }
                  value
               }
            }
         }
      }
   `,
}

export const OPERATION_CONFIG = gql`
   query MyQuery {
      settings_operationConfig {
         id
         stationId
         station {
            id
            name
         }
         labelTemplateId
         labelTemplate {
            id
            name
         }
      }
   }
`

export const STATIONS = gql`
   query MyQuery {
      stations {
         id
         name
      }
   }
`

export const LABELS = gql`
   query MyQuery {
      labelTemplates {
         id
         name
      }
   }
`

export const STATION = gql`
   query MyQuery($stationId: Int!) {
      station(id: $stationId) {
         name
      }
   }
`

export const LABEL_TEMPLATE = gql`
   query MyQuery($labelId: Int!) {
      labelTemplate(id: $labelId) {
         name
      }
   }
`

export const CREATE_OPERATION_CONFIG = gql`
   mutation MyMutation($object: settings_operationConfig_insert_input!) {
      insertOperationConfig: insert_settings_operationConfig_one(
         object: $object
      ) {
         id
         station {
            id
            name
         }
         labelTemplate {
            id
            name
         }
      }
   }
`

export const TOOLTIPS_BY_APP = gql`
   query app($title: String!) {
      app: dailyos_ux_app_by_pk(title: $title) {
         showTooltip
         tooltips {
            id
            link
            isActive
            identifier
            description
         }
      }
   }
`

export const GET_BANNER_DATA = gql`
   subscription ux_dailyosDivId($id: String!, $params: jsonb!) {
      ux_dailyosDivId(where: { id: { _eq: $id }, isActive: { _eq: true } }) {
         id
         isActive
         dailyosDivIdFiles(where: { isActive: { _eq: true } }) {
            isActive
            condition {
               isValid(args: { params: $params })
            }
            divId
            file {
               id
               fileType
               fileName
               path
               linkedCssFiles {
                  id
                  position
                  cssFile {
                     fileName
                     fileType
                     path
                  }
               }
               linkedJsFiles {
                  id
                  position
                  jsFile {
                     fileName
                     fileType
                     path
                  }
               }
            }
            content
         }
      }
   }
`
export const UPDATE_BANNER_CLOSE_COUNT = gql`
   mutation UPDATE_CLOSE_COUNT(
      $divId: String!
      $userEmail: String!
      $fileId: Int!
   ) {
      update_ux_user_dailyosDivIdFile(
         where: {
            divId: { _eq: $divId }
            fileId: { _eq: $fileId }
            userEmail: { _eq: $userEmail }
         }
         _inc: { closedCount: 1 }
      ) {
         returning {
            closedCount
            divId
            fileId
            userEmail
         }
      }
   }
`
export const UPDATE_SHOWN_COUNT = gql`
   mutation UPDATE_SHOWN_COUNT(
      $divId: String!
      $userEmail: String!
      $fileId: Int!
   ) {
      update_ux_user_dailyosDivIdFile(
         where: {
            divId: { _eq: $divId }
            fileId: { _eq: $fileId }
            userEmail: { _eq: $userEmail }
         }
         _inc: { shownCount: 1 }
      ) {
         returning {
            divId
            fileId
            userEmail
            shownCount
         }
      }
   }
`

export const UPDATE_LAST_VISITED = gql`
   mutation UPDATE_LAST_VISITED(
      $divId: String!
      $userEmail: String!
      $fileId: Int!
      $lastVisited: timestamptz!
   ) {
      update_ux_user_dailyosDivIdFile(
         where: {
            divId: { _eq: $divId }
            fileId: { _eq: $fileId }
            userEmail: { _eq: $userEmail }
         }
         _set: { lastVisited: $lastVisited }
      ) {
         returning {
            divId
            fileId
            userEmail
            shownCount
            lastVisited
         }
      }
   }
`
export const GET_SHOW_COUNT = gql`
   query MyQuery($divId: String!, $fileId: Int!, $userEmail: String!) {
      ux_user_dailyosDivIdFile(
         where: {
            divId: { _eq: $divId }
            fileId: { _eq: $fileId }
            userEmail: { _eq: $userEmail }
         }
      ) {
         showAgain
         fileId
         divId
         userEmail
         shownCount
         lastVisited
         closedCount
      }
   }
`

export const GET_BOTTOM_BAR_OPTIONS = gql`
   subscription GET_BOTTOM_BAR_OPTIONS($app: [String!]!) {
      ux_bottomBarOption(where: { app: { _in: $app } }) {
         title
         id
         app
         icon
         navigationMenuId
         navigationMenu {
            title
            id
            description
            navigationMenuItems {
               id
               label
               position
               parentNavigationMenuItemId
               url
               actionId
               action {
                  actionTypeTitle
                  dailyos_action
                  fileId
                  id
                  file {
                     id
                     fileName
                     fileType
                     path
                     linkedCssFiles {
                        id
                        position
                        cssFile {
                           fileName
                           fileType
                           path
                        }
                     }
                     linkedJsFiles {
                        id
                        position
                        jsFile {
                           fileName
                           fileType
                           path
                        }
                     }
                  }
               }
            }
         }
      }
   }
`

export const SETTINGS_QUERY = gql`
   query settings($where: brands_brand_brandSetting_bool_exp!) {
      settings: brands_brand_brandSetting(where: $where) {
         value
         brandId
         meta: brandSetting {
            id
            type
            identifier
         }
      }
   }
`

export const GET_BRAND_COUPONS = gql`
   subscription couponsCollections($brandId: Int) {
      coupons: brandCoupons(
         where: {
            isActive: { _eq: true }
            brandId: { _eq: $brandId }
            coupon: { isActive: { _eq: true } }
         }
      ) {
         coupon {
            id
            title: code
            value: id
         }
      }
   }
`

export const GET_BRAND_CAMPAIGNS = gql`
   subscription campaignCollections($brandId: Int) {
      campaigns: brandCampaigns(
         where: {
            brandId: { _eq: $brandId }
            isActive: { _eq: true }
            campaign: { isActive: { _eq: true } }
         }
      ) {
         campaign {
            id
            type
            metaDetails
         }
      }
   }
`

export const GET_PAYMENT_OPTIONS = gql`
   subscription paymentOptions {
      paymentOptions: brands_availablePaymentOption(
         where: { isActive: { _eq: true } }
      ) {
         id
         description
         label
      }
   }
`
