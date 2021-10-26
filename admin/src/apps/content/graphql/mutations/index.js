import gql from 'graphql-tag'

export const ADD_INFO_GRID = gql`
   mutation MyMutation($object: content_informationGrid_insert_input!) {
      insert_content_informationGrid_one(object: $object) {
         id
         heading
      }
   }
`
export const UPDATE_INFO_GRID = gql`
   mutation MyMutation($id: Int!, $set: content_informationGrid_set_input!) {
      update_content_informationGrid(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            heading
            subHeading
            page
            identifier
         }
      }
   }
`

export const UPDATE_INFO_FAQ = gql`
   mutation MyMutation($id: Int!, $set: content_faqs_set_input!) {
      update_content_faqs(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            heading
            subHeading
            page
            identifier
         }
      }
   }
`
export const INSERT_INFO_FAQ = gql`
   mutation MyMutation($object: content_faqs_insert_input!) {
      insert_content_faqs_one(object: $object) {
         id
      }
   }
`

export const INSERT_INFO_GRID = gql`
   mutation MyMutation($object: content_informationGrid_insert_input!) {
      insert_content_informationGrid_one(object: $object) {
         id
      }
   }
`
export const GRID_ARCHIVED = gql`
   mutation GRID_ARCHIVED($id: Int!) {
      update_content_informationGrid(
         where: { id: { _eq: $id } }
         _set: { isArchived: true }
      ) {
         returning {
            id
            isArchived
         }
      }
   }
`
export const FAQ_ARCHIVED = gql`
   mutation FAQ_ARCHIVED($id: Int!) {
      update_content_faqs(
         where: { id: { _eq: $id } }
         _set: { isArchived: true }
      ) {
         returning {
            id
            isArchived
         }
      }
   }
`
export const WEBPAGE_ARCHIVED = gql`
   mutation WEBPAGE_ARCHIVED($pageId: Int!, $brandId: Int!) {
      update_brands_brandPages(
         where: { id: { _eq: $pageId }, brandId: { _eq: $brandId } }
         _set: { isArchived: true }
      ) {
         returning {
            brandId
            internalPageName
            route
         }
      }
   }
`

export const UPDATE_WEBPAGE = gql`
   mutation UPDATE_WEBPAGE($pageId: Int!, $set: brands_brandPages_set_input!) {
      update_brands_brandPages_by_pk(pk_columns: { id: $pageId }, _set: $set) {
         internalPageName
         published
         route
         id
      }
   }
`
export const LINK_COMPONENT = gql`
   mutation LINK_COMPONENT($objects: [brands_brandPageModule_insert_input!]!) {
      insert_brands_brandPageModule(objects: $objects) {
         returning {
            fileId
            brandPageId
            moduleType
            templateId
            internalModuleIdentifier
         }
      }
   }
`
export const UPDATE_LINK_COMPONENT = gql`
   mutation UPDATED_LINK_COMPONENT(
      $brandPageModuleId: Int!
      $_set: brands_brandPageModule_set_input!
   ) {
      update_brands_brandPageModule(
         where: { id: { _eq: $brandPageModuleId } }
         _set: $_set
      ) {
         returning {
            config
            id
         }
      }
   }
`
export const DELETE_LINKED_COMPONENT = gql`
   mutation DELETE_LINKED_COMPONENT($where: brands_brandPageModule_bool_exp!) {
      delete_brands_brandPageModule(where: $where) {
         returning {
            fileId
            id
         }
      }
   }
`
export const CREATE_WEBPAGE = gql`
   mutation CREATE_WEBPAGE($object: brands_brandPages_insert_input!) {
      insert_brands_brandPages_one(object: $object) {
         id
         internalPageName
      }
   }
`
export const INSERT_SUBSCRIPTION_FOLD = gql`
   mutation INSERT_SUBSCRIPTION_FOLDS($fileId: Int!, $identifier: String!) {
      insert_content_subscriptionDivIds(
         objects: { fileId: $fileId, id: $identifier }
         on_conflict: {
            constraint: subscriptionDivIds_pkey
            update_columns: fileId
         }
      ) {
         returning {
            identifier: id
            fileId
         }
      }
   }
`
export const DELETE_SUBSCRIPTION_FOLD = gql`
   mutation DELETE_SUBSCRIPTION_FOLD($identifier: String!, $fileId: Int!) {
      delete_content_subscriptionDivIds(
         where: { id: { _eq: $identifier }, fileId: { _eq: $fileId } }
      ) {
         returning {
            fileId
            id
         }
      }
   }
`

export const INSERT_NAVIGATION_MENU = gql`
   mutation INSERT_NAVIGATION_MENU($title: String!) {
      insert_brands_navigationMenu_one(object: { title: $title }) {
         id
         isPublished
         title
      }
   }
`
export const DELETE_NAVIGATION_MENU = gql`
   mutation DELETE_NAVIGATION_MENU($menuId: Int!) {
      delete_brands_navigationMenu(where: { id: { _eq: $menuId } }) {
         returning {
            id
            title
         }
      }
   }
`
export const UPDATE_NAVIGATION_MENU = gql`
   mutation UPDATE_NAVIGATION_MENU(
      $_set: brands_navigationMenu_set_input!
      $menuId: Int!
   ) {
      update_brands_navigationMenu(
         where: { id: { _eq: $menuId } }
         _set: $_set
      ) {
         returning {
            id
            isPublished
            title
         }
      }
   }
`
export const INSERT_NAVIGATION_MENU_ITEM = gql`
   mutation INSERT_NAVIGATION_MENU_ITEM(
      $label: String!
      $navigationMenuId: Int
      $parentNavigationMenuItemId: Int
   ) {
      insert_brands_navigationMenuItem_one(
         object: {
            label: $label
            navigationMenuId: $navigationMenuId
            parentNavigationMenuItemId: $parentNavigationMenuItemId
         }
      ) {
         id
         navigationMenuId
         parentNavigationMenuItemId
         label
         openInNewTab
         position
         url
      }
   }
`

export const UPDATE_NAVIGATION_MENU_ITEM = gql`
   mutation UPDATE_NAVIGATION_MENU_ITEM(
      $menuItemId: Int!
      $_set: brands_navigationMenuItem_set_input!
   ) {
      update_brands_navigationMenuItem_by_pk(
         pk_columns: { id: $menuItemId }
         _set: $_set
      ) {
         id
         label
         navigationMenuId
         openInNewTab
         parentNavigationMenuItemId
         position
         url
      }
   }
`

export const DELETE_NAVIGATION_MENU_ITEM = gql`
   mutation DELETE_NAVIGATION_MENU_ITEM($menuItemId: Int!) {
      delete_brands_navigationMenuItem_by_pk(id: $menuItemId) {
         id
         navigationMenuId
         parentNavigationMenuItemId
         label
      }
   }
`
export const GET_SYSTEM_MODULES = gql`
   subscription {
      brands_systemModule {
         identifier
         description
      }
   }
`
export const UPSERT_BRANDS_SEO = gql`
   mutation upsertBrandsSeo(
      $object: brands_brandPage_brandPageSetting_insert_input!
   ) {
      upsertBrandsSeo: insert_brands_brandPage_brandPageSetting_one(
         on_conflict: {
            constraint: brandPage_brandPageSetting_pkey
            update_columns: [value]
         }
         object: $object
      ) {
         value
         brandPageId
         brandPageSettingId
         brandPageSetting {
            id
            identifier
            type
         }
      }
   }
`
export const LINK_PAGE_FILES = gql`
   mutation LINK_PAGE_FILES(
      $objects: [brands_pagesLinkedFiles_insert_input!]!
   ) {
      insert_brands_pagesLinkedFiles(objects: $objects) {
         returning {
            id
            fileId
            fileType
         }
      }
   }
`

export const DELETE_PAGE_LINKED_FILES = gql`
   mutation DELETE_PAGE_LINKED_FILES($id: Int!) {
      delete_brands_pagesLinkedFiles(where: { id: { _eq: $id } }) {
         returning {
            fileId
            linkedFile {
               fileName
            }
         }
      }
   }
`
