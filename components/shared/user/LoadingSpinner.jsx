import React from "react";

const LoadingSpinner = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin`}
    />
  );
};

export default LoadingSpinner;
