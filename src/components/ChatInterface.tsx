import * as React from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import { useChat } from '../hooks/useChat'
import './ChatInterface.css'

const ChatInterface: React.FC = () => {
  const { messages, streamingMessage, isLoading, apiStatus, sendMessage, refetchApiStatus } = useChat()

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>Open AI问答系统</h1>
        <div className="status-info">
          <div className="api-status">
            {apiStatus ? (
              <>
                <span className={`status-dot ${apiStatus.canUseStreaming ? 'streaming' : 'fallback'}`}></span>
                <span className="status-text">
                  {apiStatus.canUseStreaming ? '流式传输' : 'GraphQL模式'}
                </span>
                <button 
                  className="refresh-btn" 
                  onClick={() => refetchApiStatus()}
                  title="刷新API状态"
                >
                  🔄
                </button>
              </>
            ) : (
              <>
                <span className="status-dot loading"></span>
                <span className="status-text">检查中...</span>
              </>
            )}
          </div>
          {apiStatus && (
            <div className="status-message" title={apiStatus.message}>
              {apiStatus.canUseStreaming ? '✅' : '⚠️no Key'}
            </div>
          )}
        </div>
      </div>
      
      <ChatWindow messages={messages} streamingMessage={streamingMessage} />
      
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}

export default ChatInterface