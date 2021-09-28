import React from "react";
import { useMutation } from "@apollo/client";
import { useToasts } from "react-toast-notifications";
import { BookmarkIcon } from "../Icons";
import {
  CREATE_CUSTOMER_SAVED_ENTITY,
  DELETE_CUSTOMER_SAVED_ENTITY,
} from "../../graphql";
import { isEmpty } from "../../utils";
import { theme } from "../../theme";
import { useAuth } from "../../Providers";

export default function WishlistComp({ method = "create", icon, ...props }) {
  const { addToast } = useToasts();
  const { state: userState } = useAuth();
  const { user = {} } = userState;

  // mutation for creating wishlist i.e. saving the experience to customer_savedEntities
  const [
    createCustomerSavedEntity,
    { loading: isAddingToWishlist },
  ] = useMutation(CREATE_CUSTOMER_SAVED_ENTITY, {
    onCompleted: () => {
      addToast("Added to Wishlist", { appearance: "success" });
    },
    onError: () => {
      addToast("Something went wrong!", { appearance: "error" });
    },
  });

  // mutation for deleting wishlist i.e. removing the experience from customer_savedEntities
  const [
    deleteCustomerSavedEntity,
    { loading: isRemovingFromWishlist },
  ] = useMutation(DELETE_CUSTOMER_SAVED_ENTITY, {
    onCompleted: () => {
      addToast("Removed from wishlist!", { appearance: "success" });
    },
    onError: () => {
      addToast("Something went wrong!", { appearance: "error" });
    },
  });

  //   const wishlistHandler = () => {
  //     const customer_savedEntity = props.experience?.customer_savedEntities.find(
  //       (entity) => entity.experienceId === props.experience?.id
  //     );
  //     if (!isEmpty(user) && user?.keycloakId) {
  //       if (isEmpty(customer_savedEntity)) {
  //         createCustomerSavedEntity({
  //           variables: {
  //             object: {
  //               keycloakId: user?.keycloakId,
  //               experienceId: props.experience?.id,
  //             },
  //           },
  //         });
  //       } else {
  //         deleteCustomerSavedEntity({
  //           variables: {
  //             id: customer_savedEntity?.id,
  //           },
  //         });
  //       }
  //     }
  //   };
  const wishlistHandler = () => {
    if (!isEmpty(user) && user?.keycloakId) {
      if (method === "create") {
        createCustomerSavedEntity({
          variables: {
            object: props?.variable || {},
          },
        });
      } else if (method === "delete") {
        deleteCustomerSavedEntity({
          variables: {
            id: props?.variable,
          },
        });
      }
    }
  };
  return (
    <span
      className={
        isAddingToWishlist || isRemovingFromWishlist
          ? `${props.className} in-action`
          : props.className
      }
      onClick={(e) => {
        e.stopPropagation();
        wishlistHandler();
      }}
      {...props}
    >
      {icon}
    </span>
  );
}
