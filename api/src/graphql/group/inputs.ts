export const GroupInputs = `
    input AcceptPendingRequestInput {
        groupId: String!
        userId: String!
    }

    input RejectPendingRequestInput {
        groupId: String!
        userId: String!
    }

    input PendingMembersListInput {
        groupId: String!
    }

    input AddFriendToGroupInput {
        groupId: String!
        friendId: String!
    }

`