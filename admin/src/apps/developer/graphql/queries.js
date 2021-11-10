import gql from 'graphql-tag'


export const ACTIVE_EVENTS_WEBHOOKS = gql`
subscription ACTIVE_EVENTS_WEBHOOKS {
  developer_webhookUrl_events {
    id
    availableWebhookEvent {
      description
      label
    }
    webhookUrl {
      created_at
      urlEndpoint
    }
    advanceConfig
    headers
  }
}

      
    `
  

export const  AVAILABLE_EVENTS = gql`
    subscription AVAILABLE_EVENTS {
      developer_availableWebhookEvent {
        id
        description
        isActive
        label
        samplePayload
        schemaName
        tableName
        type
      }
    }
    
    `

  export const GET_WEBHOOK_URL_EVENTS_COUNT = gql`
    subscription GET_WEBHOOK_URL_EVENTS_COUNT {
      developer_webhookUrl_events_aggregate {
        aggregate {
          count
        }
      }
    }
  `

  export const GET_EVENT_URL_ADVANCE_CONFIGS = gql`
  subscription GET_EVENT_URL_ADVANCE_CONFIGS($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      advanceConfig
      headers
    }
  }
  `

  export const GET_EVENT_LOGS = gql`
  subscription GET_EVENT_LOGS($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      webhookUrl_EventsLogs {
        created_at
        Response(path: "status")
      }
    }
  }
  `

  export const GET_PROCESSED_EVENTS = gql`
  subscription GET_PROCESSED_EVENTS($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      availableWebhookEvent {
        processedWebhookEvents(order_by: {created_at: desc}) {
          processedWebhookEventsByUrls(where: {webhookUrl_eventsId: {_eq: $webhookUrl_EventId}}) {
            attemptedTime
            statusCode
          }
          created_at
          id
          payload
        }
      }
    }
  }
  `

  export const GET_INVOCATIONS_OF_PROCESSED_EVENTS = gql`
  subscription GET_INVOCATIONS_OF_PROCESSED_EVENTS($processedWebhookEventsId: String, $webhookUrl_EventId: Int) {
    developer_processedWebhookEventsByUrl(where: {processedWebhookEventsId: {_eq: $processedWebhookEventsId}, webhookUrl_eventsId: {_eq: $webhookUrl_EventId}}) {
      webhookUrl_EventsLogs(order_by: {created_at: desc}) {
        PayloadSent
        Response
        created_at
      }
    }
  }
  `

  export const GET_ALL_API_KEYS = gql`
  subscription GET_ALL_API_KEYS {
    developer_apiKey(order_by: {created_at: desc}) {
      apiKey
      canAddProducts
      canUpdateProducts
      isDeactivated
      created_at
      updated_at
      label
      createdBy
    }
  }
  
  `