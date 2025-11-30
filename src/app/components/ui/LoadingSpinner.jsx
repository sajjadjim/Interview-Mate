// src/components/ui/LoadingSpinner.jsx
"use client";

const sizeClasses = {
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-3",
  lg: "w-14 h-14 border-4",
};

export default function LoadingSpinner({
  size = "md",
  label = "Loading...",
  fullScreen = false,
}) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`rounded-full border-t-transparent border-solid animate-spin ${sizeClasses[size]} border-gray-300 border-t-indigo-500`}
      />
      {label && (
        <p className="text-xs font-medium tracking-wide text-gray-500">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
