import { gql } from '@apollo/client'

export const GET_API_STATUS = gql`
  query GetApiStatus {
    apiStatus {
      hasApiKey
      isValid
      canUseStreaming
      message
    }
  }
`

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
      userMessage {
        id
        content
        sender
        timestamp
        isAI
      }
      aiMessage {
        id
        content
        sender
        timestamp
        isAI
      }
    }
  }
`