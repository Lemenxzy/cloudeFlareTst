import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://api.chuzilaoxu.uk/graphql' 
    : 'http://127.0.0.1:8787/graphql',
})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})