export const CREATE_SCHEDULED_EVENT = `
    mutation CREATE_SCHEDULED_EVENT($scheduledEventInput: ScheduledEventInput!) {
        hasura_createScheduledEvent(scheduledEventInput: $scheduledEventInput) {
        message
        success
        }
    }
`
