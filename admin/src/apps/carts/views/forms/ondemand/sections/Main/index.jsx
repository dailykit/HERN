import React from 'react'
import moment from 'moment'
import { forEach, isEqual } from 'lodash'
import styled, { css } from 'styled-components'
import { toast } from 'react-toastify'
import { useParams } from 'react-router'
import { Element } from 'react-scroll'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import debounce from '../../../../../../../shared/utils/debounce'
import {
   AnchorNav,
   AnchorNavItem,
   Text,
   Flex,
   Filler,
   Spacer,
   RadioGroup,
   IconButton,
   SearchBox,
} from '@dailykit/ui'

import { useManual } from '../../state'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import EmptyIllo from '../../../../../assets/svgs/EmptyIllo'
import {
   InlineLoader,
   ProductCards,
} from '../../../../../../../shared/components'
import {
   calcDiscountedPrice,
   currencyFmt,
   logger,
} from '../../../../../../../shared/utils'
import { SearchIcon, CloseIcon } from '../../../../../../../shared/assets/icons'

export const Main = () => {
   const { brand } = useManual()
   const [menu, setMenu] = React.useState([])
   const [categories, setCategories] = React.useState([])
   const [isMenuEmpty, setIsMenuEmpty] = React.useState(false)
   const [hasMenuError, setHasMenuError] = React.useState(false)
   const [isMenuLoading, setIsMenuLoading] = React.useState(true)

   const [showMenu, setShowMenu] = React.useState(true)
   const [search, setSearch] = React.useState('')
   const [showSearch, setShowSearch] = React.useState(false)
   const [menuProductIds, setMenuProductsIds] = React.useState([])

   const options = [
      { id: 1, title: 'Menu Store' },
      { id: 2, title: 'All Products' },
   ]

   const [fetchProducts] = useLazyQuery(QUERIES.PRODUCTS.LIST, {
      onCompleted: ({ products = [] }) => {
         const _menu = []
         categories.map(category => {
            _menu.push({
               title: category.name,
               products: products.filter(product =>
                  category.products.includes(product.id)
               ),
            })
         })
         const productIds = products.map(product => product.id)
         setMenuProductsIds(productIds)
         setMenu(_menu)
         setIsMenuEmpty(false)
         setHasMenuError(false)
         setIsMenuLoading(false)
      },
      onError: error => {
         logger(error)
         setIsMenuEmpty(false)
         setHasMenuError(true)
         setIsMenuLoading(false)
      },
   })
   useQuery(QUERIES.MENU, {
      skip: !brand?.id,
      variables: {
         params: { brandId: brand.id, date: moment().format('YYYY-MM-DD') },
      },
      onCompleted: async (data = {}) => {
         try {
            if (
               isEqual(data, {
                  menu: [{ data: { menu: [] }, __typename: 'onDemand_menu' }],
               })
            ) {
               setIsMenuEmpty(true)
               setHasMenuError(false)
               setIsMenuLoading(false)
               return
            }
            const [_data] = data.menu
            const { data: { menu = [] } = {} } = _data
            setCategories(menu)
            const ids = menu.map(({ products }) => products).flat()

            if (ids.length === 0) {
               setIsMenuEmpty(true)
               setHasMenuError(false)
               setIsMenuLoading(false)
               return
            }
            await fetchProducts({
               variables: {
                  where: {
                     isArchived: { _eq: false },
                     id: { _in: ids },
                  },
               },
            })
         } catch (error) {
            logger(error)
            setIsMenuLoading(false)
            setHasMenuError(true)
            setIsMenuEmpty(false)
            toast.error(
               'There was an issue in fetching the menu for today, please try again!'
            )
         }
      },
      onError: error => {
         logger(error)
         setIsMenuLoading(false)
         setHasMenuError(true)
         setIsMenuEmpty(false)
         toast.error(
            'There was an issue in fetching the menu for today, please try again!'
         )
      },
   })

   if (isMenuLoading) return <InlineLoader />
   if (hasMenuError)
      return (
         <Styles.Main>
            <Flex
               container
               width="100%"
               height="100%"
               alignItems="center"
               justifyContent="center"
            >
               <Filler
                  width="380px"
                  height="320px"
                  illustration={<EmptyIllo width="240px" />}
                  message="There was an issue in fetching the menu for today, please try again!"
               />
            </Flex>
         </Styles.Main>
      )
   if (isMenuEmpty)
      return (
         <Styles.Main>
            <Flex
               container
               width="100%"
               height="100%"
               alignItems="center"
               justifyContent="center"
            >
               <Filler
                  width="380px"
                  height="320px"
                  illustration={<EmptyIllo width="240px" />}
                  message="No products available for today!"
               />
            </Flex>
         </Styles.Main>
      )
   return (
      <Styles.Main>
         <Flex
            container
            width="100%"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center" justifyContent="flex-start">
               <RadioGroup
                  options={options}
                  active={1}
                  onChange={() => setShowMenu(!showMenu)}
               />
            </Flex>

            {showSearch && (
               <SearchBox
                  width="100%"
                  onBlur={() => setShowSearch(false)}
                  placeholder="Search"
                  value={search}
                  hasReadAccess={true}
                  hasWriteAccess={true}
                  fallBackMessage="You shall not pass!"
                  onChange={e => setSearch(e.target.value)}
               />
            )}
         </Flex>
         <Spacer size="20px" />
         {showMenu ? (
            <Menu menu={menu} menuProductIds={menuProductIds} />
         ) : (
            <AllProducts />
         )}
      </Styles.Main>
   )
}

const Menu = ({ menu, menuProductIds }) => {
   const { id: cartId } = useParams()
   const { cart, tunnels, dispatch } = useManual()

   const [showSearch, setShowSearch] = React.useState(false)
   const [searchedResult, setSearchedResult] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(false)
   const [input, setInput] = React.useState('')

   const [searchProducts] = useLazyQuery(QUERIES.PRODUCTS.LIST, {
      onCompleted: data => {
         setIsLoading(false)
         setSearchedResult(data.products)
      },
      fetchPolicy: 'network-only',
   })

   return (
      <>
         {showSearch ? (
            <Flex
               container
               width="100%"
               alignItems="center"
               justifyContent="space-between"
            >
               <SearchBox
                  placeholder="Search"
                  value={input}
                  hasReadAccess={true}
                  hasWriteAccess={true}
                  fallBackMessage="You shall not pass!"
                  onChange={e => {
                     setInput(e.target.value)
                     searchProducts({
                        variables: {
                           where: {
                              id: { _in: menuProductIds },
                              name: { _ilike: `%${e.target.value}%` },
                           },
                        },
                     })
                  }}
               />

               <IconButton
                  type="ghost"
                  size="sm"
                  onClick={() => setShowSearch(false)}
               >
                  <CloseIcon color="#ec3333" />
               </IconButton>
            </Flex>
         ) : (
            <Flex
               container
               width="100%"
               alignItems="center"
               justifyContent="space-between"
            >
               <AnchorNav>
                  {menu.map(item => (
                     <AnchorNavItem
                        key={item.title}
                        label={item.title}
                        targetElement={item.title}
                        containerId="categories"
                     />
                  ))}
               </AnchorNav>

               <IconButton
                  type="ghost"
                  size="sm"
                  onClick={() => setShowSearch(true)}
               >
                  <SearchIcon color="#888D9D" />
               </IconButton>
            </Flex>
         )}
         <Spacer size="10px" />
         {showSearch ? (
            <ProductCards
               input={input}
               isLoading={isLoading}
               data={searchedResult}
               cart={cart}
            />
         ) : (
            <Element
               id="categories"
               style={{
                  width: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  position: 'relative',
                  height: '95.7%',
                  padding: '0 14px',
               }}
            >
               {menu.map(item => (
                  <Element
                     key={item.title}
                     name={item.title}
                     style={{ height: '100%', overflowY: 'auto' }}
                  >
                     <Text as="text1">{item.title}</Text>
                     <Spacer size="14px" />
                     <ProductCards data={item.products} cart={cart} />

                     <Spacer size="24px" />
                  </Element>
               ))}
            </Element>
         )}
      </>
   )
}

const AllProducts = () => {
   const { id: cartId } = useParams()
   const { cart, tunnels, dispatch } = useManual()
   const [showSearch, setShowSearch] = React.useState(false)
   const [input, setInput] = React.useState('')
   const [allProducts, setAllProducts] = React.useState([])
   const [searchedResult, setSearchedResult] = React.useState([])
   const [searchProducts, { loading }] = useLazyQuery(QUERIES.PRODUCTS.LIST, {
      onCompleted: data => {
         if (input) {
            // hack for race condition
            setSearchedResult(data.products)
         }
      },
      fetchPolicy: 'network-only',
   })

   useQuery(QUERIES.PRODUCTS.LIST, {
      variables: {
         where: { isPublished: { _eq: true }, isArchived: { _eq: false } },
      },
      onCompleted: data => {
         setAllProducts(data.products)
      },
   })

   const optimizedSearchProducts = React.useCallback(
      debounce(searchProducts, 500),
      []
   )

   const handleSearch = value => {
      setInput(value)
      if (value.trim()) {
         optimizedSearchProducts({
            variables: {
               where: {
                  isPublished: { _eq: true },
                  isArchived: { _eq: false },
                  name: { _ilike: `%${value}%` },
               },
            },
         })
      } else {
         setSearchedResult([])
      }
   }

   return (
      <>
         {showSearch ? (
            <Flex
               container
               width="100%"
               alignItems="center"
               justifyContent="space-between"
            >
               <SearchBox
                  placeholder="Search"
                  value={input}
                  hasReadAccess={true}
                  hasWriteAccess={true}
                  fallBackMessage="You shall not pass!"
                  onChange={e => handleSearch(e.target.value)}
               />
               <IconButton
                  type="ghost"
                  size="sm"
                  onClick={() => setShowSearch(false)}
               >
                  <CloseIcon color="#ec3333" />
               </IconButton>
            </Flex>
         ) : (
            <Flex
               container
               width="100%"
               alignItems="center"
               justifyContent="space-between"
            >
               <AnchorNav>
                  <AnchorNavItem
                     targetElement="element-1"
                     label="All Products"
                     containerId="containerElement"
                  />
               </AnchorNav>

               <IconButton
                  type="ghost"
                  size="sm"
                  onClick={() => setShowSearch(true)}
               >
                  <SearchIcon color="#888D9D" />
               </IconButton>
            </Flex>
         )}
         <Spacer size="10px" />
         {showSearch ? (
            <ProductCards
               input={input}
               isLoading={loading}
               data={searchedResult}
               cart={cart}
            />
         ) : (
            <Element
               id="containerElement"
               style={{
                  position: 'relative',
                  height: '600px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  width: '100%',
               }}
            >
               <Element
                  name="element-1"
                  style={{
                     height: '1000px',
                  }}
               >
                  <ProductCards data={allProducts} cart={cart} />
               </Element>
            </Element>
         )}
      </>
   )
}

const Styles = {
   Main: styled.main`
      grid-area: main;
      overflow-y: auto;
      padding: 10px;
   `,

   Filler: styled(Filler)`
      p {
         font-size: 14px;
         text-align: center;
      }
   `,
}
