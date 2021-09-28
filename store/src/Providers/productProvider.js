import React from "react";

const ProductContext = React.createContext();

const initialState = {
  products: [],
  selectedProduct: {},
  selectedProductOption: {},
  productQuantity: 0,
  cartItems: [],
};

const reducers = (state, { type, payload }) => {
  switch (type) {
    case "ADD_PRODUCTS": {
      const newState = {
        ...state,
        products: payload,
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

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducers, initialState);

  const addProducts = (products) => {
    dispatch({
      type: "ADD_PRODUCTS",
      payload: products,
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
    <ProductContext.Provider
      value={{
        state,
        dispatch,
        addProducts,
        addSelectedProduct,
        addSelectedProductOption,
        incrementProductQty,
        decrementProductQty,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => React.useContext(ProductContext);
