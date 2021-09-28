import { graphqlClient } from "./graphqlClient";
import { NAVBAR_MENU } from "../graphql";
export const getNavigationMenuItems = async (domain) => {
  const variables = {
    domain,
  };
  const {
    data: { website_navigationMenu: navigationMenu = [] } = {},
  } = await graphqlClient.query({ query: NAVBAR_MENU, variables });
  return navigationMenu[0]?.navigationMenuItems;
};
