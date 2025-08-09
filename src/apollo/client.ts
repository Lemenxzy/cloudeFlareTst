import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: 'https://api.chuzilaoxu.uk/graphql',
})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})