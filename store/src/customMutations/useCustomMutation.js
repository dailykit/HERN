import { useMutation } from "@apollo/client";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/router";
import { CREATE_EXPERIENCE_BOOKING } from "../graphql";
// import { useCart } from "../../Providers";
import { isEmpty } from "../utils";

export const useCustomMutation = () => {
  const { addToast } = useToasts();
  const router = useRouter();
  const [
    createExperienceBooking,
    { loading: isExperienceBookingCreating },
  ] = useMutation(CREATE_EXPERIENCE_BOOKING, {
    refetchQueries: ["CART_INFO"],
    onCompleted: ({ createExperienceBooking }) => {
      addToast("Poll is created successfully", {
        appearance: "success",
      });
      router.push(`/myPolls/${createExperienceBooking?.id}`);
    },
    onError: (error) => {
      addToast("Opps! Something went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  return {
    EXPERIENCE_BOOKING: {
      create: {
        loading: isExperienceBookingCreating,
        mutation: createExperienceBooking,
      },
    },
  };
};
