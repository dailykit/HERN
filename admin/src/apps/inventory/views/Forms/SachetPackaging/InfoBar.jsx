import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, TextButton } from '@dailykit/ui'
import styled from 'styled-components'

import { currencyFmt } from '../../../../../shared/utils'
import { ItemIcon, CaseIcon, TruckIcon, ClockIcon } from '../../../assets/icons'
import { Tooltip } from '../../../../../shared/components'

const address = 'apps.inventory.views.forms.item.'

export default function InfoBar({ open, state }) {
   const { t } = useTranslation()

   if (
      !state.unitQuantity &&
      !state.unitPrice &&
      !state.caseQuantity &&
      !state.minOrderValue &&
      !state.leadTime?.value &&
      !state.leadTime?.unit
   )
      return (
         <EmptyWrapper>
            <TextButton onClick={() => open(1)} type="outline">
               Add Information
            </TextButton>
         </EmptyWrapper>
      )

   return (
      <StyledGrid onClick={() => open(1)}>
         <div>
            <div>
               <ItemIcon />
            </div>
            <div>
               <span>
                  <Flex container alignItems="center">
                     {t(address.concat('unit qty'))}
                     <Tooltip identifier="packaging_form_view-unitQuantity" />
                  </Flex>
               </span>
               <div>
                  <span>{state.unitQuantity || 'N/A'}</span>
                  {state.unitPrice ? (
                     <span>{currencyFmt(Number(state.unitPrice) || 0)}</span>
                  ) : null}
               </div>
            </div>
         </div>
         <div>
            <div>
               <CaseIcon />
            </div>
            <div>
               <span>
                  <Flex container alignItems="center">
                     {t(address.concat('case qty'))}
                     <Tooltip identifier="packaging_form_view-caseQuantity" />
                  </Flex>
               </span>
               <div>
                  <span>{state.caseQuantity || 'N/A'}</span>
                  {state.unitPrice && state.caseQuantity ? (
                     <span>
                        {currencyFmt(
                           Number(+state.unitPrice * +state.caseQuantity) || 0
                        )}
                     </span>
                  ) : null}
               </div>
            </div>
         </div>
         <div>
            <div>
               <TruckIcon />
            </div>
            <div>
               <span>
                  <Flex container alignItems="center">
                     {t(address.concat('min order value'))}
                     <Tooltip identifier="packaging_form_view-minOrderValue" />
                  </Flex>
               </span>
               <div>
                  <span>{state.minOrderValue}</span>
                  {state.unitPrice && state.minOrderValue ? (
                     <span>
                        {currencyFmt(
                           Number(+state.unitPrice * +state.minOrderValue) || 0
                        )}
                     </span>
                  ) : null}
               </div>
            </div>
         </div>
         <div>
            <div>
               <ClockIcon />
            </div>
            <div>
               <span>
                  <Flex container alignItems="center">
                     {t(address.concat('lead time'))}
                     <Tooltip identifier="packaging_form_view-leadtime" />
                  </Flex>
               </span>
               <div>
                  <span>{`${state.leadTime?.value || 'N/A'}  ${
                     state.leadTime?.value ? state.leadTime?.unit : ''
                  }`}</span>
               </div>
            </div>
         </div>
      </StyledGrid>
   )
}

const EmptyWrapper = styled.div`
   width: 100%;
   padding: 30px;
   text-align: center;
   border-bottom: 1px solid #dddddd;
   border-top: 1px solid #dddddd;
`

const StyledGrid = styled.div`
   width: 100%;
   display: grid;
   padding: 0 20px;
   grid-template-columns: repeat(4, 1fr);
   height: 96px;
   border-bottom: 1px solid #dddddd;
   border-top: 1px solid #dddddd;

   &:hover {
      background-color: #ededed;
      cursor: pointer;
   }

   > div {
      &:not(:last-child) {
         border-right: 1px solid #dddddd;
      }

      display: flex;
      align-items: center;
      padding: 12px;

      > div {
         &:last-child {
            flex: 1;
            padding: 8px;
            display: flex;
            flex-direction: column;

            div {
               font-weight: 500;
               line-height: 23px;
               color: #555b6e;
               display: flex;
               justify-content: space-between;
            }
         }
      }
   }
`
