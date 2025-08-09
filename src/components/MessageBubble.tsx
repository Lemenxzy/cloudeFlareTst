import * as React from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import './MessageBubble.css'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isAI: boolean
}

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`message-bubble ${message.isAI ? 'ai-message' : 'user-message'} ${isStreaming ? 'streaming' : ''}`}>
      <div className="message-content">
        <div className="message-text">
          {message.isAI ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            message.content
          )}
          {isStreaming && (
            <span className="streaming-cursor">▊</span>
          )}
        </div>
        <div className="message-meta">
          <span className="message-sender">{message.sender}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {isStreaming && <span className="streaming-indicator">正在输入...</span>}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble