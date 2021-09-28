import React from "react";
import ProductDetails from "../ProductDetails";
import { useProduct } from "../../../../Providers";

export default function BookingProduct() {
  const {
    state: productState,
    addSelectedProductOption,
    incrementProductQty,
    decrementProductQty,
  } = useProduct();
  const {
    selectedProduct,
    selectedProductOption,
    productQuantity,
  } = productState;

  console.log("selectedProduct from bookingProduct", useProduct());

  const handleProductOptionClick = async (option) => {
    await addSelectedProductOption(option);
    await incrementProductQty();
  };

  const handleQtyUpdate = (e, type) => {
    if (type === "dec") {
      decrementProductQty();
    } else {
      incrementProductQty();
    }
  };

  return (
    <ProductDetails
      selectedProduct={selectedProduct}
      selectedProductOption={selectedProductOption}
      handleProductOptionClick={handleProductOptionClick}
      productQuantity={productQuantity}
      handleQtyUpdate={handleQtyUpdate}
    />
  );
}
