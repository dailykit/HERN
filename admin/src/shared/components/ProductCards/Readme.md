## Product Card
Flowing details are shown on card:
 
|Key| value | type|description
|--|--|--|--|
| image  | `product.assets.image` |array | contain images for product|
|name| `proudct.name` |string | product's name|
| additionalText| `product.additionalText` | string | Product additional text eg: Spicy, Contain Egg etc. |
|description |`product.description`|string| Product Description|
|price|`product.price`| integer/float | product original price
|discount|`product.discount`| integer/float | product discount in percentage |
|isPopupAllowed|`product.isPopupAllowed` | Boolean | product contains product options and modifier options if this value `false` then `product.defaultCartItem` will we use for that product for cart.|
|defaultProductOptionId|`product.defaultProductOptionId`| integer/nullable | id of product option which would be default for this product. When it is null the `defaultProductOption^` would be the first product option in list sorted by `position` |
|priceWithoutDiscount^ |`product.price`|integer/float| this is when there is no product options for that product and `isPopupAllowed` is `false`|
|priceWithDiscount^ |`product.price - (product.price*product.discount/100)`|integer/float| this value is only applicable when there is no product options for that product and `isPopupAllowed` is `false`|
|total^ |in description | integer | total price of product to show on card would be depend on `product.price`, `product.isPopupAllowed` and `productOptions`. If `prdouct.isPopupAllowed ==false` or ` product.productOptions.length==0` then `total = productWithDiscount` Else `total = productWithDiscount + (defaultProductOption.price + (defaultProductOption.price *defaultProductOption.discount/100 ))`|
|showPlusIconOnCart^|`product.isPopupAllowed==true` and `product.productOptions.length>0`| Boolean | to show plus icon on cart that make product to be customizable|


**^ : these variables are only use here for name reference (there values are used for calculation)**

## Product Card Popup

- Product name
- Product Price as shown in `ProductCard` and according to modifier options(if any). 
- Product Options are grouped by `type` (`inventory`, `mealKit`, `readyToEat` --> `products` schema `productOptionType` table).
- If there is only one `type` then showing `productOptions` without `type` info.
- default `type` would be select according to `deafultProductOption`.
