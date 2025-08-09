import OpenAI from 'openai'

export interface Env {
  OPENAI_API_KEY: string
}

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isAI: boolean
}

let messages: Message[] = []

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// 流式调用 OpenAI API
async function callOpenAIStream(userMessage: string, env: Env): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  
  // 开发模式：检查API key格式并返回模拟流式回复
  if (!env.OPENAI_API_KEY || !env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('Invalid or missing API key, using fallback streaming response')
    
    return new ReadableStream({
      async start(controller) {
        const mockResponse = `## 你好！👋\n\n我收到了你的消息："${userMessage}"\n\n### 当前状态\n- ✅ Workers 服务正常运行\n- ✅ 流式传输功能正常\n- ⚠️ 需要配置有效的 OpenAI API Key\n\n### 配置说明\n请在 \`.dev.vars\` 文件中设置有效的 OpenAI API Key：\n\`\`\`\nOPENAI_API_KEY=sk-your-actual-openai-api-key-here\n\`\`\`\n\n*这是开发模式的流式回复，配置API Key后将获得真实的AI智能回答。*`
        
        // 模拟分段发送
        const chunks = mockResponse.split(' ')
        for (const chunk of chunks) {
          await new Promise(resolve => setTimeout(resolve, 50))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk + ' ' })}\n\n`))
        }
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })
  }

  try {
    console.log('Initializing OpenAI SDK for streaming...', {
      apiKeyLength: env.OPENAI_API_KEY.length,
      userMessage
    })

    // 为Cloudflare Workers环境配置OpenAI客户端
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })

    return new ReadableStream({
      async start(controller) {
        try {
          console.log('Starting OpenAI streaming...')
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: '你是一个有用的AI助手，请用中文回答问题。你的回答应该详细、准确，并且使用Markdown格式来组织内容，包括标题、列表、代码块等格式化元素。当回答技术问题时，请提供具体的代码示例和步骤说明。'
              },
              {
                role: 'user',
                content: userMessage
              }
            ],
            max_tokens: 800,
            temperature: 0.7,
            stream: true
          })

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error: any) {
          console.error('Error in OpenAI streaming:', error)
          let errorMessage = '抱歉，我无法生成回复。'
          
          if (error?.status === 401) {
            errorMessage = '❌ API Key 无效，请检查您的 OpenAI API Key 是否正确配置。'
          } else if (error?.status === 429) {
            errorMessage = '⚠️ API 调用频率超限，请稍后再试。'
          } else if (error?.status === 500) {
            errorMessage = '🔧 OpenAI 服务暂时不可用，请稍后再试。'
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: errorMessage })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
    })
  } catch (error: any) {
    console.error('OpenAI SDK initialization error:', error)
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: `抱歉，调用AI服务时遇到问题：${error?.message || 'Unknown error'}` })}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })
  }
}


const resolvers = {
  Query: {
    getMessages: () => messages,
    apiStatus: (_: any, __: any, { env }: { env: Env }) => {
      const hasApiKey = !!env.OPENAI_API_KEY
      const isValid = hasApiKey && env.OPENAI_API_KEY.startsWith('sk-')
      
      return {
        hasApiKey,
        isValid,
        canUseStreaming: isValid,
        message: isValid 
          ? '✅ API Key 配置正确，可以使用流式传输'
          : hasApiKey 
            ? '⚠️ API Key 格式无效，请检查配置'
            : '❌ 未找到 API Key，请配置 OPENAI_API_KEY'
      }
    }
  },
  
  Mutation: {
    sendMessage: async (_: any, { input }: { input: { content: string; sender: string } }, { env }: { env: Env }) => {
      // 创建用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input.content,
        sender: input.sender,
        timestamp: new Date().toISOString(),
        isAI: false
      }
      messages.push(userMessage)

      // 生成静态回复（因为无效API key时才会使用GraphQL）
      const aiContent = `## 你好！👋

我收到了你的消息："${input.content}"

### 当前状态
- ✅ Workers 服务正常运行
- ✅ GraphQL 查询处理正常
- ⚠️ 需要配置有效的 OpenAI API Key

### 配置说明
请在 \`.dev.vars\` 文件中设置有效的 OpenAI API Key：
\`\`\`
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
\`\`\`

*这是开发模式的回复，配置API Key后将获得真实的AI智能回答。*`
      
      // 创建AI消息
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: 'AI Assistant',
        timestamp: new Date().toISOString(),
        isAI: true
      }
      messages.push(aiMessage)

      return {
        userMessage,
        aiMessage
      }
    },
  },
}

async function handleGraphQL(request: Request, env: Env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response('GraphQL only supports POST requests', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const body = await request.json() as { query: string; variables?: any }
    
    // 处理 apiStatus 查询
    if (body.query.includes('apiStatus')) {
      const result = resolvers.Query.apiStatus(null, null, { env })
      return new Response(JSON.stringify({
        data: { apiStatus: result }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 处理 getMessages 查询
    if (body.query.includes('getMessages')) {
      const result = resolvers.Query.getMessages()
      return new Response(JSON.stringify({
        data: { getMessages: result }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 处理 sendMessage 变更
    if (body.query.includes('sendMessage')) {
      // 处理带变量的查询
      if (body.variables?.input) {
        const result = await resolvers.Mutation.sendMessage(null, { input: body.variables.input }, { env })
        return new Response(JSON.stringify({
          data: { sendMessage: result }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      // 处理内联查询
      const contentMatch = body.query.match(/content:\s*"([^"]*)"/)
      const senderMatch = body.query.match(/sender:\s*"([^"]*)"/)
      if (contentMatch && senderMatch) {
        const input = {
          content: contentMatch[1],
          sender: senderMatch[1]
        }
        const result = await resolvers.Mutation.sendMessage(null, { input }, { env })
        return new Response(JSON.stringify({
          data: { sendMessage: result }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ 
      error: 'Query not supported',
      query: body.query 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('GraphQL error:', error)
    return new Response(JSON.stringify({
      error: `GraphQL 处理错误：${error?.message || 'Unknown error'}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url)

    // 健康检查端点
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        hasApiKey: !!env.OPENAI_API_KEY,
        apiKeyFormat: env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid' : 'invalid'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }


    // GraphQL 端点
    if (url.pathname === '/graphql') {
      return handleGraphQL(request, env)
    }

    // SSE 流式传输端点
    if (url.pathname === '/stream') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json()
          const message = body.message
          
          if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          console.log('Processing SSE streaming request for message:', message)
          const stream = await callOpenAIStream(message, env)
          
          return new Response(stream, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            }
          })
        } catch (error: any) {
          console.error('Error in chat endpoint:', error)
          return new Response(JSON.stringify({
            error: `请求处理错误：${error?.message || 'Unknown error'}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    return new Response('AI Chat API', {
      headers: corsHeaders
    })
  },
}