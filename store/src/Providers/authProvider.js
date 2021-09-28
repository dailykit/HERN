import React from "react";
import { Loader } from "@dailykit/ui";
import jwtDecode from "jwt-decode";
import { useQuery } from "@apollo/client";
import { InlineLoader } from "../components";
import { isClient, isEmpty } from "../utils";
import { CUSTOMER_DETAILS, ORGANIZATION } from "../graphql";

const inititalState = {
  isAddressModalOpen: false,
  isPaymentModalOpen: false,
  isProductModalOpen: false,
  isAuthenticated: false,
  productModalType: "booking",
  user: { name: "", keycloakId: "" },
  organization: {
    organizationName: "",
    stripeAccountId: "",
    stripeAccountType: "",
  },
};
const AuthContext = React.createContext();

const reducers = (state, { type, payload }) => {
  switch (type) {
    case "SET_USER":
      return {
        ...state,
        isAuthenticated: true,
        user: { ...state.user, ...payload },
      };
    case "CLEAR_USER":
      return {
        ...state,
        isAuthenticated: false,
        user: { keycloakId: "" },
      };
    case "Toggle_ADDRESS_MODEL":
      return {
        ...state,
        isAddressModalOpen: payload,
      };
    case "Toggle_PAYMENT_MODEL":
      return {
        ...state,
        isPaymentModalOpen: payload,
      };
    case "Toggle_PRODUCT_MODEL":
      return {
        ...state,
        isProductModalOpen: payload,
      };
    case "SET_ORGANIZATION":
      return {
        ...state,
        organization: {
          ...state.organization,
          ...payload,
        },
      };
    case "SET_PRODUCT_MODAL_TYPE": {
      return {
        ...state,
        productModalType: payload,
      };
    }
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [keycloakId, setKeycloakId] = React.useState("");
  const [state, dispatch] = React.useReducer(reducers, inititalState);
  const {
    loading: isOrganizationLoading,
    data: { organizations = [] } = {},
  } = useQuery(ORGANIZATION, {
    onError: (error) => {
      console.log(error);
    },
  });

  const { loading: isCustomerLoading, data: { customer = {} } = {} } = useQuery(
    CUSTOMER_DETAILS,
    {
      skip: !keycloakId || isOrganizationLoading,
      fetchPolicy: "network-only",
      variables: {
        keycloakId,
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const toggleAddressModal = (data) => {
    dispatch({
      type: "Toggle_ADDRESS_MODEL",
      payload: data,
    });
  };
  const togglePaymentModal = (data) => {
    dispatch({
      type: "Toggle_PAYMENT_MODEL",
      payload: data,
    });
  };
  const toggleProductModal = (data) => {
    dispatch({
      type: "Toggle_PRODUCT_MODEL",
      payload: data,
    });
  };

  const setProductModalType = (type) => {
    dispatch({
      type: "SET_PRODUCT_MODAL_TYPE",
      payload: type,
    });
  };

  React.useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem("token");
      if (token) {
        const user = jwtDecode(token);
        setKeycloakId(user?.sub);
        dispatch({ type: "SET_USER", payload: { keycloakId: user?.sub } });
      } else {
        dispatch({ type: "CLEAR_USER" });
      }
    }
  }, []);

  React.useEffect(() => {
    if (!isOrganizationLoading) {
      if (organizations.length) {
        const [organization] = organizations;
        dispatch({ type: "SET_ORGANIZATION", payload: organization });
      }
    }
  }, [isOrganizationLoading, organizations]);

  React.useEffect(() => {
    if (!isCustomerLoading && !isOrganizationLoading) {
      if (customer?.id) {
        const user = {
          ...customer,
          ...customer?.platform_customer,
        };
        if (organizations.length) {
          const [organization] = organizations;
          console.log("running outside");
          if (
            organization?.stripeAccountType === "standard" &&
            !isEmpty(user?.CustomerByClients)
          ) {
            console.log("running", user?.CustomerByClients);
            const [customerbyClient] = user?.CustomerByClients;
            user.stripeCustomerId =
              customerbyClient?.organizationStripeCustomerId;
          }
        }
        dispatch({ type: "SET_USER", payload: user });
      }
    }
  }, [isCustomerLoading, isOrganizationLoading, customer, organizations]);

  if (isCustomerLoading || isOrganizationLoading) {
    return <InlineLoader />;
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        toggleAddressModal,
        togglePaymentModal,
        toggleProductModal,
        setProductModalType,
        loading: Boolean(isCustomerLoading || isOrganizationLoading),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => React.useContext(AuthContext);
