import React, { useRef } from "react";
import { useRouter } from "next/router";
import { FloatingWrapper } from "./styles";
import { CartIcon, DeleteIcon, CrossIcon } from "../Icons";
import { useAuth } from "../../Providers";
import { theme } from "../../theme.js";
import { useWindowDimensions, useOnClickOutside } from "../../utils";
import { useCustomMutation } from "./useCustomMutation";

export default function FloatingCart({
  carts,
  isFloatingButtonVisible,
  toggleFloatingButton,
  showFloatingButton,
  hideFloatingButton,
}) {
  const node = useRef();
  const { CART, EXPERIENCE_BOOKINGS } = useCustomMutation();
  const router = useRouter();

  useOnClickOutside(node, hideFloatingButton);

  const deleteHandler = async (cartId) => {
    await EXPERIENCE_BOOKINGS.delete.mutation({
      variables: {
        cartId: cartId,
      },
    });

    await CART.delete.mutation({
      variables: {
        cartIds: [cartId],
      },
    });
  };

  return (
    <FloatingWrapper
      ref={node}
      shouldVisible={Boolean(carts.length)}
      isFloatingButtonVisible={isFloatingButtonVisible}
    >
      <div className="floating-button" onClick={toggleFloatingButton}>
        {isFloatingButtonVisible ? (
          <CrossIcon size="38" color={theme.colors.textColor4} />
        ) : (
          <>
            <CartIcon size="38" color={theme.colors.textColor4} />
            <h3 className="cart-count-batch">{carts.length}</h3>
          </>
        )}
      </div>
      <div className="floating-button-main">
        <ul className="nav-list">
          {carts.map((cart) => {
            return (
              <li
                className="nav-list-item"
                onClick={(e) => {
                  router.push(`/checkout?cartId=${cart?.id}`);
                }}
              >
                <img
                  src={cart?.experienceClass?.experience?.assets?.images[0]}
                  alt="cart-img"
                />
                <p className="title">
                  {cart?.experienceClass?.experience?.title}
                </p>
                <span
                  className="delete-icon-onright"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHandler(cart?.id);
                  }}
                >
                  <DeleteIcon size="18" color="#fff" />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </FloatingWrapper>
  );
}
