> Features list for Order App

### Orders

##### Listing

- [x] Order Details
  - [x] Customer Details
  - [x] Bill Information
  - [x] Order Fulfillment Type
  - [x] View Order Receipt
  - [x] Ready By/Fulfillment Timestamps
  - [x] Order Status
  - [x] Product Listing categorized by Product Type i.e Inventory, Ready To Eat and MealKit
  - [x] Product Assembly/Packing status count
  - [x] Product serving/quantity information
- [x] Pagination Support
 
### Order Details

##### Top Level

- [x] Order Ready By/Fulfillment Type
- [x] Print Kot or View in Browser
- [x] Product Segregation by Product Types

##### Meal Kits
- [x] Product Listing
  - [x] Print Label
  - [x] Sachet Listing
    - [x] Sachet Status
    - [x] Ingredient name, Supplier Name, Processing, Quantity and other meta details
  - [x] Sachet Packing Mode
    - [x] Sachet Meta Details
    - [x] Weighing Scale Integration with Tare support as well as Testing Mode
    - [x] Print Sachet Label Integration as well as Testing Mode
    - [x] Sachet Label equipped with QR Code
    - [x] Packaging Details
    - [ ] SOP Details with integrated PDF/Image/Video Viewer
    - [x] Auto updating Sachet Status based on weighing information and print status

##### Inventory
- [x] Product Listing
  - [x] Print Label w/ Test mode
  - [x] Inventory Product Packing Mode
    - [x] Product Status
    - [x] Mark product packed/assembled
    
##### Ready To Eat
- [x] Product Listing
  - [x] Print Label w/ Test mode
  - [x] Ready To Eat Product Packing Mode
    - [x] Product Status
    - [x] Mark product packed/assembled
    
### Planned Mode
- [x] Assmebler and Packer Friendly User Interface
- [x] Segregation by Product Type i.e
  - [x] Inventory
  - [x] Ready To Eat
  - [x] MealKit
- [x] Inventory
  - [x] Listing of Inventory Products
  - [x] List of all Product Options
  - [x] Total Product required count
  - [x] Total Quantity required for the Product
  - [x] Detail page for each Inventory Product
    - [x] Products Listing
      - [x] Listing of Orders the Product is required for
      - [x] Button to navigate to Order Details
- [x] Ready To Eat
  - [x] Listing of Ingredients
  - [x] List of all Product Servings
  - [x] Total Product required count
  - [x] Total Quantity required for the Product
  - [x] Detail page for each Ready To Eat Product
    - [x] Products Listing
      - [x] Listing of Orders the Product is required for
      - [x] Button to navigate to Order Details
- [x] Meal Kit
  - [x] Listing of Ingredients
  - [x] List of all Product Servings
  - [x] Total Product required count
  - [x] Total Quantity required for the Product

- [x] Meal Kit Sachets
  - [x] Listing of Ingredients
    - [x] Processings required for each Ingredient
      - [x] Processing required in terms of Quantity
      - [x] Sachet Count
      - [x] Sachets required for each Processing
        - [x] Order count status
        - [x] Listing of orders and product name they're required in

### Order Delivery
- [x] Assigned delivery provider to an Order
- [x] Track Delivery

### Global Filters
- [x] By Status
- [x] Ready By Time
- [x] Fulfillment Time
- [x] Order Source
- [x] Amount
- [x] Station
- [x] Fulfillment Type
  
### Automated Order Status
- [x] Marking any sachet or product packed will move Order to `Under Processing`
- [x] Marking all products/sachets packed will move Order to `Ready To Assemble`
- [x] Marking all products assembled will move Order to `Ready To Dispatch`
 
### Stations Status
- [x] View Live Stations
- [x] View Live KOT Printer
- [x] View Live Label Printer
- [x] View Live Scale

### Order Settings
- [x] Weighing Scale Simulation
- [x] Print Simulation
- [x] Kot Template Settings
  - [x] Grouping by Stations
  - [x] Grouping by Product Type
  - [x] Print KOT Automatically
  - [x] Select default Printer

### Notifications
- [x] Live notifications with Buzzer sound for incoming orders
- [x] Click notification to go to Order Details

### Layout
- [x] Switch between layouts
  - [x] Summary on Left with Orders on Right
  - [x] Orders on Left with Summary on Right
