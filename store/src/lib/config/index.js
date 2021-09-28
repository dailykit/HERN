import React, {
  useState,
  useReducer,
  useContext,
  useEffect,
  createContext,
} from "react";
import { useSubscription } from "@apollo/client";
import { GET_BRAND_INFO } from "../../graphql";
import { InlineLoader } from "../../components";

const ConfigContext = createContext();

const initialState = {
  brand: {
    id: null,
    domain: "",
    isDefault: "",
  },
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "SET_BRAND_INFO":
      return { ...state, brand: payload };

    default:
      return state;
  }
};

export const ConfigProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    loading: isBrandInfoQueryLoading,
    error: hasBrandInfoQueryError,
    data: { brands = [] } = {},
  } = useSubscription(GET_BRAND_INFO, {
    variables: {
      domain: process.browser && window.location.hostname,
    },
  });

  useEffect(() => {
    if (!isBrandInfoQueryLoading) {
      if (brands.length) {
        dispatch({
          type: "SET_BRAND_INFO",
          payload: {
            id: brands[0]?.id,
            domain: brands[0]?.domain,
            isDefault: brands[0]?.isDefault,
          },
        });
      }

      setIsLoading(false);
    }
  }, [isBrandInfoQueryLoading, brands]);

  if (isLoading) {
    return <InlineLoader />;
  }

  if (hasBrandInfoQueryError) {
    console.log(hasBrandInfoQueryError);
  }
  return (
    <ConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const { state } = useContext(ConfigContext);
  return { brand: state.brand };
};
