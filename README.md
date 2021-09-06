## HERN (Hasura, Express, React, Node)

This project consists of:

1. Express Server: REST API for event triggers, inventory management, customer management, occurrence management etc.
2. Admin: A react app serving as admin portal for managing subscription store's products, plans, customers, order etc.
3. Store: A nextjs app to run consumer oriented platform for subscribing to a plan, placing order weekly etc
4. Template Service: Manages building email, sachet, label, reciept templates in html or pdf format.

#### Contribution Guide

1. Clone the repository in your local using:

```bash
https://github.com/dailykit/HERN.git
```

2. Checkout to `staging` branch using:

```bash
git checkout staging
```

3. Create a `.env` and populate the variables acc. to `.env.example` file.
4. Let's install the packages now by running following command:

```bash
yarn install:packages
```

5. Run the following commands to run the express server:

```bash
yarn dev:server
```

6. To create env config files required by admin and store, make a POST request to:

```bash
curl -XPOST 'http://localhost:4000/server/api/envs'
```

7. To work in admin, switch to admin folder and do following and the your app will start running on port 3000:

```bash
cd admin && yarn start
```

1. To work in store, switch to store folder and following and the your app will start running on port 3000:

```bash
cd store && yarn dev
```
