import React from "react";
import { Route, Redirect } from "react-router-dom";

const ContextRoute = ({
  component: Component,
  contextComponent: Provider,
  isAuthenticated,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return (
            <Provider>
              <Component />
            </Provider>
          );
        } else {
          return <Redirect to="/" />;
        }
      }}
    />
  );
};

export default ContextRoute;
