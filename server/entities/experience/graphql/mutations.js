export const SEND_EMAIL = `
mutation SEND_EMAIL($emailInput: EmailInput!, $inviteInput: InviteInput!) {
   sendEmail(emailInput: $emailInput, inviteInput: $inviteInput) {
     message
     success
   }
 }

`
export const CREATE_INVITE = `
mutation CREATE_INVITE($userId: String!, $wsid: String!, $invites: [Invite]!) {
    ohyay_createInvites(userId: $userId, wsid: $wsid, invites: $invites){
      inviteUrl
    }
  }
`
export const UPDATE_EXPERIENCE_BOOKING_PARTICIPANTS = `
mutation UPDATE_EXPERIENCE_BOOKING_PARTICIPANTS($_set: experiences_experienceBookingParticipant_set_input!, $email: String!) {
  updateExperienceBookingParticipants(where: {email: {_eq: $email}}, _set: $_set) {
    returning {
      email
      id
      ohyay_userId
    }
  }
}
`
export const CREATE_WORKSPACE_METADATA = `
mutation CREATE_WORKSPACE_METADATA($object: experiences_workspaceMetaData_insert_input!) {
  createWorkspaceMetaData(object: $object) {
    id
    ohyay_userId
    experienceClassId
  }
}
`
