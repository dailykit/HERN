export const EXPERIENCE_CLASS_INFO = `
query EXPERIENCE_CLASS_INFO($where: experiences_experienceClass_bool_exp!) {
   experiences_experienceClass(where: $where) {
     id
     isActive
     isBooked
     ohyay_wsid
     startTimeStamp
     duration
     experience {
       assets
       description
       metaData
       title
     }
   }
 }
`
export const CUSTOMER = `
query CUSTOMER($experienceBookingId: Int!) {
  customers(where: {experienceBookings: {id: {_eq: $experienceBookingId}}}) {
    email
    id
    keycloakId
  }
}
`

export const WORKSPACE_RECORDINGS = `
query WORKSPACE_RECORDINGS($userId: String!, $wsid: String!) {
  ohyay_workspaceRecordings(userId: $userId, wsid: $wsid) {
    downloadUrl
    duration
    recordingId
    roomId
    timestamp
  }
}
`
export const WORKSPACE_RECORDING_METADATA = `
query WORKSPACE_RECORDING_METADATA($recordingId: String!, $userId: String!, $wsid: String!) {
  ohyay_workspaceRecordingMetaData(recordingId: $recordingId, userId: $userId, wsid: $wsid) {
    emojis {
      count
      emoji
      timestamp
      userId
    }
    speakers {
      duration
      speakerId
      talkStartTime
    }
  }
}
`
export const WORKSPACE_CHATS = `
query WORKSPACE_CHATS($userId: String!, $wsid: String!) {
  ohyay_workspaceChats(userId: $userId, wsid: $wsid) {
    chats {
      channel
      messages {
        from
        time
        to
      }
    }
  }
}
`
export const WORKSPACE_USERS = `
query WORKSPACE_USERS($userId: String!, $wsid: String!) {
  ohyay_workspaceUsers(userId: $userId, wsid: $wsid) {
    email
    tags
    userId:uid
  }
}

`
