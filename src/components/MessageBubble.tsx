import React from 'react'
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
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`message-bubble ${message.isAI ? 'ai-message' : 'user-message'}`}>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-meta">
          <span className="message-sender">{message.sender}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble