import { useState } from 'react'

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
  const [streamingMessage, setStreamingMessage] = useState<string>('')

  const handleSendMessage = async (content: string) => {
    setIsLoading(true)
    setStreamingMessage('')
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'User',
      timestamp: new Date().toISOString(),
      isAI: false
    }
    setMessages(prev => [...prev, userMessage])
    
    try {
      // 使用 SSE 流式接收
      const apiUrl = process.env.NODE_ENV === 'production' ? 'https://api.chuzilaoxu.uk' : 'http://127.0.0.1:8787'
      const response = await fetch(`${apiUrl}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }
      
      let aiContent = ''
      const decoder = new TextDecoder()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                // 流式传输完成，添加最终的AI消息
                const aiMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  content: aiContent,
                  sender: 'AI Assistant',
                  timestamp: new Date().toISOString(),
                  isAI: true
                }
                setMessages(prev => [...prev, aiMessage])
                setStreamingMessage('')
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  aiContent += parsed.content
                  setStreamingMessage(aiContent)
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('Error with streaming:', error)
      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发生了错误，请稍后重试。',
        sender: 'AI Assistant',
        timestamp: new Date().toISOString(),
        isAI: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    streamingMessage,
    isLoading,
    sendMessage: handleSendMessage
  }
}