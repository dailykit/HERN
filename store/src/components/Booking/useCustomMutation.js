import { useMutation } from "@apollo/client";
import {
  CREATE_CART,
  CREATE_CHILD_CART,
  CREATE_CART_ITEM,
  CREATE_CART_ITEMS,
  CREATE_EXPERIENCE_BOOKING,
  UPDATE_EXPERIENCE_BOOKING,
  UPDATE_CART,
  UPDATE_CARTS,
  UPDATE_CART_ITEMS,
  DELETE_CART,
  DELETE_CART_ITEM,
  CREATE_EXPERIENCE_PARTICIPANTS,
  DELETE_EXPERIENCE_PARTICIPANTS,
} from "../../graphql";
import { useToasts } from "react-toast-notifications";
import { useCart } from "../../Providers";
import { isEmpty } from "../../utils";

export const useCustomMutation = () => {
  const { addHostCart } = useCart();
  const { addToast } = useToasts();
  const [createCart, { loading: isCartCreating }] = useMutation(CREATE_CART, {
    refetchQueries: ["CART_INFO"],
    onCompleted: async ({ createCart }) => {
      const hostCart = createCart?.childCarts.find(
        (childCart) => childCart.customerKeycloakId !== null
      );
      if (!isEmpty(hostCart)) {
        await addHostCart(hostCart);
      }
      addToast("Yeah! Just a step away for booking this experience", {
        appearance: "success",
      });
    },
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  const [
    createExperienceBooking,
    { loading: isExperienceBookingCreating },
  ] = useMutation(CREATE_EXPERIENCE_BOOKING, {
    refetchQueries: ["CART_INFO"],
    onCompleted: async ({ createExperienceBooking }) => {
      const hostCart = createExperienceBooking?.parentCart?.childCarts.find(
        (childCart) => childCart.customerKeycloakId !== null
      );
      if (!isEmpty(hostCart)) {
        await addHostCart(hostCart);
      }
      addToast("Yeah! Just a step away for booking this experience", {
        appearance: "success",
      });
    },
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  const [createChildCart, { loading: isChildCartCreating }] = useMutation(
    CREATE_CHILD_CART,
    {
      refetchQueries: ["CART_INFO"],

      onError: (error) => {
        addToast("Opps! Something went wrong!", { appearance: "error" });
        console.log(error);
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
  const [
    createExperienceParticipants,
    { loading: isExperienceParticipantsCreating },
  ] = useMutation(CREATE_EXPERIENCE_PARTICIPANTS, {
    refetchQueries: ["CART_INFO"],
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [updateCart, { loading: isCartUpdating }] = useMutation(UPDATE_CART, {
    refetchQueries: ["CART_INFO"],
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [
    updateExperienceBooking,
    { loading: isExperienceBookingUpdating },
  ] = useMutation(UPDATE_EXPERIENCE_BOOKING, {
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [updateCarts, { loading: isCartsUpdating }] = useMutation(
    UPDATE_CARTS,
    {
      refetchQueries: ["CART_INFO"],
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
  const [
    deleteExperienceParticipant,
    { loading: isDeletingParticipant },
  ] = useMutation(DELETE_EXPERIENCE_PARTICIPANTS, {
    onError: (error) => {
      addToast("Somthing went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

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
      updateMany: {
        loading: isCartsUpdating,
        mutation: updateCarts,
      },
      delete: {
        loading: isCartDeleting,
        mutation: deleteCart,
      },
    },
    CHILD_CART: {
      create: {
        loading: isChildCartCreating,
        mutation: createChildCart,
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
    EXPERIENCE_BOOKING: {
      create: {
        loading: isExperienceBookingCreating,
        mutation: createExperienceBooking,
      },
      update: {
        loading: isExperienceBookingUpdating,
        mutation: updateExperienceBooking,
      },
    },
    EXPERIENCE_PARTICIPANTS: {
      create: {
        loading: isExperienceParticipantsCreating,
        mutation: createExperienceParticipants,
      },
      delete: {
        loading: isDeletingParticipant,
        mutation: deleteExperienceParticipant,
      },
    },
  };
};
