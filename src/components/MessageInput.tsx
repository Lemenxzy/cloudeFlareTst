import { useState, useRef } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading: externalLoading }) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const loading = isLoading || externalLoading
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const messageToSend = message.trim()
    setMessage('')
    setIsLoading(true)
    
    try {
      await onSendMessage(messageToSend)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的问题..."
          rows={1}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || loading}
          className="send-button"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </form>
  )
}

export default MessageInput