import React from 'react'
import styled from 'styled-components'
import { Flex } from '@dailykit/ui'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import CardDetails from './CardDetails'
import Button from '../../Button'
import Error from '../../Error'
import Input from '../../Input'
import { theme } from '../../../theme'
import { useUser } from '../../../Providers'
import { isEmpty } from '../../../utils'

export default function PaymentCardForm({ intent, handleResult, type }) {
   const { state: { user = {} } = {} } = useUser()
   const stripe = useStripe()
   const elements = useElements()
   const inputRef = React.useRef(null)
   const [name, setName] = React.useState('')
   const [error, setError] = React.useState('')
   const [submitting, setSubmitting] = React.useState(false)

   React.useEffect(() => {
      if (inputRef.current) {
         inputRef.current.focus()
      }
   }, [])

   const handleSubmit = async event => {
      setError('')
      setSubmitting(true)
      event.preventDefault()

      if (!stripe || !elements) {
         return
      }
      console.log(stripe, elements)
      const result = await stripe.confirmCardSetup(intent.client_secret, {
         payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
               name
            }
         }
      })

      if (result.error) {
         setSubmitting(false)
         setError(result.error.message)
         console.log('fail', result)
      } else {
         setSubmitting(false)
         console.log('succcess', result)
         handleResult(result)
         setError('')
      }
   }

   return (
      <StyledForm onSubmit={handleSubmit} type={type}>
         {type === 'tunnel' && <h3 className="greet-msg">Add Payment</h3>}

         <Flex container flexDirection="column" margin="0 0 1rem 0">
            <label htmlFor="name" className="card_label">
               Card Holder Name
            </label>
            <Input
               type="text"
               name="name"
               value={name}
               ref={inputRef}
               placeholder="Enter card holder's name"
               onChange={e => setName(e.target.value)}
               className="customInput"
            />
            <CardDetails />
         </Flex>
         <Button disabled={!stripe || submitting} className="customButton">
            {submitting ? 'Saving...' : 'Save'}
         </Button>
         {error && <Error>{error}</Error>}
      </StyledForm>
   )
}

const StyledForm = styled.form`
   .card_label {
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      margin-bottom: 1rem;
   }
   .greet-msg {
      font-size: 32px;
      font-weight: 500;
      color: ${theme.colors.textColor4};
      margin: 2rem 0;
      text-align: center;
   }
   .customButton {
      padding: 0 1rem;
      margin-bottom: 20px;
      background: ${theme.colors.secondaryColor};
   }
   .customInput {
      color: ${theme.colors.textColor4};
      margin-bottom: 1rem;
   }

   @media (max-width: 769px) {
      .customButton {
         margin-bottom: 64px;
      }
   }
`
