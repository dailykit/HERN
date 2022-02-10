import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Flex, Text, Spacer } from '@dailykit/ui'

import {
   Notes,
   PhoneIcon,
   EmailIcon,
   HomeIcon,
   ArrowUpIcon,
   ArrowDownIcon,
} from '../../../assets/icons'
import { Styles, StyledStat } from './styled'
import { useWindowSize } from '../../../../../shared/hooks'
import { currencyFmt, parseAddress } from '../../../../../shared/utils'

const address = 'apps.order.components.orderlistitem.'

export const Details = ({ order }) => {
   const { t } = useTranslation()
   const [brand, setBrand] = React.useState({
      logo: '',
      name: '',
   })
   const [currentPanel, setCurrentPanel] = React.useState('customer')
   const { width } = useWindowSize()
   React.useEffect(() => {
      console.log('order.....', order?.cart?.brand)
      if (!isNull(order.cart?.brand) && !isEmpty(order.cart?.brand)) {
         if (order.cart.source === 'a-la-carte') {
            if (!isEmpty(order.cart?.brand.onBrandName)) {
               setBrand(existing => ({
                  ...existing,
                  name: order.cart?.brand.onBrandName[0]?.name?.value,
               }))
            }
            if (!isEmpty(order.cart?.brand.brandLogo)) {
               setBrand(existing => ({
                  ...existing,
                  logo: order.cart?.brand.brandLogo[0]?.url?.value,
               }))
            }
         } else if (
            order.cart.source === 'subscription' &&
            !isEmpty(order.cart?.brand.brandSettings)
         ) {
            const { name = '', logo = '' } = order.cart?.brand.brandSettings[0]
            setBrand({ name, logo })
         }
      }
      if (width < 1023) {
         setCurrentPanel('')
      }
   }, [order, width])

   return (
      <aside>
         <div>
            {/* <Text as="p">Order Id: {order.id}</Text> */}
            <Text as="p">Brand: {brand.name}</Text>
            <Text as="p">
               Customer:
               {order.cart.customer?.customerFirstName || 'N/A'}&nbsp;
               {order.cart.customer?.customerLastName}
            </Text>
            <main>
               <Flex container alignItems="center">
                  <span>
                     <PhoneIcon size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  <Text as="subtitle">
                     {order.cart.customer?.customerPhone || 'N/A'}
                  </Text>
               </Flex>
               <Spacer size="8px" />
               <Flex container alignItems="center">
                  <span>
                     <EmailIcon size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  {order.cart.customer?.customerEmail ? (
                     <Text as="subtitle">
                        <a
                           target="__blank"
                           rel="noopener roreferrer"
                           href={`mailto:${order.cart.customer?.customerEmail}`}
                        >
                           {order.cart.customer?.customerEmail}
                        </a>
                     </Text>
                  ) : (
                     <Text as="subtitle">N/A</Text>
                  )}
               </Flex>
               <Spacer size="8px" />
               <Flex container>
                  <span>
                     <HomeIcon size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  <Text as="subtitle">
                     {parseAddress(order.cart.address) || 'N/A'}
                  </Text>
               </Flex>
               <Spacer size="8px" />
               <Flex container>
                  <span>
                     <Notes size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  <Text as="subtitle">
                     {order.cart.address?.notes || 'N/A'}
                  </Text>
               </Flex>
               <Spacer size="8px" />
            </main>
            <Text as="p">
               Amount: {currencyFmt(Number(order.amountPaid) || 0)}
            </Text>
         </div>
         {/* <Styles.Accordian isOpen={currentPanel === 'brand'}>
            <header>
               <Flex container alignItems="center">
                  {brand.logo && (
                     <>
                        <Flex
                           as="span"
                           container
                           width="24px"
                           height="24px"
                           alignItems="center"
                           justifyContent="center"
                        >
                           <img
                              alt={brand.name}
                              src={brand.logo}
                              style={{
                                 height: '100%',
                                 width: '100%',
                                 objectFit: 'contain',
                              }}
                           />
                        </Flex>
                        <Spacer size="8px" xAxis />
                     </>
                  )}
                  <Text as="p">{brand.name}</Text>
               </Flex>
               <ToggleButton
                  type="brand"
                  current={currentPanel}
                  toggle={setCurrentPanel}
               />
            </header>
            <main>
               <StyledStat>
                  <span>Source</span>
                  <span>{order.cart.source}</span>
               </StyledStat>
               <Spacer size="8px" />
               {order.cart.source === 'subscription' && (
                  <>
                     <StyledStat>
                        <span>Details</span>
                        <span>
                           {order.cart.subscriptionOccurence?.title?.title},
                           serves{' '}
                           {order.cart.subscriptionOccurence?.serving?.size},
                           count{' '}
                           {order.cart.subscriptionOccurence?.itemCount?.count}
                        </span>
                     </StyledStat>
                     <Spacer size="8px" />
                  </>
               )}
               {order.thirdPartyOrderId && (
                  <StyledStat>
                     <span>Third Party</span>
                     <span>{order?.thirdPartyOrder?.source}</span>
                  </StyledStat>
               )}
            </main>
         </Styles.Accordian>
         <Styles.Accordian isOpen={currentPanel === 'customer'}>
            <header>
               <Text as="p">
                  {order.cart.customer?.customerFirstName || 'N/A'}&nbsp;
                  {order.cart.customer?.customerLastName}
               </Text>
               <ToggleButton
                  type="customer"
                  current={currentPanel}
                  toggle={setCurrentPanel}
               />
            </header>
            <main>
               <Flex container alignItems="center">
                  <span>
                     <PhoneIcon size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  <Text as="subtitle">
                     {order.cart.customer?.customerPhone || 'N/A'}
                  </Text>
               </Flex>
               <Spacer size="8px" />
               <Flex container alignItems="center">
                  <span>
                     <EmailIcon size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  {order.cart.customer?.customerEmail ? (
                     <Text as="subtitle">
                        <a
                           target="__blank"
                           rel="noopener roreferrer"
                           href={`mailto:${order.cart.customer?.customerEmail}`}
                        >
                           {order.cart.customer?.customerEmail}
                        </a>
                     </Text>
                  ) : (
                     <Text as="subtitle">N/A</Text>
                  )}
               </Flex>
               <Spacer size="8px" />
               <Flex container>
                  <span>
                     <HomeIcon size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  <Text as="subtitle">
                     {parseAddress(order.cart.address) || 'N/A'}
                  </Text>
               </Flex>
               <Spacer size="8px" />
               <Flex container>
                  <span>
                     <Notes size={14} color="#718096" />
                  </span>
                  <Spacer size="4px" xAxis />
                  <Text as="subtitle">
                     {order.cart.address?.notes || 'N/A'}
                  </Text>
               </Flex>
               <Spacer size="8px" />
            </main>
         </Styles.Accordian>
         <Styles.Accordian isOpen={currentPanel === 'billing'}>
            <header>
               <Text as="p">
                  Amount: {currencyFmt(Number(order.amountPaid) || 0)}
               </Text>
               <ToggleButton
                  type="billing"
                  current={currentPanel}
                  toggle={setCurrentPanel}
               />
            </header>
            <main>
               <StyledStat>
                  <span>Item Total</span>
                  <span>{currencyFmt(Number(order.itemTotal) || 0)}</span>
               </StyledStat>
               <StyledStat>
                  <span>{t(address.concat('tax'))}</span>
                  <span>{currencyFmt(Number(order.tax) || 0)}</span>
               </StyledStat>
               <StyledStat>
                  <span>{t(address.concat('discount'))}</span>
                  <span>{order.discount}</span>
               </StyledStat>
               <StyledStat>
                  <span>{t(address.concat('delivery price'))}</span>
                  <span>{currencyFmt(Number(order.deliveryPrice) || 0)}</span>
               </StyledStat>
               <StyledStat>
                  <span>{t(address.concat('total'))}</span>
                  <span>{currencyFmt(Number(order.amountPaid) || 0)}</span>
               </StyledStat>
               <StyledStat>
                  <span style={{ flexShrink: 0 }}>Payment Id: </span>
                  <span>{order?.cart?.transactionId || 'N/A'}</span>
               </StyledStat>
            </main>
         </Styles.Accordian> */}
      </aside>
   )
}

const ToggleButton = ({ type, current, toggle }) => {
   return (
      <button
         type="button"
         onClick={() => toggle(current === type ? '' : type)}
      >
         {current === type ? <ArrowDownIcon /> : <ArrowUpIcon />}
      </button>
   )
}
