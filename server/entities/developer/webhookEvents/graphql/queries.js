export const GET_AVAILABLE_WEBHOOK_EVENT_ID = `
query GET_AVAILABLE_WEBHOOK_EVENT_ID($webhookEventLabel: String!) {
  developer_availableWebhookEvent(where: {label: {_eq: $webhookEventLabel}}) {
    id
  }
}
`

export const GET_URL_ENDPOINT_AND_ADVANCE_CONFIG = `
query GET_URL_ENDPOINT_AND_ADVANCE_CONFIG($processedWebhookEventsId: String = "") {
  developer_processedWebhookEventsByUrl(where: {processedWebhookEventsId: {_eq: $processedWebhookEventsId}}) {
    urlEndPoint
    webhookUrl_event {
      advanceConfig
    }
  }
}
`

export const FETCH_PROCESSED_WEBHOOK_BY_URL = `query FETCH_PROCESSED_WEBHOOK_BY_URL($processedWebhookEventId: String = "") {
  developer_processedWebhookEventsByUrl(where: {processedWebhookEventsId: {_eq: $processedWebhookEventId}}) {
    webhookUrl_event {
      advanceConfig
      headers
    }
    urlEndPoint
    id
    webhookUrl_eventsId
  }
}
`