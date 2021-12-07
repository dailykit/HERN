import gql from 'graphql-tag'

export const INSERT_WEBHOOK_EVENTS = gql`
mutation INSERT_WEBHOOK_EVENTS($urlEndpoint: String = "", $availableWebhookEventId: Int, $advanceConfig: jsonb = "") {
  insert_developer_webhookUrl_events_one(object: {availableWebhookEventId: $availableWebhookEventId, webhookUrl: {data: {urlEndpoint: $urlEndpoint}, on_conflict: {constraint: webhookUrl_urlEndpoint_key, update_columns: updated_at}}, advanceConfig: $advanceConfig}) {
    webhookUrlId
    availableWebhookEventId
  }
}
  `

export const DELETE_WEBHOOK_EVENT = gql`
mutation DELETE_WEBHOOK_EVENT($eventId: Int) {
  delete_developer_webhookUrl_events(where: {id: {_eq: $eventId}}) {
    affected_rows
  }
}

`

export const UPDATE_RETRY_CONFIGURATION = gql`
  mutation UPDATE_RETRY_CONFIGURATION($id: Int, $advanceConfig: jsonb = "") {
    update_developer_webhookUrl_events(where: {id: {_eq: $id}}, _set: {advanceConfig: $advanceConfig}) {
      affected_rows
    }
  }

`
export const UPDATE_REQUEST_HEADERS = gql`
mutation UPDATE_REQUEST_HEADERS($id: Int, $headers: jsonb = "") {
  update_developer_webhookUrl_events(where: {id: {_eq: $id}}, _set: {headers: $headers}) {
    affected_rows
  }
}
`

export const ADD_API_KEY = gql`
mutation ADD_API_KEY($canAddProducts: Boolean, $canUpdateProducts: Boolean, $isDeactivated: Boolean, $label: String) {
  insert_developer_apiKey(objects: {canAddProducts: $canAddProducts, canUpdateProducts: $canUpdateProducts, isDeactivated: $isDeactivated, label: $label}) {
    affected_rows
  }
}
`

export const UPDATE_API_KEY = gql`
mutation UPDATE_API_KEY($canAddProducts: Boolean, $canUpdateProducts: Boolean, $isDeactivated: Boolean, $apiKey: String) {
  update_developer_apiKey(where: {apiKey: {_eq: $apiKey}}, _set: {canAddProducts: $canAddProducts, canUpdateProducts: $canUpdateProducts, isDeactivated: $isDeactivated}) {
    affected_rows
  }
}
`

export const DELETE_API_KEY = gql`
mutation DELETE_API_KEY($apiKey: String) {
  delete_developer_apiKey(where: {apiKey: {_eq: $apiKey}}) {
    affected_rows
  }
}
`
export const UPDATE_API_KEY_PERMISSIONS = gql`
mutation UPDATE_API_KEY_PERMISSIONS($apiKey: String, $canAddProducts: Boolean, $canUpdateProducts: Boolean) {
  update_developer_apiKey(where: {apiKey: {_eq: $apiKey}}, _set: {canAddProducts: $canAddProducts, canUpdateProducts: $canUpdateProducts}) {
    affected_rows
  }
}
`

export const UPDATE_API_KEY_ACTIVATION_STATUS = gql`
mutation UPDATE_API_KEY_ACTIVATION_STATUS($isDeactivated: Boolean, $apiKey: String) {
  update_developer_apiKey(where: {apiKey: {_eq: $apiKey}}, _set: {isDeactivated: $isDeactivated}) {
    affected_rows
  }
}
`