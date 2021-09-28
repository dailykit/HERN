import { ApolloClient, InMemoryCache } from "@apollo/client";

export const graphqlClient = new ApolloClient({
  uri:
    (process.browser && window?._env_?.NEXT_PUBLIC_DATAHUB_URL) ||
    process.env.NEXT_PUBLIC_DATAHUB_URL,
  cache: new InMemoryCache(),
  headers: {
    "x-hasura-admin-secret": `${
      (process.browser && window?._env_?.NEXT_PUBLIC_DATAHUB_ADMIN_SECRET) ||
      process.env.NEXT_PUBLIC_DATAHUB_ADMIN_SECRET
    }`,
  },
});
