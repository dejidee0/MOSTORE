// src/components/messages/shared/LoadingSpinner.jsx
"use client";

export default function LoadingSpinner({ size = "medium", className = "" }) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-2",
    large: "h-12 w-12 border-b-2",
  };

  return (
    <div className="text-center">
      <div
        className={`animate-spin rounded-full border-orange-500 mx-auto ${sizeClasses[size]} ${className}`}
      />
    </div>
  );
}
