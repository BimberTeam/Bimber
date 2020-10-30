export const ChatInputs = `
    input SendChatMessageInput {
        groupId: ID!,
        message: String!
    }
    
    input ChatMessagesInput {
        groupId: ID!
    }
    
    input LoadChatMessagesInput {
        groupId: ID!
        limit: Int
        lastDate: BimberDate
    }
`;
