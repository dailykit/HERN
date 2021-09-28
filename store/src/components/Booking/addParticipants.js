const increment = ({ participants, maximumParticipant }) => {
  if (participants >= maximumParticipant) {
    return participants;
  } else {
    return participants + 1;
  }
};
const decrement = ({ participants }) => {
  if (participants <= 1) {
    return participants;
  } else {
    return participants - 1;
  }
};

const changeInput = ({ event, maximumParticipant }) => {
  const value = parseInt(event.target.value);
  if (value > maximumParticipant) {
    return maximumParticipant;
  } else if (value < 1) {
    return 1;
  } else {
    return value;
  }
};

const getPriceLevel = ({
  updatedParticipants,
  priceBreaks = [],
  minimumParticipant,
}) => {
  if (updatedParticipants <= minimumParticipant) {
    const priceLevelInfo = priceBreaks.find((detail) => detail?.person === 1);
    if (priceLevelInfo !== undefined) {
      return {
        currentPrice: priceLevelInfo?.totalPrice,
      };
    }
  }
  const priceLevelInfo = priceBreaks.find(
    (detail) => detail?.person === updatedParticipants
  );

  if (priceLevelInfo !== undefined) {
    return {
      currentPrice: priceLevelInfo?.totalPrice,
    };
  }
};

const addParticipants = async ({
  type = "inc",
  event,
  participants = 1,
  totalPrice = 0,
  classTypeInfo,
  priceBreakDown,
}) => {
  let updatedParticipants = participants;
  let updatedTotalPrice = totalPrice;
  if (type === "inc") {
    updatedParticipants = await increment({
      participants,
      maximumParticipant: classTypeInfo?.maximumParticipant,
    });
  } else if (type === "dec") {
    updatedParticipants = await decrement({ participants });
  } else {
    updatedParticipants = await changeInput({
      event,
      maximumParticipant: classTypeInfo?.maximumParticipant,
    });
  }
  if (updatedParticipants <= classTypeInfo?.minimumParticipant) {
    updatedTotalPrice = classTypeInfo?.minimumBookingAmount;
  }
  if (
    updatedParticipants > classTypeInfo?.minimumParticipant &&
    updatedParticipants <= classTypeInfo?.maximumParticipant
  ) {
    const { currentPrice } = await getPriceLevel({
      updatedParticipants,
      priceBreaks: priceBreakDown?.totalPriceBreak,
      minimumParticipant: classTypeInfo?.minimumParticipant,
    });

    updatedTotalPrice = currentPrice;

    // if (type === "inc") {
    //   updatedTotalPrice = updatedTotalPrice + currentPrice;
    // } else if (type === "dec") {
    //   updatedTotalPrice = updatedTotalPrice - currentPrice;
    // } else if (type === "input") {
    //   let priceByInput = 0;
    //   for (let i = 1; i <= updatedParticipants; i++) {
    //     const { currentPrice } = await getPriceLevel({
    //       updatedParticipants: i,
    //       priceBreakDownByPerson,
    //     });
    //     priceByInput += currentPrice;
    //   }
    //   updatedTotalPrice = priceByInput;
    // }
  }

  return {
    updatedParticipants,
    updatedTotalPrice,
  };
};
export default addParticipants;
