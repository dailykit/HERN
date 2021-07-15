# Basics

![untitled](https://user-images.githubusercontent.com/36407043/95753943-f5611800-0cbf-11eb-8065-34fbf93ed1ff.png)

DailyKIT Insights is a library used to render analytical data (charts and tables). It uses a graphql api as a data source.

> NOTE: It only supports graphql services made with hasura at this moment.

## Getting Started

#### Tables

1. insights

This table stores insights related data which the Insight component uses to render analytics.

###### Fields

-  `identifier (primary key)` is used to link insights with charts configuration.
-  `query (text)` field stores the actual graphql query that the Insight component will use to fetch table and chart data.
-  `availableOptions (jsonb)` field is used by the Insight component to generate Filters. Filters are the options rendered on top of Insight which gives the user options to customise the data. Options in this field is grouped in a dropdown UI component.
-  `switches (jsonb)` field is used for generating show/hide column switches.
-  `isActive (boolean default false)` field can be used to filter out insights which are not needed.
-  `defaultOptions (jsonb)` field is similar to availableOptions. This gets attached to the query and can be overwritten by the `availableOptions` later by the user.
-  `description (text)` field can be used to provide short description about the insight.
-  `filters (jsonb)` same as availableOptions, used to render individual options like date range in insights. Options in this field gets rendered as individual dropdown components.

2. chart

This table stores the chart configurations related to insights.

###### Fields

-  `layoutType (text)` field specifies the space covered by the chart. Possible values can only be 'FLEX' or 'HERO'. The HERO config takes full horizontal width. The FLEX config takes half of the available horizontal width.
-  `config (jsonb)` field stores all the chart related data.

Example of `config` field

```js
;[
   {
      x: [{ key: 'id' }, { key: 'created_at' }],
      y: [{ key: 'amountPaid' }, { key: 'deliveryPrice' }],
      type: 'BarChart',
      options: {},
      multiple: false,
   },
   {
      x: [{ key: 'id' }, { key: 'created_at' }],
      y: [{ key: 'amountPaid' }, { key: 'deliveryPrice' }],
      type: 'Line',
      options: {},
      multiple: true,
   },
]
```

The `config` field takes array of objects. Each object follows a certain schema. For the list of available schemas read the [Schema](Schema.md)

---

## Example

#### DB configuration

Go to insights table and insert a row with below data:

`query`

```graphql
query OrderInsight(
   $options: order_order_bool_exp
   $includeSource: Boolean!
   $limit: Int
   $orderBy: [order_order_order_by!]
) {
   ordersAggregate(where: $options, limit: $limit, order_by: $orderBy) {
      aggregate {
         avg {
            averageAmountPaid: amountPaid
         }
         count(columns: id)
         sum {
            totalAmountPaid: amountPaid
            discount
            deliveryPrice
            tip
         }
      }
      nodes {
         id
         amountPaid
         source @include(if: $includeSource)
         created_at
         deliveryPrice
      }
   }
}
```

> NOTE: the query variables are used by the Insight component, so the names must not change. You can surely change the types or add more variables for use in show/hide column switches.

`availableOptions`

```js
{
   amountPaid: { _eq: null, _gt: null, _lt: null, _gte: null, _lte: null },
}
```

The above snippet will create user editable filters for the field `amountPaid`. The `_eq`, `_lt` and other fields will be automatically tranformed into meaningful fields like `Equals`, `Less than`...

`switches`

```js
{"includeSource":true}
```

Note that the name `includeSource` is the name of a variable in the query which is used to include/exclude the source graphql field. This object will be used to create the show/hide columns switch UI.

`identifier`

`OrderInsight`

The value should be unique. We will use this name in the charts table to link the charts to this insight.

`filters`

```js
{
   created_at: { _gt: null, _lt: null },
   deliveryPrice: { _eq: null, _gt: null, _lt: null, _gte: null, _lte: null },
}
```

The above snippet will create two filters namely created at and deliver price with the available options defined. Each option will be rendered on the UI as a separate dropdown. Again, camelCased, snake_cased and \_fields will be transformed into their meaningful values.

Also make the `isActive` true.

---

After creating the insight entry, go to the chart table and insert a row for a HERO chart:

`layoutType`: `HERO`,
`insightIdentifier`: `OrderInsight`, this name should match the insight's identifier field.
`config`:

```js
;[
   {
      x: [{ key: 'id' }, { key: 'created_at' }],
      y: [{ key: 'amountPaid' }, { key: 'deliveryPrice' }],
      type: 'BarChart',
      options: {},
      multiple: false,
   },
   {
      x: [{ key: 'id' }, { key: 'created_at' }],
      y: [{ key: 'amountPaid' }, { key: 'deliveryPrice' }],
      type: 'Line',
      options: {},
      multiple: true,
   },
]
```

The above snippet will configure a HERO chart, link it with the newly created insight entry, and add two charts (bar and line). These charts can be switched by the user.

> NOTE: the key in x and y used in above schema should be available in the query.

> NOTE: the schema for BarChart and Line chart is same. Refer to [Schema](Schema.md) for more info.

#### React Code

Create a component or a react-router page where you want to show the Insight.

Paste below code:

```react
<Insight
	identifier="OrderInsight"
	includeChart
/>
```

> NOTE: the identifier "OrderInsight" is what we defined earlier in the insights table.
> NOTE: the `inlcudeChart` prop includes the google charts.

---

## Insight props

| Name           | Description                                                                                                                                                                                                                                                  | Default | Required |
| -------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | -------: |
| `identifier`   | The insight identifier. Same as the identifier field in the insights table                                                                                                                                                                                   |         |      YES |
| `includeChart` | Boolean. Used to include/exclude chart                                                                                                                                                                                                                       | `false` |       NO |
| `includeTable` | Boolean. Used to include/exclude table                                                                                                                                                                                                                       | `true`  |       NO |
| `where`        | Object. Injected as where object in the query described in insights table. This object and the `availableOptions` field in the insights table gets merged using the `lodash.merge()`. The object should align witht the graphql type described in the query. |         |       NO |
| `limit`        | Number. Injected as the limit variable in the query described in the insights table.                                                                                                                                                                         |         |       NO |
| `order`        | Object. Injected as the orderBy variable in the query described in the insight. s table. The object should align witht the graphql type described in the query.                                                                                              |         |       NO |
