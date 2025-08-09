import { useState, useEffect } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { 
  GET_MESSAGES, 
  SEND_MESSAGE, 
  MESSAGE_ADDED_SUBSCRIPTION,
  AI_RESPONSE_STREAM_SUBSCRIPTION 
} from '../graphql/queries'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isAI: boolean
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { data, loading } = useQuery(GET_MESSAGES)
  const [sendMessage] = useMutation(SEND_MESSAGE)
  
  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData.data?.messageAdded) {
        const newMessage = subscriptionData.data.messageAdded
        setMessages(prev => {
          if (prev.find(msg => msg.id === newMessage.id)) {
            return prev
          }
          return [...prev, newMessage]
        })
      }
    }
  })

  useEffect(() => {
    if (data?.getMessages) {
      setMessages(data.getMessages)
    }
  }, [data])

  const handleSendMessage = async (content: string) => {
    setIsLoading(true)
    try {
      await sendMessage({
        variables: {
          input: {
            content,
            sender: 'User'
          }
        }
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading: loading || isLoading,
    sendMessage: handleSendMessage
  }
}