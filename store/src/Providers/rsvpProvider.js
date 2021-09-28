import React from "react";

const RSVPContext = React.createContext();

const initialState = {
  experienceBooking: {},
  experienceBookingParticipant: {},
  decodedToken: {},
  isPollClosed: false,
  isPublicUrl: false,
  isDisabled: true,
  participantId: null,
  rsvpStepIndex: 0,
  responseDetails: {
    email: {
      value: "",
      error: "",
    },
    phone: {
      value: "",
      error: "",
    },
    address: null,
  },
  selectedProduct: {},
  selectedProductOption: {},
  productQuantity: 0,
  cartItems: [],
};

const reducers = (state, { type, payload }) => {
  switch (type) {
    case "UPDATE_RSVP_INFO": {
      const newState = {
        ...state,
        ...payload,
      };
      return newState;
    }
    case "SET_RESPONSE_DETAILS": {
      const newState = {
        ...state,
        responseDetails: payload,
      };
      return newState;
    }

    case "INCREMENT_RSVP_STEP": {
      const newState = {
        ...state,
        rsvpStepIndex: payload + 1,
      };
      return newState;
    }

    case "DECREMENT_RSVP_STEP": {
      const newState = {
        ...state,
        rsvpStepIndex: payload - 1,
      };
      return newState;
    }
    case "ADD_SELECTED_PRODUCTS": {
      const newState = {
        ...state,
        selectedProduct: payload,
        selectedProductOption: {},
        productQuantity: 0,
        cartItems: [],
      };
      return newState;
    }
    case "ADD_SELECTED_PRODUCT_OPTION": {
      const newState = {
        ...state,
        selectedProductOption: payload,
        cartItems: [{ ...payload?.cartItem }],
      };
      return newState;
    }
    case "INC_PRODUCT_QTY": {
      const newState = {
        ...state,
        productQuantity: state.productQuantity + 1,
        cartItems: [...state.cartItems, state.selectedProductOption.cartItem],
      };
      return newState;
    }
    case "DEC_PRODUCT_QTY": {
      if (state.productQuantity > 1) {
        const updatedCartItems = state.cartItems;
        updatedCartItems.pop();
        const newState = {
          ...state,
          productQuantity: state.productQuantity - 1,
          cartItems: updatedCartItems,
        };
        return newState;
      }
      return state;
    }
    default:
      return state;
  }
};

export const RSVPProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducers, initialState);
  const updateRsvpInfo = (data) => {
    console.log("func", data);
    dispatch({
      type: "UPDATE_RSVP_INFO",
      payload: data,
    });
  };

  const nextRsvpStep = (currentIndex) => {
    dispatch({
      type: "INCREMENT_RSVP_STEP",
      payload: currentIndex,
    });
  };

  const previousRsvpStep = (currentIndex) => {
    dispatch({
      type: "DECREMENT_RSVP_STEP",
      payload: currentIndex,
    });
  };

  const setResponseDetails = (data) => {
    dispatch({
      type: "SET_RESPONSE_DETAILS",
      payload: data,
    });
  };

  const addSelectedProduct = (product) => {
    dispatch({
      type: "ADD_SELECTED_PRODUCTS",
      payload: product,
    });
  };
  const addSelectedProductOption = (option) => {
    dispatch({
      type: "ADD_SELECTED_PRODUCT_OPTION",
      payload: option,
    });
  };
  const incrementProductQty = () => {
    dispatch({
      type: "INC_PRODUCT_QTY",
    });
  };
  const decrementProductQty = () => {
    dispatch({
      type: "DEC_PRODUCT_QTY",
    });
  };

  return (
    <RSVPContext.Provider
      value={{
        state,
        dispatch,
        updateRsvpInfo,
        nextRsvpStep,
        previousRsvpStep,
        setResponseDetails,
        addSelectedProduct,
        addSelectedProductOption,
        incrementProductQty,
        decrementProductQty,
      }}
    >
      {children}
    </RSVPContext.Provider>
  );
};

export const useRsvp = () => React.useContext(RSVPContext);
