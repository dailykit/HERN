export const ORGANIZATION = `query organizations($organizationUrl: String_comparison_exp!) {
    organizations(where: {organizationUrl: $organizationUrl}) {
      id
    }
}`

export const GET_SES_DOMAIN = `
query aws_ses($domain: String!) {
  aws_ses(where: {domain: {_eq: $domain}}) {
    domain
    keySelector
    privateKey
    isVerified
  }
}
`

export const CART = `
query cart($id: Int!) {
  cart(id: $id) {
    id
    isTest
    amount
    totalPrice2(args: {params: "parentCart"})
    balancePayment
    paymentMethodId
    paymentCustomerId
    statementDescriptor
  }
}

`
export const CART_PAYMENT = `
query CART_PAYMENT($where: order_cartPayment_bool_exp!) {
  cartPayments(where: $where) {
    id
    cartId
    amount
    paymentId
    paymentMethodId
    paymentStatus
  }
}

`
