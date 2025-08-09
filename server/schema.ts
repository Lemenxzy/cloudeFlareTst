export const typeDefs = `
  type Query {
    getMessages: [Message!]!
  }

  type Mutation {
    sendMessage(input: MessageInput!): Message!
  }

  type Subscription {
    messageAdded: Message!
    aiResponseStream(messageId: ID!): AIResponseChunk!
  }

  type Message {
    id: ID!
    content: String!
    sender: String!
    timestamp: String!
    isAI: Boolean!
  }

  type AIResponseChunk {
    messageId: ID!
    content: String!
    isComplete: Boolean!
  }

  input MessageInput {
    content: String!
    sender: String!
  }
`