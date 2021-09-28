import React from "react";
import ProductDetails from "../ProductDetails";
import { useRsvp } from "../../../../Providers";

export default function RsvpProduct() {
  const {
    state: rsvpState,
    addSelectedProductOption,
    incrementProductQty,
    decrementProductQty,
  } = useRsvp();
  const { selectedProduct, selectedProductOption, productQuantity } = rsvpState;

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
