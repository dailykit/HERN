import React from "react";
const Circle = ({ width, height, fill }) => (
  <svg
    width={width || "124"}
    height={height || "121"}
    viewBox="0 0 132 132"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="66" cy="66" r="66" fill={fill || "#172B43"} />
  </svg>
);
export default Circle;
