export const initialState = {
   firstName: {
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   },
   lastName: {
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   },
   email: {
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   },
   phoneNo: {
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   },
   brand: {
      brandName: '--- Choose Brand ---',
      brandId: null,
      isTouched: false,
   },
   location: {
      locationLabel: '--- Choose Location ---',
      locationId: null,
      isTouched: false,
   },
}

export const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_FIELD':
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               value: payload.value,
            },
         }
      case 'SET_ERRORS':
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               meta: payload.value,
            },
         }
      case 'SET_FIELD_BRAND':
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               brandName: payload.brandName,
               brandId: payload.brandId,
               isTouched: payload.isTouched,
            },
         }
      case 'SET_FIELD_LOCATION':
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               locationLabel: payload.locationLabel,
               locationId: payload.locationId,
               isTouched: payload.isTouched,
            },
         }
      default:
         return state
   }
}
