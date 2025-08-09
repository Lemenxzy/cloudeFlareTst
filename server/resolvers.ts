import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isAI: boolean
}

interface AIResponseChunk {
  messageId: string
  content: string
  isComplete: boolean
}

const messages: Message[] = []

const simulateAIResponse = async (messageId: string, userMessage: string) => {
  const responses = [
    "我理解你的问题...",
    "让我来帮你分析一下...",
    "根据你的描述，我建议...",
    "总结来说，最好的解决方案是..."
  ]
  
  let fullResponse = ""
  
  for (let i = 0; i < responses.length; i++) {
    const chunk = responses[i]
    fullResponse += chunk
    
    const responseChunk: AIResponseChunk = {
      messageId,
      content: chunk,
      isComplete: i === responses.length - 1
    }
    
    pubsub.publish('AI_RESPONSE_STREAM', { aiResponseStream: responseChunk })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const aiMessage: Message = {
    id: Date.now().toString(),
    content: fullResponse,
    sender: 'AI Assistant',
    timestamp: new Date().toISOString(),
    isAI: true
  }
  
  messages.push(aiMessage)
  pubsub.publish('MESSAGE_ADDED', { messageAdded: aiMessage })
}

export const resolvers = {
  Query: {
    getMessages: () => messages,
  },
  
  Mutation: {
    sendMessage: async (_: any, { input }: { input: { content: string; sender: string } }) => {
      const message: Message = {
        id: Date.now().toString(),
        content: input.content,
        sender: input.sender,
        timestamp: new Date().toISOString(),
        isAI: false
      }
      
      messages.push(message)
      pubsub.publish('MESSAGE_ADDED', { messageAdded: message })
      
      setTimeout(() => {
        simulateAIResponse(message.id, message.content)
      }, 500)
      
      return message
    },
  },
  
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(['MESSAGE_ADDED']),
    },
    aiResponseStream: {
      subscribe: () => pubsub.asyncIterator(['AI_RESPONSE_STREAM']),
    },
  },
}