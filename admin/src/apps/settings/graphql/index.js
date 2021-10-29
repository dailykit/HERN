import gql from 'graphql-tag'

export const STATIONS = {
   STATION: gql`
      subscription station($id: Int!) {
         station(id: $id) {
            id
            name
            defaultKotPrinterId
            defaultLabelPrinterId
            scale: assignedScales_aggregate {
               aggregate {
                  count
               }
               nodes {
                  active
                  deviceNum
                  deviceName
                  computer {
                     name
                     hostname
                     printNodeId
                  }
               }
            }
            labelPrinter: attachedLabelPrinters_aggregate {
               nodes {
                  active
                  labelPrinter {
                     name
                     state
                     printNodeId
                  }
               }
               aggregate {
                  count
               }
            }
            kotPrinter: attachedKotPrinters_aggregate {
               nodes {
                  active
                  kotPrinter {
                     name
                     state
                     printNodeId
                  }
               }
               aggregate {
                  count
               }
            }
            user: assignedUsers_aggregate {
               nodes {
                  active
                  user {
                     id
                     firstName
                     lastName
                     keycloakId
                  }
               }
               aggregate {
                  count
               }
            }
         }
      }
   `,
   AGGREGATE: gql`
      subscription stationsAggregate {
         stationsAggregate {
            aggregate {
               count
            }
         }
      }
   `,
   LIST: gql`
      subscription stations {
         stations: stationsAggregate {
            aggregate {
               count(columns: id)
            }
            nodes {
               id
               name
            }
         }
      }
   `,
   CREATE: gql`
      mutation insertStation($object: settings_station_insert_input!) {
         insertStation(
            object: $object
            on_conflict: { constraint: station_pkey, update_columns: [name] }
         ) {
            id
            name
         }
      }
   `,
   UPDATE: gql`
      mutation updateStation(
         $pk_columns: settings_station_pk_columns_input!
         $_set: settings_station_set_input!
      ) {
         updateStation(pk_columns: $pk_columns, _set: $_set) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation updateStation($id: Int!) {
         deleteStation(id: $id) {
            id
            name
         }
      }
   `,
   SCALES: {
      LIST: gql`
         subscription scales($stationId: Int!) {
            scales(
               where: { _not: { assignedStation: { id: { _eq: $stationId } } } }
            ) {
               deviceNum
               deviceName
               computer {
                  name
                  hostname
                  printNodeId
               }
            }
         }
      `,
      CREATE: gql`
         mutation updateScales(
            $computerId: Int!
            $deviceName: String!
            $deviceNum: Int!
            $stationId: Int!
         ) {
            updateScales(
               where: {
                  deviceNum: { _eq: $deviceNum }
                  deviceName: { _eq: $deviceName }
                  computerId: { _eq: $computerId }
               }
               _set: { stationId: $stationId }
            ) {
               returning {
                  deviceNum
                  deviceName
               }
            }
         }
      `,
      UPDATE: gql`
         mutation updateScale(
            $deviceNum: Int!
            $deviceName: String!
            $computerId: Int!
            $active: Boolean!
         ) {
            updateScale(
               pk_columns: {
                  computerId: $computerId
                  deviceName: $deviceName
                  deviceNum: $deviceNum
               }
               _set: { active: $active }
            ) {
               deviceNum
               deviceName
            }
         }
      `,
      DELETE: gql`
         mutation updateScale(
            $deviceNum: Int!
            $deviceName: String!
            $computerId: Int!
         ) {
            updateScale(
               pk_columns: {
                  computerId: $computerId
                  deviceName: $deviceName
                  deviceNum: $deviceNum
               }
               _set: { stationId: null }
            ) {
               deviceNum
            }
         }
      `,
   },
   USERS: {
      LIST: gql`
         subscription settings_user($_eq: Int!) {
            settings_user(
               where: {
                  _not: { assignedStations: { station: { id: { _eq: $_eq } } } }
               }
            ) {
               id
               lastName
               firstName
               keycloakId
            }
         }
      `,
      CREATE: gql`
         mutation createStation_users(
            $objects: [settings_station_user_insert_input!]!
         ) {
            createStation_users(objects: $objects) {
               returning {
                  stationId
                  userKeycloakId
               }
            }
         }
      `,
      DELETE: gql`
         mutation deleteStation_user(
            $stationId: Int!
            $userKeycloakId: String!
         ) {
            deleteStation_user(
               stationId: $stationId
               userKeycloakId: $userKeycloakId
            ) {
               stationId
               userKeycloakId
            }
         }
      `,
      UPDATE: gql`
         mutation updateStation_user(
            $stationId: Int!
            $userKeycloakId: String!
            $active: Boolean!
         ) {
            updateStation_user(
               pk_columns: {
                  stationId: $stationId
                  userKeycloakId: $userKeycloakId
               }
               _set: { active: $active }
            ) {
               stationId
               userKeycloakId
            }
         }
      `,
   },
   LABEL_PRINTERS: {
      LIST: gql`
         subscription labelPrinters($type: String, $stationId: Int!) {
            labelPrinters: printers(
               where: {
                  printerType: { _eq: $type }
                  _not: {
                     attachedStations_label: {
                        station: { id: { _eq: $stationId } }
                     }
                  }
               }
            ) {
               printNodeId
               name
               computer {
                  name
                  hostname
               }
            }
         }
      `,
      CREATE: gql`
         mutation insert_settings_station_label_printer(
            $objects: [settings_station_label_printer_insert_input!]!
         ) {
            insert_settings_station_label_printer(objects: $objects) {
               returning {
                  stationId
                  printNodeId
               }
            }
         }
      `,
      UPDATE: gql`
         mutation updateStationLabelPrinter(
            $printNodeId: Int!
            $stationId: Int!
            $active: Boolean!
         ) {
            updateStationLabelPrinter: update_settings_station_label_printer_by_pk(
               pk_columns: { printNodeId: $printNodeId, stationId: $stationId }
               _set: { active: $active }
            ) {
               stationId
            }
         }
      `,
      DELETE: gql`
         mutation deleteStationLabelPrinter(
            $stationId: Int!
            $printNodeId: Int!
         ) {
            deleteStationLabelPrinter: delete_settings_station_label_printer_by_pk(
               printNodeId: $printNodeId
               stationId: $stationId
            ) {
               stationId
               printNodeId
            }
         }
      `,
   },
   KOT_PRINTERS: {
      LIST: gql`
         subscription kotPrinters($type: String, $stationId: Int!) {
            kotPrinters: printers(
               where: {
                  printerType: { _eq: $type }
                  _not: {
                     attachedStations_kot: {
                        station: { id: { _eq: $stationId } }
                     }
                  }
               }
            ) {
               printNodeId
               name
               computer {
                  name
                  hostname
               }
            }
         }
      `,
      CREATE: gql`
         mutation insert_settings_station_kot_printer(
            $objects: [settings_station_kot_printer_insert_input!]!
         ) {
            insert_settings_station_kot_printer(objects: $objects) {
               returning {
                  stationId
                  printNodeId
               }
            }
         }
      `,
      UPDATE: gql`
         mutation updateStationKotPrinter(
            $printNodeId: Int!
            $stationId: Int!
            $active: Boolean!
         ) {
            updateStationKotPrinter: update_settings_station_kot_printer_by_pk(
               pk_columns: { printNodeId: $printNodeId, stationId: $stationId }
               _set: { active: $active }
            ) {
               stationId
            }
         }
      `,
      DELETE: gql`
         mutation deleteStationKotPrinter(
            $stationId: Int!
            $printNodeId: Int!
         ) {
            deleteStationKotPrinter: delete_settings_station_kot_printer_by_pk(
               printNodeId: $printNodeId
               stationId: $stationId
            ) {
               stationId
               printNodeId
            }
         }
      `,
   },
}

export const USERS = {
   USER: gql`
      subscription settings_user_by_pk($id: Int!) {
         settings_user_by_pk(id: $id) {
            id
            firstName
            lastName
            email
            phoneNo
            tempPassword
            keycloakId
         }
      }
   `,
   AGGREGATE: gql`
      subscription settings_user_aggregate {
         settings_user_aggregate {
            aggregate {
               count
            }
         }
      }
   `,
   LIST: gql`
      subscription users {
         users: settings_user_aggregate {
            aggregate {
               count(columns: keycloakId)
            }
            nodes {
               id
               firstName
               lastName
               email
               phoneNo
            }
         }
      }
   `,
   CREATE: gql`
      mutation insert_settings_user_one($object: settings_user_insert_input!) {
         insert_settings_user_one(object: $object) {
            id
            firstName
         }
      }
   `,
   UPDATE: gql`
      mutation update_settings_user_by_pk(
         $id: Int!
         $_set: settings_user_set_input!
      ) {
         update_settings_user_by_pk(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation delete_settings_user_by_pk($id: Int!) {
         delete_settings_user_by_pk(id: $id) {
            id
         }
      }
   `,
}

export const MASTER = {
   ACCOMPANIMENTS: {
      LIST: gql`
         subscription AccompanimentTypes {
            accompaniments {
               id
               name
            }
         }
      `,
      CREATE: gql`
         mutation MyMutation(
            $objects: [master_accompanimentType_insert_input!]!
         ) {
            createAccompaniments(objects: $objects) {
               returning {
                  id
                  name
               }
            }
         }
      `,
      DELETE: gql`
         mutation deleteAccompaniments($ids: [Int!]!) {
            deleteAccompaniments(where: { id: { _in: $ids } }) {
               returning {
                  id
                  name
               }
            }
         }
      `,
   },
   PROCESSINGS: {
      LIST: gql`
         subscription Processings {
            masterProcessings {
               id
               name
               ingredientProcessings {
                  id
               }
            }
         }
      `,
      CREATE: gql`
         mutation CreateProcessings(
            $objects: [master_processingName_insert_input!]!
         ) {
            createMasterProcessing(objects: $objects) {
               returning {
                  id
                  name
                  description
               }
            }
         }
      `,
      DELETE: gql`
         mutation DeleteProcessings($ids: [Int!]!) {
            deleteMasterProcessing(where: { id: { _in: $ids } }) {
               returning {
                  id
               }
            }
         }
      `,
   },
   CUISINES: {
      LIST: gql`
         subscription Cuisines {
            cuisineNames {
               id
               name
               simpleRecipes {
                  id
               }
            }
         }
      `,
      CREATE: gql`
         mutation CreateCuisines(
            $objects: [master_cuisineName_insert_input!]!
         ) {
            createCuisineName(objects: $objects) {
               returning {
                  id
                  name
               }
            }
         }
      `,
      DELETE: gql`
         mutation DeleteCuisines($ids: [Int!]!) {
            deleteCuisineName(where: { id: { _in: $ids } }) {
               returning {
                  id
               }
            }
         }
      `,
   },
   ALLERGENS: {
      LIST: gql`
         subscription Allergens {
            masterAllergens {
               id
               name
               description
            }
         }
      `,
      CREATE: gql`
         mutation CreateAllergens(
            $objects: [master_allergenName_insert_input!]!
         ) {
            createMasterAllergen(objects: $objects) {
               returning {
                  id
                  name
               }
            }
         }
      `,
      DELETE: gql`
         mutation DeleteAllergens($ids: [Int!]!) {
            deleteMasterAllergen(where: { id: { _in: $ids } }) {
               returning {
                  id
               }
            }
         }
      `,
   },
   UNITS: {
      LIST: gql`
         subscription Units {
            units {
               id
               name
            }
         }
      `,
      AGGREGATE: gql`
         subscription UnitsCount {
            unitsAggregate {
               aggregate {
                  count
               }
            }
         }
      `,
      CREATE: gql`
         mutation CreateUnits($objects: [master_unit_insert_input!]!) {
            createUnit(objects: $objects) {
               returning {
                  id
               }
            }
         }
      `,
      DELETE: gql`
         mutation DeleteUnits($ids: [Int!]!) {
            deleteUnit(where: { id: { _in: $ids } }) {
               returning {
                  id
               }
            }
         }
      `,
   },
   PRODUCT_CATEGORY: {
      LIST: gql`
         subscription productCategories {
            productCategories {
               name
            }
         }
      `,
      AGGREGATE: gql`
         subscription productCategoriesAggregate {
            productCategoriesAggregate {
               aggregate {
                  count
               }
            }
         }
      `,
      CREATE: gql`
         mutation insertProductCategory(
            $object: master_productCategory_insert_input!
         ) {
            insertProductCategory(object: $object) {
               name
            }
         }
      `,
      DELETE: gql`
         mutation deleteProductCategory(
            $where: master_productCategory_bool_exp!
         ) {
            deleteProductCategory(where: $where) {
               affected_rows
            }
         }
      `,
   },
   INGREDIENT_CATEGORY: {
      LIST: gql`
         subscription ingredientCategories {
            ingredientCategories {
               name
            }
         }
      `,
      AGGREGATE: gql`
         subscription ingredientCategoriesAggregate {
            ingredientCategoriesAggregate {
               aggregate {
                  count
               }
            }
         }
      `,
      CREATE: gql`
         mutation insertIngredientCategory($name: String!) {
            createIngredientCategory(object: { name: $name }) {
               name
            }
         }
      `,
      DELETE: gql`
         mutation deleteIngredientCategory($name: String!) {
            deleteIngredientCategory(name: $name) {
               name
            }
         }
      `,
   },
   VEG_NONVEG: {
      LIST: gql`
         subscription VegNonVeg {
            master_vegNonvegType {
               description
               icon
               label
            }
         }
      `,
      // CREATE:,
      // DELETE:,
   },
}

export const DEVICES = {
   LIST: gql`
      subscription computers {
         computers {
            name
            state
            hostname
            created_at
            updated_at
            printNodeId
            activePrinters: printers_aggregate(
               where: { state: { _eq: "online" } }
            ) {
               aggregate {
                  count
               }
            }
            totalPrinters: printers_aggregate {
               aggregate {
                  count
               }
            }
            printers {
               name
               state
               printNodeId
               computer {
                  name
               }
            }
            scales {
               deviceNum
               deviceName
               computer {
                  name
               }
            }
         }
      }
   `,
   PRINTNODE_DETAILS: gql`
      query admins {
         admins: organizationAdmins {
            email
            password: printNodePassword
         }
      }
   `,
   PRINTERS: {
      ONLINE: gql`
         query printers {
            printers(where: { state: { _eq: "online" } }) {
               printNodeId
               name
            }
         }
      `,
   },
}

export const PRINT_JOB = gql`
   mutation createPrintJob(
      $contentType: String!
      $printerId: Int!
      $source: String!
      $title: String!
      $url: String!
   ) {
      createPrintJob(
         contentType: $contentType
         printerId: $printerId
         source: $source
         title: $title
         url: $url
      ) {
         message
         success
      }
   }
`

export const ROLES = {
   AGGREGATE: gql`
      subscription rolesAggregate {
         rolesAggregate {
            aggregate {
               count
            }
         }
      }
   `,
   ROLE: gql`
      subscription role($id: Int!) {
         role(id: $id) {
            id
            title
            apps {
               id
               app {
                  id
                  title
               }
            }
            users {
               user {
                  id
                  email
                  lastName
                  firstName
                  keycloakId
               }
            }
         }
      }
   `,
   LIST: gql`
      subscription roles {
         roles: rolesAggregate {
            aggregate {
               count(columns: id)
            }
            nodes {
               id
               title
               apps: apps_aggregate {
                  aggregate {
                     count(columns: id)
                  }
               }
            }
         }
      }
   `,
   APPS: gql`
      query apps($roleId: Int_comparison_exp!) {
         apps(where: { _not: { roles: { roleId: $roleId } } }) {
            id
            title
         }
      }
   `,
   INSERT_ROLES_APPS: gql`
      mutation insert_settings_role_app(
         $objects: [settings_role_app_insert_input!]!
      ) {
         insert_settings_role_app(objects: $objects) {
            affected_rows
         }
      }
   `,
   INSERT_ROLES_USERS: gql`
      mutation insert_settings_user_role(
         $objects: [settings_user_role_insert_input!]!
      ) {
         insert_settings_user_role(objects: $objects) {
            affected_rows
         }
      }
   `,
   USERS: gql`
      query users($roleId: Int_comparison_exp!) {
         users: settings_user(where: { _not: { roles: { roleId: $roleId } } }) {
            id
            email
            lastName
            firstName
            keycloakId
         }
      }
   `,
   ROLE_APP: gql`
      query role_app($appId: Int!, $roleId: Int!) {
         role_app: settings_role_app_by_pk(appId: $appId, roleId: $roleId) {
            id
         }
      }
   `,
   PERMISSIONS: gql`
      subscription permissions(
         $appId: Int_comparison_exp!
         $roleId: Int_comparison_exp!
      ) {
         permissions: settings_appPermission(where: { appId: $appId }) {
            id
            route
            title
            roleAppPermissions: role_appPermissions(
               where: { role_app: { appId: $appId, roleId: $roleId } }
            ) {
               value
            }
         }
      }
   `,
   UPDATE_PERMISSION: gql`
      mutation updateRole_AppPermission(
         $value: Boolean!
         $where: settings_role_appPermission_bool_exp!
      ) {
         updateRole_AppPermission: update_settings_role_appPermission(
            where: $where
            _set: { value: $value }
         ) {
            affected_rows
         }
      }
   `,
   INSERT_PERMISSION: gql`
      mutation insertRole_AppPermission(
         $object: settings_role_appPermission_insert_input!
      ) {
         insertRole_AppPermission: insert_settings_role_appPermission_one(
            object: $object
         ) {
            role_appId
         }
      }
   `,
}

export const APPS = {
   LIST: gql`
      subscription apps {
         apps {
            id
            title
            roles {
               id
               role {
                  id
                  title
               }
            }
         }
      }
   `,
}
