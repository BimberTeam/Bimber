export const GroupInputs = `
    input AcceptPendingRequestInput {
        groupId: Int!
        pendingUserId: Int!
    }

    input RejectPendingRequestInput {
        groupId: Int!
        pendingUserId: Int!
    }

`