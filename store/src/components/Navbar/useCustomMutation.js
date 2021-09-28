import { useMutation } from "@apollo/client";
import { DELETE_CART, DELETE_EXPERIENCE_BOOKINGS } from "../../graphql";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/router";

export const useCustomMutation = () => {
  const router = useRouter();
  const { addToast } = useToasts();

  const [deleteCart, { loading: isCartDeleting }] = useMutation(DELETE_CART, {
    refetchQueries: ["CART_INFO"],
    onCompleted: () => {
      addToast("Cart Deleted!", { appearance: "success" });
      router.push("/");
    },
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [
    deleteExperienceBookings,
    { loading: isDeletingExperienceBooking },
  ] = useMutation(DELETE_EXPERIENCE_BOOKINGS, {
    refetchQueries: ["CART_INFO"],
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  return {
    CART: {
      delete: {
        loading: isCartDeleting,
        mutation: deleteCart,
      },
    },

    EXPERIENCE_BOOKINGS: {
      delete: {
        loading: isDeletingExperienceBooking,
        mutation: deleteExperienceBookings,
      },
    },
  };
};
