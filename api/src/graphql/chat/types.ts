export const ChatTypes = `
    type ChatMessage {
        userId: ID!
        name: String!
        groupId: ID!
        date: BimberDate! 
        message: String!
    }

    type ChatThumbnail {
        groupId: ID!
        name: String!
        lastMessage: ChatMessage
    }
`;
