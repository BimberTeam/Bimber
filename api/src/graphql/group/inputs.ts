export const GroupInputs = `
    input AcceptPendingRequestInput {
        groupId: ID!
        userId: ID!
    }

    input RejectPendingRequestInput {
        groupId: ID!
        userId: ID!
    }

    input PendingMembersListInput {
        groupId: ID!
    }

    input AddFriendToGroupInput {
        groupId: ID!
        friendId: ID!
    }

    input AcceptGroupInvitationInput {
        groupId: ID!
    }

    input RejectGroupInvitationInput {
        groupId: ID!
    }

    input SwipeToDislikeInput {
        groupId: ID!
    }

    input SwipeToLikeInput {
        groupId: ID!
    }

`