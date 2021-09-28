import gql from 'graphql-tag'


export const ACTIVE_EVENTS_WEBHOOKS = gql`
      subscription ACTIVE_EVENTS_WEBHOOKS {
        developer_webhookUrl_events {
          id
          availableWebhookEvent {
            description
            id
            isActive
            label
            samplePayload
            schemaName
            tableName
            type
          }
          webhookUrl {
            id
            isActive
            created_at
            updated_at
            urlEndpoint
          }
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
  subscription MySubscription($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      advanceConfig
      webhookUrl {
        urlEndpoint
      }
      availableWebhookEvent {
        label
      }
    }
  }
  `

  export const GET_EVENT_LOGS = gql`
  subscription MySubscription($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      webhookUrl_EventsLogs {
        created_at
        Response(path: "status")
      }
    }
  }
  `

  export const GET_PROCESSED_EVENTS = gql`
  subscription MySubscription($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      availableWebhookEvent {
        processedWebhookEvents {
          processedWebhookEventsByUrls(where: {webhookUrl_eventsId: {_eq: $webhookUrl_EventId}}) {
            attemptedTime
            statusCode
          }
          created_at
          id
        }
      }
    }
  }
  `

  export const GET_EVENT_WEBHOOK_INFO  = gql`
  subscription GET_EVENT_WEBHOOK_INFO($webhookUrl_EventId: Int) {
    developer_webhookUrl_events(where: {id: {_eq: $webhookUrl_EventId}}) {
      advanceConfig
      webhookUrl {
        urlEndpoint
      }
      availableWebhookEvent {
        label
      }
    }
  }
  `
  export const GET_INVOCATIONS_OF_PROCESSED_EVENTS = gql`
  subscription MySubscription($processedWebhookEventsId: String, $webhookUrl_EventId: Int) {
    developer_processedWebhookEventsByUrl(where: {processedWebhookEventsId: {_eq: $processedWebhookEventsId}, webhookUrl_eventsId: {_eq: $webhookUrl_EventId}}) {
      webhookUrl_EventsLogs {
        PayloadSent
        Response
        created_at
      }
    }
  }
  `