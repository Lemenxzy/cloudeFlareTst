import { useState, useEffect, useCallback } from 'react'

interface SSEData {
  content: string
  isComplete: boolean
}

export const useSSE = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [data, setData] = useState<SSEData | null>(null)

  const connect = useCallback((messageId: string) => {
    setConnectionStatus('connecting')
    setData(null)
    
    const eventSource = new EventSource(`http://localhost:4000/sse/${messageId}`)
    
    eventSource.onopen = () => {
      setConnectionStatus('connected')
    }
    
    eventSource.onmessage = (event) => {
      try {
        const parsedData: SSEData = JSON.parse(event.data)
        setData(parsedData)
        
        if (parsedData.isComplete) {
          eventSource.close()
          setConnectionStatus('idle')
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }
    
    eventSource.onerror = () => {
      setConnectionStatus('error')
      eventSource.close()
    }
    
    return eventSource
  }, [])

  return {
    connectionStatus,
    data,
    connect
  }
}