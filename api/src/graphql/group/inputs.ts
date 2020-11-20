export const GroupInputs = `
    input AcceptPendingRequestInput {
        groupId: ID!
        userId: ID!
    }

    input RejectPendingRequestInput {
        groupId: ID!
        userId: ID!
    }

    input GroupCandidatesInput {
        groupId: ID!
    }

    input GroupCandidatesResultInput {
        groupId: ID!
    }

    input AddFriendToGroupInput {
        groupId: ID!
        userId: ID!
    }

    input AcceptGroupInvitationInput {
        groupId: ID!
    }

    input RejectGroupInvitationInput {
        groupId: ID!
    }

    input SwipeInput {
        groupId: ID!
    }

    input SuggestGroupsInput {
        groupNumber: Int!
    }

`