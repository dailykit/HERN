import React from 'react'
import { Flex } from '@dailykit/ui'
import moment from 'moment'
import { Card, CardImage, CardBody, TagGroup, Tag } from './styles.js'
import { Clock, AddCircleIcon, CheckCircle } from '../../Icons'
import { theme } from '../../../theme'
import { isEmpty } from '../../../utils'
import { useUser, useExperienceInfo, useProduct } from '../../../Providers'

export default function ProductCard({ cardDetails, ...props }) {
   const {
      id,
      name = 'N/A',
      assets = {},
      price = 0,
      tags = [],
      type = 'simple',
      description = 'N/A',
      productOptions = [],
      additionalText = '',
      discount = 0
   } = cardDetails

   return (
      <Card {...props}>
         <CardImage>
            <img
               src={assets?.images[0]?.split(' ')?.join('%20')}
               alt="card-img"
            />
         </CardImage>
         <CardBody>
            <h2 className="exp-name">{name}</h2>
            {additionalText && (
               <p className="product_extra_info_text">{additionalText}</p>
            )}
            {description && (
               <p className="product_extra_info_text">{description}</p>
            )}
            <TagGroup>
               {tags.length &&
                  tags.map(tag => {
                     return <Tag>{tag}</Tag>
                  })}
            </TagGroup>
            {discount > 0 && (
               <div class="product-discount-tag">{discount} off</div>
            )}

            {/* {additionalText &&<p>{additionalText}</p>}  */}
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               margin="0 0 4px 0"
            >
               <p className="exp-info">$ {price + productOptions[0]?.price}</p>

               <div className="product_add_wrap">
                  {props.isAdded ? (
                     <p className="booked-exp">ADDED</p>
                  ) : (
                     <p className="book-exp">ADD</p>
                  )}
                  {props.isAdded ? (
                     <span className="icon_wrap_1">
                        <CheckCircle
                           size="20"
                           color={theme.colors.textColor4}
                        />
                     </span>
                  ) : (
                     <span className="icon_wrap">
                        <AddCircleIcon
                           size="20"
                           color={theme.colors.tertiaryColor}
                        />
                     </span>
                  )}
               </div>
            </Flex>
         </CardBody>
      </Card>
   )
}
