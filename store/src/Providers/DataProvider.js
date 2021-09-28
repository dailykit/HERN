import React from "react";
import {
  split,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
// import { SubscriptionClient } from "subscriptions-transport-ws";
import { isClient } from "../utils";

export const DataProvider = ({ children }) => {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        "x-hasura-admin-secret":
          isClient &&
          `${
            (process.browser &&
              window?._env_?.NEXT_PUBLIC_DATAHUB_ADMIN_SECRET) ||
            process.env.NEXT_PUBLIC_DATAHUB_ADMIN_SECRET
          }`,
      },
    };
  });

  const wsLink = process.browser
    ? new WebSocketLink({
        uri:
          isClient &&
          ((process.browser &&
            window?._env_?.NEXT_PUBLIC_DATAHUB_SUBSCRIPTIONS_URL) ||
            process.env.NEXT_PUBLIC_DATAHUB_SUBSCRIPTIONS_URL),
        options: {
          reconnect: true,
          connectionParams: {
            headers: {
              "x-hasura-admin-secret": `${
                (process.browser &&
                  window?._env_?.NEXT_PUBLIC_DATAHUB_ADMIN_SECRET) ||
                process.env.NEXT_PUBLIC_DATAHUB_ADMIN_SECRET
              }`,
            },
          },
        },
      })
    : null;

  const httpLink = new HttpLink({
    uri:
      isClient &&
      ((process.browser && window?._env_?.NEXT_PUBLIC_DATAHUB_URL) ||
        process.env.NEXT_PUBLIC_DATAHUB_URL),
  });

  const link = process.browser
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        authLink.concat(httpLink)
      )
    : httpLink;

  const client = new ApolloClient({
    link,
    fetch,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
