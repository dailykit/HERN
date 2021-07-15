## task/feature list

### inventory app

#### suppliers

##### listing

-  [x] List all suppliers
-  [x] Filter suppliers by name, availability
-  [x] Clear filters
-  [x] Sort by `name` and `Person of Contact`
-  [x] Delete supplier
-  [x] Create new Recipe

##### Form

-  [x] Update supplier name
-  [x] Add basic information
   -  [x] supplier logo
   -  [x] address
   -  [x] person of contact
   -  [x] payment T&C
   -  [x] shipping T&C
-  [x] toggle availability

#### supplier item

##### listing

-  [x] List all supplier items
-  [x] Filter items by name
-  [x] Clear filters
-  [x] Sort by `item name` and `supplier`, `onHand`, `processing`, `par level`, `max. inventory level`, `awaiting` and `committed`
-  [x] Create new supplier item

##### Form

-  [x] Update supplier item name
-  [x] add supplier
-  [x] Add basic information
   -  [x] item sku
   -  [x] unit quantity
   -  [x] unit price
   -  [x] lead time
-  [x] create processings
   -  [x] as received from supplier and derived processings
      -  [x] select processing from master list
      -  [x] set par level and max. inventory level
      -  [x] set processing unit
      -  [x] set processing image
      -  [x] set labout time, % of yield, shelf life, and bulk density
      -  [x] set nutritional information
      -  [ ] auto generate nutritional information
      -  [x] set allergens
   -  [x] planned-lot sachets
      -  [x] add sachets
      -  [x] set sachet quantity
      -  [x] set sachet par level and max. inventory level
      -  [ ] update sachet information

#### work orders

##### listing

-  [x] List all work orders
-  [x] Filter orders by status
-  [x] Clear filters
-  [x] Sort by `status`, `scheduled date`, `user assigned`, `type`, `station assigned`
-  [x] Create new work order

##### Form

-  [x] select supplier name
-  [x] select input bulk item
-  [x] select output bulk item
-  [x] auto fetch the yield percentage of the bulk item or set manually
-  [x] set output quantity
-  [x] show committed quantity
-  [x] assign user
-  [x] assign station
-  [x] set scheulded on date
-  [x] toggle status - `PENDING | COMPLETED | CANCELLED`

#### purchase orders

##### listing

-  [x] List all purchase orders
-  [x] Filter orders by status
-  [x] Clear filters
-  [x] Sort by `status`
-  [x] Create new packaging purchase order
-  [x] create new supplier item purchase order

##### Form

-  [x] Create new supplier item purchase order
   -  [x] select supplier name
   -  [x] set order quantity
   -  [x] toggle status - `PENDING | COMPLETED | CANCELLED`
-  [x] Create new packaging purchase order
   -  [x] select packaging
   -  [x] set order quantity
   -  [x] toggle status - `PENDING | COMPLETED | CANCELLED`

#### packaging

##### listing

-  [x] List all packagings
-  [x] Filter orders by packaging name, on hand, awaiting, max inventory level
-  [x] Clear filters
-  [x] Sort by `name`, `on hand`, `awaiting`, `max inventory level`
-  [x] Create new packaging

##### Form

-  [x] Update packaging name
-  [x] add supplier
-  [x] Add basic information
   -  [x] item sku
   -  [x] packaging dimesions
   -  [x] par level
   -  [x] max. inventory level
   -  [x] unit quantity
   -  [x] unit price
   -  [x] case quantity
   -  [x] min. order value
   -  [x] lead time
   -  [x] packaging image
-  [x] packaging properties
   -  [x] water resistance
   -  [x] grease resistance
   -  [x] recyclable
   -  [x] compostable
   -  [x] microwaveable
   -  [x] FDA compliant
   -  [x] recycled
   -  [x] compressable
   -  [x] opacity
   -  [x] packaging material

---

### packaging hub

-  [x] categories view
-  [x] packagings listings
-  [x] filters
   -  [x] dimensions
   -  [x] FDA compliant
   -  [x] recyclable
   -  [x] compostable
   -  [x] water resistant
   -  [x] grease resistant
   -  [x] compressable
-  [x] packaging details page
-  [x] cart tunnel
   -  [x] add/remove packagings from cart
   -  [x] proceed to pay
   -  [x] payment methods and available balances view
   -  [x] confirm and place order
   -  [x] reflect ordered packagings in inventory
   -  [ ] add payment method - card
   -  [ ] handle payment from multiple methods
