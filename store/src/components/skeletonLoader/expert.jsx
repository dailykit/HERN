import React from "react";
import ContentLoader from "react-content-loader";

export const ExpertSkeleton = (props) => (
  <ContentLoader
    speed={2}
    width={300}
    height={360}
    viewBox="0 0 400 360"
    backgroundColor="#d3cfcf"
    foregroundColor="#736868"
    {...props}
  >
    <rect x="132" y="53" rx="0" ry="0" width="2" height="278" />
    <rect x="396" y="53" rx="0" ry="0" width="2" height="278" />
    <rect x="132" y="330" rx="0" ry="0" width="264" height="2" />
    <circle cx="265" cy="150" r="70" />
    <rect x="188" y="230" rx="0" ry="0" width="160" height="9" />
    <rect x="221" y="246" rx="0" ry="0" width="92" height="9" />
    <rect x="221" y="262" rx="0" ry="0" width="92" height="9" />
    <rect x="214" y="278" rx="0" ry="0" width="112" height="9" />
    <rect x="132" y="53" rx="0" ry="0" width="264" height="2" />
  </ContentLoader>
);
