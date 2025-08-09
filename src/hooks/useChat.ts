import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_MESSAGES, SEND_MESSAGE } from '../graphql/queries'

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
  
  const { data, loading, refetch } = useQuery(GET_MESSAGES)
  const [sendMessage] = useMutation(SEND_MESSAGE)

  useEffect(() => {
    if (data?.getMessages) {
      setMessages(data.getMessages)
    }
  }, [data])

  const handleSendMessage = async (content: string) => {
    setIsLoading(true)
    try {
      const result = await sendMessage({
        variables: {
          input: {
            content,
            sender: 'User'
          }
        }
      })
      
      if (result.data?.sendMessage) {
        const { userMessage, aiMessage } = result.data.sendMessage
        setMessages(prev => [...prev, userMessage, aiMessage])
      }
      
      await refetch()
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