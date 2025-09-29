"use client";
import Image from "next/image";
import React from "react";
import { toast as sonnerToast, Toaster } from "sonner";
import { usePathname } from "next/navigation";

// Route filtering - clean utility to check if toasts should be blocked
let blockedRoutes: string[] = [];

function shouldBlockToast(customBlockedRoutes?: string[]): boolean {
  if (typeof window === 'undefined') return false;
  
  const currentPath = window.location.pathname;
  const routesToCheck = customBlockedRoutes || blockedRoutes;
  
  return routesToCheck.some(route => {
    // Support exact match and wildcard patterns
    if (route.endsWith('*')) {
      return currentPath.startsWith(route.slice(0, -1));
    }
    return currentPath === route;
  });
}

// Helper function to determine animation class based on position
function getAnimationClass(position: string): string {
  if (position.includes("left")) {
    return "toast-slide-left";
  }
  return "toast-slide-right";
}

// Enhanced Toast Component with dynamic slide animation
function Toast(props: ToastProps & { position?: string }) {
  const {
    title,
    description,
    button,
    id,
    variant = "default",
    position = "top-right",
  } = props;

  const animationClass = getAnimationClass(position);

  // Variant styles for different toast types
  const variantStyles = {
    default: "bg-white ring-gray-200",
    success: "bg-[#008258] border-white text-white",
    loading: "bg-[#003082] border-white text-white",
    error: "bg-[#820000] border-white text-white",
    warning: "bg-yellow-50 ring-yellow-200",
    info: "bg-blue-50 ring-blue-200",
  };

  const buttonStyles = {
    default: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    success: "bg-green-100 text-green-700 hover:bg-green-200",
    loading: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    error: "bg-red-100 text-red-700 hover:bg-red-200",
    warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    info: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    button?.onClick();
    setTimeout(() => sonnerToast.dismiss(id), 0);
  };

  return (
    <div
      className={`
        ${animationClass}  font-avenir inline-block self-start rounded-[26px] shadow-lg 
        ${variantStyles[variant]} w-full md:max-w-[370px] border-[0.5px]
        items-center px-3 transition-all duration-300 ${description ? "py-3 px-4" : "py-2"}
        toast-item
      `}
      onClick={() => sonnerToast.dismiss(id)}>
      <div
        className={`flex flex-1  ${
          description ? "items-start" : " items-center"
        }`}
        onClick={(e) => e.stopPropagation()}>
        {variant === "loading" && (
          <div className="mr-1.5">
            <Image
              src="/icons/loader-w.svg"
              width={30}
              height={30}
              alt="loader"
            />
          </div>
        )}
        <div className={`w-full ${description ? "mt-[2px]" : ""}`}>
          {typeof title === "string" ? (
            <p
              className={`text-sm font-medium ${
                variant === "default" ||
                variant === "warning" ||
                variant === "info"
                  ? "text-gray-900"
                  : "text-white"
              }`}
            >
              {title}
            </p>
          ) : (
            <>{title}</>
          )}
          {description && (
            <p
              className={`mt-1 text-sm ${
                variant === "default" ||
                variant === "warning" ||
                variant === "info"
                  ? "text-gray-700"
                  : "text-white/80"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {button && (
        <div className="ml-5 shrink-0">
          <button
            className={`
              rounded px-3 py-1 text-sm font-semibold transition-colors
              focus:ring-2 focus:ring-offset-2 focus:outline-none
              ${buttonStyles[variant]}
            `}
            onClick={handleButtonClick}
          >
            {button.label}
          </button>
        </div>
      )}
    </div>
  );
}

// Unified props for createToast and variants
type BaseToastProps = Omit<ToastProps, "id"> & {
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  blockRoutes?: string[];
};

// Main toast function with call signature
function createToast(props: BaseToastProps) {
  if (shouldBlockToast(props.blockRoutes)) return;
  
  const {
    variant = "default",
    duration,
    position = "top-right",
    blockRoutes,
    ...rest
  } = props;
  const animationClass = getAnimationClass(position);

  return sonnerToast.custom(
    (id) => <Toast {...rest} id={id} variant={variant} position={position} />,
    {
      duration,
      position,
      unstyled: true,
      classNames: {
        toast: animationClass,
        title: "!text-sm !font-medium",
        description: "!text-sm !mt-1",
        actionButton: "!rounded !px-3 !py-1 !text-sm !font-semibold",
        closeButton: "!hidden",
      },
    }
  );
}

// Toast variants for different use cases
export const toast = Object.assign(createToast, {
  default: (props: BaseToastProps) =>
    createToast({ ...props, variant: "default" }),

  success: (props: BaseToastProps) =>
    createToast({ ...props, variant: "success" }),

  loading: (props: BaseToastProps) =>
    createToast({ ...props, variant: "loading" }),

  error: (props: BaseToastProps) => createToast({ ...props, variant: "error" }),

  warning: (props: BaseToastProps) =>
    createToast({ ...props, variant: "warning" }),

  info: (props: BaseToastProps) => createToast({ ...props, variant: "info" }),

  // Enhanced Promise toast with position-aware animations and no default spinner
  promise: async <T,>(
    promise: Promise<T>,
    options: {
      loading:
        | string
        | {
            title: string;
            description?: string;
            button?: ToastProps["button"];
            duration?: number;
          };
      success:
        | string
        | { title: string; description?: string; button?: ToastProps["button"] }
        | ((data: T) => {
            title: string;
            description?: string;
            button?: ToastProps["button"];
            duration?: number;
          });
      error:
        | string
        | { title: string; description?: string; button?: ToastProps["button"] }
        | ((error: any) => {
            title: string;
            description?: string;
            button?: ToastProps["button"];
            duration?: number;
          });
      duration?: number;
      position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      blockRoutes?: string[];
    }
  ): Promise<T> => {
    // Block promise toasts if on restricted route
    if (shouldBlockToast(options.blockRoutes)) {
      // Still execute the promise but without UI feedback
      return promise;
    }
    
    const {
      loading,
      success,
      error,
       duration: defaultDuration,
      position = "top-right",
      blockRoutes,
    } = options;
    const animationClass = getAnimationClass(position);

    // Wrapper to render custom Toast for each state
    const renderCustom = (content: any, variant: ToastProps["variant"],stateDuration?: number) => {
      const props = typeof content === "string" ? { title: content } : content;

      const toastDuration = stateDuration ?? defaultDuration;

      return sonnerToast.custom(
        (id) => (
          <Toast {...props} id={id} variant={variant} position={position} />
        ),
        {
          duration: toastDuration,
          position,
          unstyled: true,
          classNames: { toast: animationClass },
        }
      );
    };

    // Show loading toast using fully custom render (no Sonner default spinner)
    const loadingProps =
      typeof loading === "string" ? { title: loading } : loading;
    const loadingId = renderCustom(loadingProps, "loading",loadingProps.duration);

    try {
      const result = await promise;

      // Dismiss loading and show success
      sonnerToast.dismiss(loadingId);

      const successProps =
        typeof success === "string"
          ? { title: success }
          : typeof success === "function"
          ? success(result)
          : success;

      renderCustom(successProps, "success");

      return result;
    } catch (err) {
      // Dismiss loading and show error
      sonnerToast.dismiss(loadingId);

      const errorProps =
        typeof error === "string"
          ? { title: error }
          : typeof error === "function"
          ? error(err)
          : error;

      renderCustom(errorProps, "error");

      throw err;
    }
  },

  // Simple message toasts
  message: {
    success: (
      title: string,
      description?: string,
      props?: Omit<BaseToastProps, "title" | "description">
    ) => toast.success({ title, description, ...props }),
    loading: (
      title: string,
      description?: string,
      props?: Omit<BaseToastProps, "title" | "description">
    ) => toast.loading({ title, description, ...props }),
    error: (
      title: string,
      description?: string,
      props?: Omit<BaseToastProps, "title" | "description">
    ) => toast.error({ title, description, ...props }),
    info: (
      title: string,
      description?: string,
      props?: Omit<BaseToastProps, "title" | "description">
    ) => toast.info({ title, description, ...props }),
    warning: (
      title: string,
      description?: string,
      props?: Omit<BaseToastProps, "title" | "description">
    ) => toast.warning({ title, description, ...props }),
  },

  // Utility methods
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  dismissAll: () => sonnerToast.dismiss(),
  
  // Route management - clean API for controlling toast visibility
  setBlockedRoutes: (routes: string[]) => {
    blockedRoutes = routes;
  },
  
  addBlockedRoute: (route: string) => {
    if (!blockedRoutes.includes(route)) {
      blockedRoutes.push(route);
    }
  },
  
  removeBlockedRoute: (route: string) => {
    blockedRoutes = blockedRoutes.filter(r => r !== route);
  },
  
  clearBlockedRoutes: () => {
    blockedRoutes = [];
  },
  
  getBlockedRoutes: () => [...blockedRoutes],
});

// Provider component with both animation styles
export function ToastProvider({
  position = "top-right",
  duration = 4000,
  expand = true,
  visibleToasts = 4,
  offset = "30px",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  duration?: number;
  expand?: boolean;
  visibleToasts?: number;
  offset?: string;
}) {
  return (
    <>
      <Toaster
        position={position}
        expand={expand}
        richColors={false}
        visibleToasts={visibleToasts}
        offset={offset}
        closeButton={false}
        toastOptions={{
          unstyled: true,
          className: "toast-container !important",
          duration,
          style: { marginTop: "60px" },
        }}
      />
      {/* CSS-in-JS styles for both left and right animations */}
      <style jsx global>{`
        /* Left slide animations */
        .toast-slide-left {
          animation: slideInFromLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          transform-origin: left !important;
        }

        .toast-container[data-state="closed"] .toast-slide-left {
          animation: slideOutToLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%) !important;
            opacity: 0 !important;
          }
          to {
            transform: translateX(0) !important;
            opacity: 1 !important;
          }
        }

        @keyframes slideOutToLeft {
          from {
            transform: translateX(0) !important;
            opacity: 1 !important;
          }
          to {
            transform: translateX(-100%) !important;
            opacity: 0 !important;
          }
        }

        /* Right slide animations */
        .toast-slide-right {
          animation: slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          transform-origin: right !important;
        }

        .toast-container[data-state="closed"] .toast-slide-right {
          animation: slideOutToRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%) !important;
            opacity: 0 !important;
          }
          to {
            transform: translateX(0) !important;
            opacity: 1 !important;
          }
        }

        @keyframes slideOutToRight {
          from {
            transform: translateX(0) !important;
            opacity: 1 !important;
          }
          to {
            transform: translateX(100%) !important;
            opacity: 0 !important;
          }
        }

        .toast-container {
          margin-top: 60px !important;
          isolation: isolate !important;
        }

        /* Fixed hover effects - isolated per toast */
        .toast-item {
          will-change: transform !important;
          backface-visibility: hidden !important;
          transform: translateZ(0) !important;
        }

        .toast-item:hover {
          transform: translateZ(0) scale(1.02) !important;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Prevent animation interference during hover */
        .toast-item:hover.toast-slide-left,
        .toast-item:hover.toast-slide-right {
          animation-play-state: paused !important;
        }

        /* Loading spinner animation */
        @keyframes spin {
          to {
            transform: rotate(360deg) !important;
          }
        }
      `}</style>
    </>
  );
}

// Type definitions
export interface ToastProps {
  id: string | number;
  title: string | React.ReactNode;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info" | "loading";
  button?: {
    label: string;
    onClick: () => void;
  };
}

export type { BaseToastProps as ToastOptions };