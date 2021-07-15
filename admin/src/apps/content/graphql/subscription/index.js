import gql from 'graphql-tag'

export const FAQS = gql`
   subscription FAQS {
      content_faqs(where: { isArchived: { _eq: false } }) {
         id
         heading
         subHeading
      }
   }
`

export const INFORMATION_GRID = gql`
   subscription INFORMATION_GRID {
      content_informationGrid(where: { isArchived: { _eq: false } }) {
         id
         heading
         subHeading
      }
   }
`

export const INFO_GRID_ONE = gql`
   subscription INFO_GRID_ONE($id: Int!) {
      content_informationGrid(where: { id: { _eq: $id } }) {
         id
         heading
         subHeading
         page
         identifier
      }
   }
`
export const FAQ_ONE = gql`
   subscription FAQ_ONE($id: Int!) {
      content_faqs(where: { id: { _eq: $id } }) {
         id
         subHeading
         heading
         page
         identifier
      }
   }
`

export const INFO_COUNT = gql`
   subscription INFO_COUNT {
      content_informationGrid_aggregate {
         aggregate {
            count
         }
      }
   }
`
export const INFORMATION_BLOCK = gql`
   query INFORMATION_BLOCK($faqId: Int, $gridId: Int) {
      content_informationBlock(
         where: { faqsId: { _eq: $faqId }, informationGridId: { _eq: $gridId } }
      ) {
         description
         id
         thumbnail
         title
      }
   }
`
export const CONTENT_PAGE = gql`
   subscription CONTENT_PAGE {
      content_page {
         title
         description
         identifiers {
            title
         }
      }
   }
`
export const CONTENT_PAGE_ONE = gql`
   subscription CONTENT_PAGE_ONE($page: String!) {
      content_page_by_pk(title: $page) {
         title
         description
         identifiers {
            identifier: title
         }
      }
   }
`

export const BRAND_LISTING = gql`
   subscription BRAND_LISTING {
      brands(where: { isPublished: { _eq: true } }) {
         id
         domain
         title
         isDefault
         subscriptionRequested
         onDemandRequested
         website {
            id
         }
      }
   }
`
export const WEBSITE_PAGES_LISTING = gql`
   subscription WEBSITE_PAGES_LISTING($websiteId: Int!) {
      website_websitePage(
         where: { websiteId: { _eq: $websiteId }, isArchived: { _eq: false } }
      ) {
         id
         internalPageName
         route
         websiteId
         published
      }
   }
`

export const WEBSITE_TOTAL_PAGES = gql`
   subscription WEBSITE_TOTAL_PAGES($websiteId: Int!) {
      website_websitePage_aggregate(
         where: { websiteId: { _eq: $websiteId }, isArchived: { _eq: false } }
      ) {
         aggregate {
            count
         }
      }
   }
`
export const PAGE_INFO = gql`
   subscription PAGE_INFO($pageId: Int!) {
      website_websitePage_by_pk(id: $pageId) {
         internalPageName
         published
         route
      }
   }
`
export const GET_FILES = gql`
   subscription GET_FILES($linkedFile: [Int!]!, $fileTypes: [String!]!) {
      editor_file_aggregate(
         where: { id: { _nin: $linkedFile }, fileType: { _in: $fileTypes } }
      ) {
         nodes {
            id
            fileName
            fileType
            path
         }
      }
   }
`

export const GET_TEMPLATES = gql`
   subscription GET_TEMPLATES($linkedTemplates: [Int!]!) {
      editor_template_aggregate(where: { id: { _nin: $linkedTemplates } }) {
         nodes {
            id
            name
            route
            type
         }
      }
   }
`

export const LINKED_COMPONENT = gql`
   subscription NAVIGATION_MENU_INFO($menuId: Int!) {
      website_navigationMenuItem(
         where: { navigationMenuId: { _eq: $menuId } }
         order_by: { position: desc_nulls_last }
      ) {
         id
         label
         navigationMenuId
         openInNewTab
         parentNavigationMenuItemId
         position
         url
         navigationMenu {
            isPublished
            title
         }
      }
   }
`
export const GET_SUBSCRIPTION_FOLDS = gql`
   subscription GET_SUBSCRIPTION_FOLDS {
      content_subscriptionDivIds {
         fileId
         identifier: id
         subscriptionDivFileId {
            fileName
            fileType
            path
         }
      }
   }
`

export const FOLD_AGGREGATE = gql`
   subscription FOLD_AGGREGATE {
      content_subscriptionDivIds_aggregate {
         aggregate {
            count
         }
      }
   }
`
export const MENU_AGGREGATE = gql`
   subscription MENU_AGGREGATE {
      website_navigationMenu_aggregate {
         aggregate {
            count
         }
      }
   }
`

export const NAVIGATION_MENU = gql`
   subscription NAVIGATION_MENU {
      website_navigationMenu {
         id
         title
         isPublished
      }
   }
`
export const NAVIGATION_MENU_INFO = gql`
   subscription NAVIGATION_MENU_INFO($menuId: Int!) {
      website_navigationMenuItem(
         where: { navigationMenuId: { _eq: $menuId } }
         order_by: { position: desc_nulls_last }
      ) {
         id
         label
         navigationMenuId
         openInNewTab
         parentNavigationMenuItemId
         position
         url
         navigationMenu {
            isPublished
            title
         }
      }
   }
`
