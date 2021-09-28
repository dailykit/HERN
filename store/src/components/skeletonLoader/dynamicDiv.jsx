import React from "react";
import ContentLoader from "react-content-loader";

export const DynamicDiv = (props) => (
  <ContentLoader
    speed={2}
    width={400}
    height={460}
    viewBox="0 0 400 460"
    backgroundColor="#d3cfcf"
    foregroundColor="#736868"
    {...props}
  >
    <rect x="45" y="116" rx="4" ry="4" width="504" height="146" />
  </ContentLoader>
);
