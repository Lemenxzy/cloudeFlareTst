import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import './ChatWindow.css'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isAI: boolean
}

interface ChatWindowProps {
  messages: Message[]
  streamingMessage?: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, streamingMessage }) => {
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>欢迎使用Open AI问答系统</h2>
            <p>请在下方输入您的问题，我会尽力为您解答。</p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {streamingMessage && (
          <MessageBubble 
            key="streaming"
            message={{
              id: 'streaming',
              content: streamingMessage,
              sender: 'AI Assistant',
              timestamp: new Date().toISOString(),
              isAI: true
            }}
            isStreaming={true}
          />
        )}
        
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}

export default ChatWindow