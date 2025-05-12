import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // 'primary', 'secondary', 'danger', 'outline'
  size = "md", // 'sm', 'md', 'lg'
  className = "",
  disabled = false,
  IconLeft,
  IconRight,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";

  const variantStyles = {
    primary:
      "bg-accent hover:bg-accent/90 text-accent-foreground focus:ring-accent",
    secondary:
      "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-gray-300 focus:ring-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline:
      "bg-transparent hover:bg-gray-100 text-accent border border-accent focus:ring-accent",
    ghost: "bg-transparent hover:bg-gray-100 text-accent focus:ring-accent",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {IconLeft && (
        <IconLeft size={size === "sm" ? 14 : 18} className="mr-2 -ml-1" />
      )}
      {children}
      {IconRight && (
        <IconRight size={size === "sm" ? 14 : 18} className="ml-2 -mr-1" />
      )}
    </button>
  );
};

export default Button;
