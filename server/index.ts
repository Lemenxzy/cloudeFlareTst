import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { createServer } from 'http'
import express from 'express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import cors from 'cors'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await server.start()

app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server)
)

app.get('/sse/:messageId', (req, res) => {
  const { messageId } = req.params
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true',
  })

  const responses = [
    "正在思考你的问题...",
    "分析中...",
    "生成回复中...",
    "完成！这是我的建议..."
  ]
  
  let index = 0
  const interval = setInterval(() => {
    if (index < responses.length) {
      res.write(`data: ${JSON.stringify({
        content: responses[index],
        isComplete: index === responses.length - 1
      })}\n\n`)
      index++
    } else {
      clearInterval(interval)
      res.end()
    }
  }, 1000)
  
  req.on('close', () => {
    clearInterval(interval)
  })
})

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  console.log(`WebSocket server is now running on ws://localhost:${PORT}/graphql`)
})