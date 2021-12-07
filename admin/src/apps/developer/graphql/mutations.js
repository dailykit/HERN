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