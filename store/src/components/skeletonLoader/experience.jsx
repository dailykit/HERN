import React from "react";
import ContentLoader from "react-content-loader";

export const ExperienceSkeleton = (props) => (
  <ContentLoader
    speed={2}
    width={344}
    height={373}
    viewBox="0 0 344 373"
    backgroundColor="#d3cfcf"
    foregroundColor="#736868"
    {...props}
  >
    <rect x="16" y="17" rx="4" ry="4" width="320" height="200" />
    <circle cx="35" cy="248" r="20" />
    <rect x="69" y="229" rx="2" ry="2" width="265" height="15" />
    <rect x="69" y="253" rx="2" ry="2" width="140" height="15" />
  </ContentLoader>
);

ExperienceSkeleton.metadata = {
  name: "Costal Oktopus",
  github: "coktopus", // Github username
  description: "Experience Skeleton",
  filename: "Experience", // filename of your loader
};
