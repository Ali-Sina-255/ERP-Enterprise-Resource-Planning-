import React from "react";

const Input = React.forwardRef(
  ({ label, id, type = "text", className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          ref={ref}
          className={`block w-full px-3 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm 
                   focus:outline-none ${
                     error
                       ? "focus:ring-red-500 focus:border-red-500"
                       : "focus:ring-accent focus:border-accent"
                   } 
                   sm:text-sm ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

export default Input;
