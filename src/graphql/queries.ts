import { gql } from '@apollo/client'

export const GET_MESSAGES = gql`
  query GetMessages {
    getMessages {
      id
      content
      sender
      timestamp
      isAI
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: MessageInput!) {
    sendMessage(input: $input) {
      id
      content
      sender
      timestamp
      isAI
    }
  }
`

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded {
    messageAdded {
      id
      content
      sender
      timestamp
      isAI
    }
  }
`

export const AI_RESPONSE_STREAM_SUBSCRIPTION = gql`
  subscription AIResponseStream($messageId: ID!) {
    aiResponseStream(messageId: $messageId) {
      messageId
      content
      isComplete
    }
  }
`