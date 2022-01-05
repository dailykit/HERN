export const formatTerminalStatus = {
   '00': {
      status: 'succeeded',
      message: 'Payment Successful',
   },
   '01': {
      status: 'declined',
      message:
         'Payment declined for different reasons (including invalid PIN), account not debited.',
   },
   '02': {
      status: 'rejected',
      message: 'Payment rejected, account not debited.',
   },
   11: {
      status: 'cancelled',
      message: 'Payment cancelled by user, account not debited.',
   },
   12: {
      status: 'void',
      message:
         'Payment void due to communication failure or some other reason, account not debited',
   },
   13: {
      status: 'card_not_supported',
      message: 'Card Not Supported',
   },
   14: {
      status: 'txn_not_allowed',
      message: 'Transaction Not allowed',
   },
   15: {
      status: 'card_expired',
      message: 'Expired Card',
   },
   16: {
      status: 'no_dial_tone',
      message: 'No Dial Tone (Phone line disconnected)',
   },
   17: {
      status: 'card_not_accepted',
      message: 'Card is not accepted.',
   },
   86: {
      status: 'incorrect_refund_card',
      message: 'Incorrect Refund Card.',
   },
   87: {
      status: 'pin_locked',
      message: 'PIN Locked.',
   },
   88: {
      status: 'pin_timeout',
      message: 'PIN Timeout.',
   },
   89: {
      status: 'service_not_accepted',
      message: 'Service Not Accepted.',
   },
   90: {
      status: 'card_removed_after_pin_entry',
      message: 'Card Removed After PIN Entry.',
   },
   91: {
      status: 'card_removed_before_pin_entry',
      message: 'Card Removed Before PIN Entry.',
   },
   92: {
      status: 'card_removed_after_arqc',
      message: 'Card removed after sending request (ARQC check failed).',
   },
   93: {
      status: 'card_timeout',
      message: 'Card Timeout.',
   },
   94: {
      status: 'invalid_pin',
      message: 'Invalid PIN.',
   },
   95: {
      status: 'invalid_amount',
      message: 'Invalid Amount.',
   },
   96: {
      status: 'invalid_card',
      message: 'Invalid Card (Blocked Card)',
   },
   97: {
      status: 'emv_blocked',
      message: 'EMV Application is Blocked.',
   },
   98: {
      status: 'transaction_declined_by_card',
      message: 'Transaction declined by Card',
   },
   99: {
      status: 'emv_card_not_detected',
      message: 'EMV Card not Detected by POS (Card not inserted into POS.',
   },
}
