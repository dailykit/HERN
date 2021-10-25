export const INSERT_PROCESSED_EVENT = `
mutation INSERT_PROCESSED_EVENT($availableWebhookEventId: Int = "$", $payload: jsonb = "") {
    insert_developer_processedWebhookEvents_one(object: {availableWebhookEventId: $availableWebhookEventId, payload: $payload}) {
      id
    }
  }
`

export const UPDATE_PROCESSED_WEBHOOK_EVENT_BY_URL = `
mutation UPDATE_PROCESSED_WEBHOOK_EVENT_BY_URL($_eq: String = "", $response: jsonb = "", $status: String = "", $statusCode: Int = 10) {
  update_developer_processedWebhookEventsByUrl(where: {processedWebhookEventsId: {_eq: $processedWebhookEventsId}}, _set: {response: $response, status: $status, statusCode: $statusCode})
}
`

export const INSERT_INVOCATION_LOGS = `
mutation INSERT_INVOCATION_LOGS($PayloadSent: jsonb = "", $Response: jsonb = "", $processedWebhookEventsByUrlId: String = "", $webhookUrl_EventsId: Int = 0) {
  insert_developer_webhookUrl_EventsLog(objects: {PayloadSent: $PayloadSent, Response: $Response, processedWebhookEventsByUrlId: $processedWebhookEventsByUrlId, webhookUrl_EventsId: $webhookUrl_EventsId}) {
    returning {
      id
    }
  }
}


`