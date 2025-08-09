import * as React from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import { useChat } from '../hooks/useChat'
import './ChatInterface.css'

const ChatInterface: React.FC = () => {
  const { messages, streamingMessage, isLoading, sendMessage } = useChat()

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>AI问答系统</h1>
        <div className="status-indicator">
          <span className="status-dot"></span>
          在线
        </div>
      </div>
      
      <ChatWindow messages={messages} streamingMessage={streamingMessage} />
      
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}

export default ChatInterface