# Schema for dfferent chart types.

##### Currently supported charts types

-  [x] Bar, Horizontal BarChart, AreaChart, Line
-  [x] PieChart, doughnut chart
-  [x] calendar chart
-  [ ] treeMap

### Bar/Horizontal BarChart/AreaChart/Line

`schema`

```js
   {
      x: [{ key: 'id' }, { key: 'created_at' }],
      y: [{ key: 'amountPaid' }, { key: 'deliveryPrice' }], 
      type: 'BarChart',
      options: {}, 
      multiple: false, // allows to show multiple sources in the y-axis
   },
```

> NOTE: `key` should match the graphql query fields

`options` are [google chart options for bar chart](https://developers.google.com/chart/interactive/docs/gallery/barchart#configuration-options)

### PieChart/Doughnut Chart

`schema`

```js
   {
      type: 'PieChart',
      options: {},
      slices: [{ key: 'id' }, { key: 'created_at' }],
      metrices: [
         {
            key: 'amountPaid',
            title: 'Revenue',
         },
         {
            key: 'deliveryPrice',
            title: 'delivery price',
         },
      ],
      multiple: false, // this must be false.
   }
```

> NOTE: `key` should match the graphql query

`options` are [Google chart options for pie chart](https://developers.google.com/chart/interactive/docs/gallery/piechart#configuration-options)

### Calendar Chart

`schema`

```js
   {
      type: 'Calendar',
      title: 'Revenue earned',
      options: {},
      dateKeys: ['created_at'],
      metrices: [
         { key: 'amountPaid', title: 'Revenue' },
         { key: 'deliveryPrice', title: 'delivery price' },
      ],
      multiple: false, // this must be false all the time.
   }
```

> NOTE: `key` should match the graphql query fields

`options` are [Google chart options for calendar chart](https://developers.google.com/chart/interactive/docs/gallery/calendar#configuration-options)

### treeMap

coming soon...
