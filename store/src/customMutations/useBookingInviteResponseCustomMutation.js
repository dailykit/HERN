import { useMutation } from "@apollo/client";
import {
  CREATE_CART,
  CREATE_CART_ITEM,
  CREATE_CART_ITEMS,
  CREATE_EXPERIENCE_BOOKING_PARTICIPANT,
  UPDATE_EXPERIENCE_BOOKING_PARTICIPANT,
  UPDATE_CART,
  UPDATE_CART_ITEMS,
  DELETE_CART,
  DELETE_CART_ITEM,
} from "../graphql";

import { useToasts } from "react-toast-notifications";
import { useCart, useRsvp } from "../Providers";
import { isEmpty } from "../utils";

export const useCustomMutation = () => {
  const { addHostCart } = useCart();
  const { state: rsvpState, updateRsvpInfo } = useRsvp();
  const { addToast } = useToasts();
  const [createCart, { loading: isCartCreating }] = useMutation(CREATE_CART, {
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  const [createParticipant, { loading: isCreatingParticipant }] = useMutation(
    CREATE_EXPERIENCE_BOOKING_PARTICIPANT,
    {
      onCompleted: async ({ createExperienceBookingParticipant }) => {
        updateRsvpInfo({
          participantId: createExperienceBookingParticipant?.id,
        });
        const dataToBeStore = {
          participantId: createExperienceBookingParticipant?.id,
        };
        await localStorage.setItem(
          "participantInfo",
          JSON.stringify(dataToBeStore)
        );
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const [createCartItem, { loading: isCartItemCreating }] = useMutation(
    CREATE_CART_ITEM,
    {
      refetchQueries: ["CART_INFO"],
      onError: (error) => {
        addToast("Opps! Something went wrong!", { appearance: "error" });
        console.log(error);
      },
    }
  );

  const [createCartItems, { loading: isCartItemsCreating }] = useMutation(
    CREATE_CART_ITEMS,
    {
      refetchQueries: ["CART_INFO"],
      onError: (error) => {
        addToast("Opps! Something went wrong!", { appearance: "error" });
        console.log(error);
      },
    }
  );

  const [updateCart, { loading: isCartUpdating }] = useMutation(UPDATE_CART, {
    refetchQueries: ["CART_INFO"],
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  const [updateParticipant, { loading: isUpdatingParticipant }] = useMutation(
    UPDATE_EXPERIENCE_BOOKING_PARTICIPANT,
    {
      onError: (error) => {
        addToast("Opps! Something went wrong!", { appearance: "error" });
        console.log(error);
      },
    }
  );

  const [updateCartItems, { loading: isCartItemsUpdating }] = useMutation(
    UPDATE_CART_ITEMS,
    {
      refetchQueries: ["CART_INFO"],
      onError: (error) => {
        addToast("Opps! Something went wrong!", { appearance: "error" });
        console.log(error);
      },
    }
  );
  const [deleteCart, { loading: isCartDeleting }] = useMutation(DELETE_CART, {
    refetchQueries: ["CART_INFO"],
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [deleteCartItem, { loading: isCartItemDeleting }] = useMutation(
    DELETE_CART_ITEM,
    {
      refetchQueries: ["CART_INFO"],
      onError: (error) => {
        addToast("Opps! Something went wrong!", { appearance: "error" });
        console.log(error);
      },
    }
  );
  return {
    CART: {
      create: {
        loading: isCartCreating,
        mutation: createCart,
      },
      update: {
        loading: isCartUpdating,
        mutation: updateCart,
      },
      delete: {
        loading: isCartDeleting,
        mutation: deleteCart,
      },
    },
    CART_ITEM: {
      create: {
        loading: isCartItemCreating,
        mutation: createCartItem,
      },
      createMany: {
        loading: isCartItemsCreating,
        mutation: createCartItems,
      },
      update: {
        loading: isCartItemsUpdating,
        mutation: updateCartItems,
      },
      delete: {
        loading: isCartItemDeleting,
        mutation: deleteCartItem,
      },
    },
    PARTICIPANT: {
      create: {
        loading: isCreatingParticipant,
        mutation: createParticipant,
      },
      update: {
        loading: isUpdatingParticipant,
        mutation: updateParticipant,
      },
    },
  };
};
