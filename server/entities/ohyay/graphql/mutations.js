export const UPDATE_EXPERIENCE_CLASS = `
   mutation UPDATE_EXPERIENCE_CLASS($id: Int!, $ohyay_wsid: String!) {
      update_experiences_experienceClass_by_pk(
         pk_columns: { id: $id }
         _set: { ohyay_wsid: $ohyay_wsid }
      ) {
         ohyay_wsid
         id
      }
   }
`

export const CLONE_WORKSPACE = `
   mutation CLONE_WORKSPACE($cloneWorkspaceInp: CloneWorkspaceInput!) {
      ohyay_cloneWorkspace(cloneWorkspace: $cloneWorkspaceInp) {
         wsid
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
