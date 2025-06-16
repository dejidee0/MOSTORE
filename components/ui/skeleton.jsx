import React from "react";
import clsx from "clsx";

const Skeleton = ({ className = "" }) => {
  return (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );
};

export default Skeleton;
