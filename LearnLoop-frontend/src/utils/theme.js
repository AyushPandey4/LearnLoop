import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getColorVariant = (variant = "primary", type = "solid") => {
  const variants = {
    primary: {
      solid:
        "bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white",
      outline:
        "border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20",
      ghost:
        "text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20",
    },
    secondary: {
      solid:
        "bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600 text-white",
      outline:
        "border-2 border-secondary-600 dark:border-secondary-400 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20",
      ghost:
        "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20",
    },
    success: {
      solid:
        "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white",
      outline:
        "border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
      ghost:
        "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    danger: {
      solid:
        "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white",
      outline:
        "border-2 border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
      ghost:
        "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    },
    warning: {
      solid:
        "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white",
      outline:
        "border-2 border-yellow-600 dark:border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
      ghost:
        "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    },
  };

  return variants[variant]?.[type] || variants.primary[type];
};

export const getSizeVariant = (size = "md", component = "button") => {
  const sizes = {
    button: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    },
    input: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    },
    badge: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm",
      lg: "px-3 py-1 text-base",
    },
  };

  return sizes[component]?.[size] || sizes.button.md;
};

export const getStatusColor = (status) => {
  const colors = {
    success:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
    error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
    warning:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
    default: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200",
  };

  return colors[status] || colors.default;
};

export const getAnimation = (type = "fade") => {
  const animations = {
    fade: "animate-fade-in",
    slideUp: "animate-slide-up",
    slideDown: "animate-slide-down",
    spin: "animate-spin",
  };

  return animations[type] || animations.fade;
};
