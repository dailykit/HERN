import { graphqlClient } from "./graphqlClient";
import { GET_PAGE_MODULES } from "../graphql";
export const getWebPageModule = async ({ domain, route }) => {
  try {
    const variables = {
      domain,
      route,
    };
    const {
      data: { website_websitePage: websitePage = [] } = {},
    } = await graphqlClient.query({ query: GET_PAGE_MODULES, variables });
    return websitePage;
  } catch (error) {
    console.log(error);
  }
};
