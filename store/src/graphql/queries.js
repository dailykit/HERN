import { gql } from '@apollo/client'

export const EXPERIENCE_CLASS_INFO = gql`
   query EXPERIENCE_CLASS_INFO($experienceId: Int!) {
      privateClassType: experiences_experienceClass(
         where: {
            privateExperienceClassTypeId: { _is_null: false }
            experienceId: { _eq: $experienceId }
         }
         order_by: { startTimeStamp: asc }
      ) {
         id
         startTimeStamp
         isActive
         isBooked
         duration
         classTypeInfo: privateExperienceClassType {
            id
            maximumParticipant
            minimumBookingAmount
            minimumParticipant
            priceRanges
         }
         experience {
            id
            title
         }
      }
      publicClassType: experiences_experienceClass(
         where: {
            publicExperienceClassTypeId: { _is_null: false }
            experienceId: { _eq: $experienceId }
         }
         order_by: { startTimeStamp: asc }
      ) {
         id
         startTimeStamp
         isActive
         isBooked
         duration
         classTypeInfo: privateExperienceClassType {
            id
            maximumParticipant
            minimumBookingAmount
            minimumParticipant
            priceRanges
         }
         experience {
            id
            title
         }
      }
   }
`

export const EXPERIENCES_QUERY = gql`
   query EXPERIENCES_QUERY {
      experiences_experience {
         id
         title
      }
   }
`

export const WEBSITE_PAGE_MODULE = gql`
   query WEBSITE_PAGE_MODULE($where: content_experienceDivId_bool_exp!) {
      content_experienceDivId(where: $where) {
         experienceCategoryTitle
         experienceId
         expertId
         id
         websitePageId
         websitePage {
            id
            internalPageName
            websitePageModules(order_by: { position: desc_nulls_last }) {
               id
               config
               position
               moduleType
               fileId
               templateId
               internalModuleIdentifier
               subscriptionDivFileId: file {
                  path
                  linkedCssFiles {
                     id
                     cssFile {
                        id
                        path
                     }
                  }
                  linkedJsFiles {
                     id
                     jsFile {
                        id
                        path
                     }
                  }
               }
            }
         }
      }
   }
`

export const GET_PAGE_MODULES = gql`
   query WEBSITE_PAGE($domain: String!, $route: String!) {
      website_websitePage(
         where: {
            route: { _eq: $route }
            website: {
               brand: {
                  _or: [
                     { isDefault: { _eq: true } }
                     { domain: { _eq: $domain } }
                  ]
               }
            }
         }
      ) {
         id
         internalPageName
         isArchived
         published
         route

         websitePageModules(order_by: { position: desc_nulls_last }) {
            id
            config
            position
            moduleType
            fileId
            templateId
            internalModuleIdentifier
            subscriptionDivFileId: file {
               path
               linkedCssFiles {
                  id
                  cssFile {
                     id
                     path
                  }
               }
               linkedJsFiles {
                  id
                  jsFile {
                     id
                     path
                  }
               }
            }
         }
         website {
            navigationMenuId
         }
      }
   }
`

export const NAVBAR_MENU = gql`
   query NAVBAR_MENU($domain: String!) {
      website_navigationMenu(
         where: {
            websites: {
               brand: {
                  _or: [
                     { isDefault: { _eq: true } }
                     { domain: { _eq: $domain } }
                  ]
               }
            }
         }
      ) {
         id
         isPublished
         title
         navigationMenuItems(
            order_by: { position: desc_nulls_last }
            where: { parentNavigationMenuItemId: { _is_null: true } }
         ) {
            id
            label
            openInNewTab
            position
            url
            parentNavigationMenuItemId
            navigationMenuId
            childNavigationMenuItems(order_by: { position: desc_nulls_last }) {
               id
               label
               navigationMenuId
               parentNavigationMenuItemId
               position
               url
            }
         }
      }
   }
`

export const EXPERIENCE_BOOKING_PARTICIPANT_INFO = gql`
   query EXPERIENCE_BOOKING_PARTICIPANT_INFO($id: Int!) {
      experienceBookingParticipant(id: $id) {
         id
         experienceBookingId
         cartId
         email
         isArchived
         keycloakId
         phone
         rsvp
         participantChoices: experienceBookingParticipantChoices {
            experienceBookingOptionId
         }
      }
   }
`

export const EXPERTS = gql`
   query EXPERTS {
      experts_expert {
         id
         firstName
         lastName
         email
      }
   }
`

export const EXPERT_INFO = gql`
   query EXPERT_INFO($expertId: Int!) {
      experts_expert_by_pk(id: $expertId) {
         firstName
         id
         lastName
         email
         description
         assets
         experience_experts {
            experienceId
            experience {
               assets
               description
               id
               title
               experience_experienceCategories {
                  experienceCategoryTitle
               }
               experienceClasses {
                  id
                  isActive
                  isBooked
                  startTimeStamp
                  duration

                  experienceClassExpert {
                     assets
                     description
                     email
                     firstName
                     id
                     lastName
                  }
               }
            }
         }
         experience_experts_aggregate {
            aggregate {
               count
            }
         }
      }
   }
`

export const SIMILAR_CATEGORY_EXPERIENCE = gql`
   query CATEGORY_EXPERIENCE($tags: [Int!]!) {
      experiences_experienceCategory(
         where: {
            experience_experienceCategories: {
               experience: {
                  experience_experienceTags: {
                     experienceTag: { id: { _in: $tags } }
                  }
               }
            }
         }
      ) {
         title
         description
         assets
         experience_experienceCategories {
            experience {
               assets
               description
               id
               title
               customer_savedEntities {
                  id
                  experienceId
                  productId
                  simpleRecipeId
               }
               experienceClasses {
                  id
                  isActive
                  isBooked
                  startTimeStamp
                  duration

                  experienceClassExpert {
                     assets
                     description
                     email
                     firstName
                     id
                     lastName
                  }
                  privateExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
                  publicExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
               }
            }
         }
      }
   }
`

export const CATEGORY_EXPERIENCE = gql`
   query CATEGORY_EXPERIENCE($tags: [Int!], $params: jsonb!) {
      experiences_experienceCategory(
         where: {
            experience_experienceCategories: {
               experience: {
                  experience_experienceTags: {
                     experienceTag: { id: { _in: $tags } }
                  }
               }
            }
         }
      ) {
         title
         description
         assets
         experience_experienceCategories {
            experience {
               assets
               description
               id
               title
               isSaved(args: { params: $params })
               customer_savedEntities {
                  id
                  experienceId
                  productId
                  simpleRecipeId
               }
               experienceClasses {
                  id
                  isActive
                  isBooked
                  startTimeStamp
                  duration

                  experienceClassExpert {
                     assets
                     description
                     email
                     firstName
                     id
                     lastName
                  }
                  privateExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
                  publicExperienceClassType {
                     minimumBookingAmount
                     minimumParticipant
                     maximumParticipant
                  }
               }
            }
         }
      }
   }
`

export const GET_GLOBAL_FOOTER = gql`
   query GET_GLOBAL_FOOTER($where: brands_brand_storeSetting_bool_exp!) {
      brands_brand_storeSetting(where: $where) {
         brandId
         storeSettingId
         value
      }
   }
`

export const GET_FILE_PATH = gql`
   query GET_FILE_PATH($id: Int!) {
      editor_file_by_pk(id: $id) {
         id
         path
      }
   }
`
