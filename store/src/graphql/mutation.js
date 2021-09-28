import { gql } from "@apollo/client";

export const FORGOT_PASSWORD = gql`
  mutation FORGOT_PASSWORD($email: String!, $origin: String!) {
    forgotPassword(email: $email, origin: $origin) {
      success
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation createCustomer($object: crm_customer_insert_input!) {
    createCustomer(object: $object) {
      id
      keycloakId
    }
  }
`;

export const CREATE_BRAND_CUSTOMER = gql`
  mutation createBrandCustomer($object: crm_brand_customer_insert_input!) {
    createBrandCustomer(object: $object) {
      id
    }
  }
`;

export const UPSERT_CUSTOMER_TAGS = gql`
  mutation UPSERT_CUSTOMER_TAGS($keycloakId: String!, $tags: jsonb!) {
    insert_crm_customer_experienceTags(
      objects: { keycloakId: $keycloakId, tags: $tags }
      on_conflict: {
        update_columns: tags
        constraint: customer_experienceTags_pkey
      }
    ) {
      returning {
        keycloakId
        tags
      }
    }
  }
`;

export const CREATE_CART = gql`
  mutation CREATE_CART($object: order_cart_insert_input!) {
    createCart(object: $object) {
      id
      customerKeycloakId
      experienceClassId
      parentCartId
      childCarts {
        id
        customerKeycloakId
        experienceClassId
        parentCartId
        cartItems {
          id
          cartId
        }
      }
    }
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CREATE_ADDRESS($object: platform_customerAddress_insert_input!) {
    platform_createCustomerAddress(object: $object) {
      id
      line1
      line2
      city
      state
      zipcode
      landmark
      country
      lat
      lng
      label
      additionalInfo
      notes
    }
  }
`;

export const UPDATE_PLATFORM_CUSTOMER = gql`
  mutation UPDATE_PLATFORM_CUSTOMER(
    $keycloakId: String!
    $_set: platform_customer_set_input!
  ) {
    platform_updateCustomer(
      pk_columns: { keycloakId: $keycloakId }
      _set: $_set
    ) {
      defaultCustomerAddressId
      defaultPaymentMethodId
      keycloakId
    }
  }
`;

export const DELETE_CUSTOMER_ADDRESS = gql`
  mutation DELETE_CUSTOMER_ADDRESS($id: uuid!) {
    platform_deleteCustomerAddress(id: $id) {
      keycloakId
      id
    }
  }
`;

export const CREATE_CHILD_CART = gql`
  mutation CREATE_CHILD_CART($object: order_cart_insert_input!) {
    createCart(object: $object) {
      id
      parentCartId
      cartItems {
        id
        cartId
      }
    }
  }
`;

export const DELETE_CART = gql`
  mutation DELETE_CART($cartIds: [Int!]!) {
    deleteCarts(where: { id: { _in: $cartIds } }) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_CART = gql`
  mutation UPDATE_CART(
    $cartId: Int!
    $_set: order_cart_set_input
    $_inc: order_cart_inc_input
  ) {
    updateCart(pk_columns: { id: $cartId }, _set: $_set, _inc: $_inc) {
      id
      experienceClassId
      experienceClassTypeId
    }
  }
`;
export const UPDATE_CARTS = gql`
  mutation UPDATE_CARTS($cartIds: [Int!]!, $_set: order_cart_set_input!) {
    updateCarts(where: { id: { _in: $cartIds } }, _set: $_set) {
      returning {
        id
        experienceClassId
        experienceClassTypeId
      }
    }
  }
`;
export const UPDATE_CART_ITEMS = gql`
  mutation UPDATE_CART_ITEMS(
    $cartIds: [Int!]!
    $_set: order_cartItem_set_input!
  ) {
    updateCartItems(where: { cartId: { _in: $cartIds } }, _set: $_set) {
      returning {
        id
        experienceClassId
        experienceClassTypeId
      }
    }
  }
`;

export const CREATE_STRIPE_PAYMENT_METHOD = gql`
  mutation CREATE_STRIPE_PAYMENT_METHOD(
    $object: platform_stripePaymentMethod_insert_input!
  ) {
    platform_createStripePaymentMethod(object: $object) {
      stripePaymentMethodId
    }
  }
`;

export const DELETE_STRIPE_PAYMENT_METHOD = gql`
  mutation DELETE_STRIPE_PAYMENT_METHOD($stripePaymentMethodId: String!) {
    platform_deleteStripePaymentMethod(
      stripePaymentMethodId: $stripePaymentMethodId
    ) {
      stripePaymentMethodId
      keycloakId
    }
  }
`;

export const CREATE_CART_ITEM = gql`
  mutation CREATE_CART_ITEM($object: order_cartItem_insert_input!) {
    createCartItem(object: $object) {
      id
      productId
    }
  }
`;

export const CREATE_CART_ITEMS = gql`
  mutation CREATE_CART_ITEMS($objects: [order_cartItem_insert_input!]!) {
    createCartItems(objects: $objects) {
      affected_rows
    }
  }
`;

export const DELETE_CART_ITEM = gql`
  mutation DELETE_CART_ITEM($id: Int!) {
    deleteCartItem(id: $id) {
      id
      cartId
    }
  }
`;

export const CREATE_EXPERIENCE_BOOKING = gql`
  mutation CREATE_EXPERIENCE_BOOKING(
    $object: experiences_experienceBooking_insert_input!
  ) {
    createExperienceBooking(
      object: $object
      on_conflict: {
        constraint: experienceBooking_experienceClassId_hostKeycloakId_key
        update_columns: cartId
      }
    ) {
      experienceClassId
      hostKeycloakId
      id
      cutoffTime
      parentCart {
        id
        customerKeycloakId
        experienceClassId
        parentCartId
        childCarts {
          id
          customerKeycloakId
          experienceClassId
          parentCartId
          cartItems {
            id
            cartId
          }
        }
      }
    }
  }
`;

export const UPDATE_EXPERIENCE_BOOKING = gql`
  mutation UPDATE_EXPERIENCE_BOOKING(
    $id: Int!
    $_set: experiences_experienceBooking_set_input!
  ) {
    updateExperienceBooking(pk_columns: { id: $id }, _set: $_set) {
      hostKeycloakId
      isPublicUrlActive
      cartId
      created_at
      experienceClassId
    }
  }
`;

export const CREATE_EXPERIENCE_BOOKING_PARTICIPANT = gql`
  mutation CREATE_EXPERIENCE_BOOKING_PARTICIPANT(
    $object: experiences_experienceBookingParticipant_insert_input!
  ) {
    createExperienceBookingParticipant(object: $object) {
      id
      email
      experienceBookingId
      cartId
    }
  }
`;

export const SEND_EMAIL = gql`
  mutation SEND_EMAIL($emailInput: EmailInput!) {
    sendEmail(emailInput: $emailInput) {
      message
      success
    }
  }
`;

export const SEND_SMS = gql`
  mutation SEND_SMS($message: String!, $phone: String!) {
    sendSMS(message: $message, phone: $phone) {
      message
      success
    }
  }
`;

export const UPDATE_EXPERIENCE_BOOKING_PARTICIPANT = gql`
  mutation UPDATE_EXPERIENCE_BOOKING_PARTICIPANT(
    $id: Int!
    $_set: experiences_experienceBookingParticipant_set_input!
  ) {
    updateExperienceBookingParticipant(pk_columns: { id: $id }, _set: $_set) {
      id
      email
      keycloakId
      phone
      isArchived
    }
  }
`;

export const CREATE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE = gql`
  mutation CREATE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE(
    $experienceBookingOptionId: Int!
    $experienceBookingParticipantId: Int!
  ) {
    createExperienceBookingParticipantChoice(
      object: {
        experienceBookingOptionId: $experienceBookingOptionId
        experienceBookingParticipantId: $experienceBookingParticipantId
      }
      on_conflict: {
        constraint: experienceBookingParticipantChoice_pkey
        update_columns: experienceBookingOptionId
      }
    ) {
      experienceBookingOptionId
      experienceBookingParticipantId
    }
  }
`;

export const DELETE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE = gql`
  mutation DELETE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE(
    $experienceBookingParticipantId: Int!
  ) {
    deleteExperienceBookingParticipantChoices(
      where: {
        experienceBookingParticipantId: { _eq: $experienceBookingParticipantId }
      }
    ) {
      returning {
        experienceBookingParticipantId
        experienceBookingOptionId
      }
    }
  }
`;

export const DELETE_EXPERIENCE_BOOKINGS = gql`
  mutation DELETE_EXPERIENCE_BOOKINGS($cartId: Int!) {
    deleteExperienceBookings(where: { cartId: { _eq: $cartId } }) {
      returning {
        cartId
        id
      }
    }
  }
`;

export const CREATE_EXPERIENCE_PARTICIPANTS = gql`
  mutation CREATE_EXPERIENCE_PARTICIPANTS(
    $objects: [experiences_experienceBookingParticipant_insert_input!]!
  ) {
    createExperienceBookingParticipants(objects: $objects) {
      returning {
        id
        cartId
      }
    }
  }
`;
export const UPDATE_EXPERIENCE_PARTICIPANTS = gql`
  mutation UPDATE_EXPERIENCE_PARTICIPANTS(
    $id: Int!
    $_set: experiences_experienceBookingParticipant_set_input!
  ) {
    updateExperienceBookingParticipant(pk_columns: { id: $id }, _set: $_set) {
      cartId
      email
      id
      phone
    }
  }
`;
export const DELETE_EXPERIENCE_PARTICIPANTS = gql`
  mutation DELETE_EXPERIENCE_PARTICIPANTS($id: Int!) {
    deleteExperienceBookingParticipant(id: $id) {
      cartId
      email
      id
    }
  }
`;

export const CREATE_CUSTOMER_SAVED_ENTITY = gql`
  mutation CREATE_CUSTOMER_SAVED_ENTITY(
    $object: crm_customer_savedEntities_insert_input!
  ) {
    createCustomerSavedEntity(object: $object) {
      id
      keycloakId
    }
  }
`;

export const DELETE_CUSTOMER_SAVED_ENTITY = gql`
  mutation DELETE_CUSTOMER_SAVED_ENTITY($id: Int!) {
    deleteCustomerSavedEntity(id: $id) {
      id
      keycloakId
    }
  }
`;
