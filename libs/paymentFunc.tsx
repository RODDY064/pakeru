"use client"

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CartItemType, CartStats } from "@/store/cart";
import { useApiClient } from "./useApiClient";
import { ApiError, AuthError } from "./api-client-instance";
import { useBoundStore } from "@/store/store";

export interface PaymentData {
  address: string;
  town: string;
  region: string;
  landmark?: string;
  phoneNumber: string;
}

interface PaymentResponse {
  paymentUrl?: {
    data?: {
      authorization_url: string;
    };
  };
  orderId?: string;
  reference?: string;
}

interface PaymentPayload {
  shippingAddress: {
    address: string;
    town: string;
    region: string;
    landmark: string;
    phoneNumber: string;
  };
  items: {
    numOfItems: number;
    products: Array<{
      productId: string;
      quantity: number;
      variantID: string | null;
      size?: string;
    }>;
  };
  totalPrice: number;
  discountCode: string;
}

export const usePaymentProcessing = () => {
  const router = useRouter();

  const { post, isAuthLoading } = useApiClient({
    onAuthError: () => {
      const currentPath = encodeURIComponent(window.location.pathname);
      router.push(`/sign-in?callbackUrl=${currentPath}`);
    },
  });

  const [processingPayment, setProcessingPayment] = useState(false);
  const { clearCart } = useBoundStore();

  const validatePaymentData = useCallback(
    (data: PaymentData, cartItems: CartItemType[], cartStats: CartStats | null) => {
      const errors: string[] = [];

      // Validate shipping address
      if (!data.address?.trim()) errors.push("Address is required");
      if (!data.town?.trim()) errors.push("Town is required");
      if (!data.region?.trim()) errors.push("Region is required");
      if (!data.phoneNumber?.trim()) errors.push("Phone number is required");

      // Validate cart
      if (!cartItems.length) errors.push("Cart is empty");
      if (!cartStats?.totalPrice || cartStats.totalPrice <= 0) {
        errors.push("Invalid cart total");
      }

      // Validate cart items
      const invalidItems = cartItems.filter((item) => !item._id || item.quantity <= 0);
      if (invalidItems.length) {
        errors.push("Cart contains invalid items");
      }

      return errors;
    },
    []
  );

  const createPaymentPayload = useCallback(
    (data: PaymentData, cartItems: CartItemType[], cartStats: CartStats | null): PaymentPayload => {
      const products = cartItems.map((item) => {
        const selectedVariant = item.variants?.find((v) => v._id === item.selectedColor);
        return {
          productId: item._id,
          quantity: item.quantity,
          variantID: selectedVariant?._id || null,
          size: item.selectedSize,
        };
      });

      return {
        shippingAddress: {
          address: data.address.trim(),
          town: data.town.trim(),
          region: data.region.trim(),
          landmark: data.landmark?.trim() || "",
          phoneNumber: data.phoneNumber.trim() || "",
        },
        items: {
          numOfItems: cartItems.length,
          products,
        },
        totalPrice: cartStats?.totalPrice || 0,
        discountCode: "",
      };
    },
    []
  );

  const processPayment = useCallback(
    async (
      formData: PaymentData,
      cartItems: CartItemType[],
      cartStats: CartStats | null,
      options?: {
        accessToken?: string;
      }
    ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
      if (processingPayment || isAuthLoading) {
        return {
          success: false,
          error: "Payment already in progress",
        };
      }

      // Validate input data
      const validationErrors = validatePaymentData(formData, cartItems, cartStats);
      if (validationErrors.length) {
        return {
          success: false,
          error: validationErrors.join(", "),
        };
      }

      setProcessingPayment(true);

      try {
        const paymentPayload = createPaymentPayload(formData, cartItems, cartStats);

        console.log("Processing payment:", {
          ...paymentPayload,
          totalPrice: paymentPayload.totalPrice,
          itemCount: paymentPayload.items.numOfItems,
        });

        const response = await post<PaymentResponse>("/orders", paymentPayload, { requiresAuth: true });

        const authUrl = response.paymentUrl?.data?.authorization_url;
        if (!authUrl) {
          throw new Error("Payment gateway error: Missing authorization URL");
        }

        // Store order reference for tracking
        const orderId = response.orderId || response.reference;
        if (orderId) {
          sessionStorage.setItem("pendingOrderId", orderId);
          clearCart();
        }

        console.log(authUrl, "auth url");

        // Navigate to authorization URL.
        // For external payment providers do a full page navigation so the browser can leave the app.
        try {
          const isAbsolute = /^https?:\/\//i.test(authUrl);
          if (isAbsolute) {
            window.location.assign(authUrl);
          } else {
            // internal route
            router.push(authUrl);
          }
        } catch (navErr) {
          // If router navigation fails, fall back to location assign
          window.location.assign(authUrl);
        }

        return {
          success: true,
          orderId,
        };
      } catch (error: any) {
        console.error("Payment processing failed:", error);

        // Handle specific error types
        if (error instanceof AuthError) {
          const currentPath = encodeURIComponent(window.location.pathname);
          router.push(`/sign-in?callbackUrl=${currentPath}`);
          return {
            success: false,
            error: "Please sign-in to continue with payment",
          };
        }

        if (error instanceof ApiError) {
          return {
            success: false,
            error: error.message || "Payment processing failed",
          };
        }

        return {
          success: false,
          error: "An unexpected error occurred during payment processing",
        };
      } finally {
        setProcessingPayment(false);
      }
    },
    [post, isAuthLoading, processingPayment, validatePaymentData, createPaymentPayload, router, clearCart]
  );

  const retryPayment = useCallback(
    async (
      formData: PaymentData,
      cartItems: CartItemType[],
      cartStats: CartStats | null,
      options?: {
        accessToken?: string;
        requiresAuth?: boolean;
        maxRetries?: number;
      }
    ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
      const maxRetries = options?.maxRetries ?? 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const result = await processPayment(formData, cartItems, cartStats, {
          accessToken: options?.accessToken,
        });

        if (result.success || attempt === maxRetries) {
          return result;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }

      return { success: false, error: "Payment failed after multiple attempts" };
    },
    [processPayment]
  );

  const clearPendingOrder = useCallback(() => {
    sessionStorage.removeItem("pendingOrderId");
  }, []);

  const getPendingOrderId = useCallback(() => {
    return sessionStorage.getItem("pendingOrderId");
  }, []);

  return {
    processPayment,
    retryPayment,
    isProcessing: processingPayment || isAuthLoading,
    clearPendingOrder,
    getPendingOrderId,
    validatePaymentData,
  };
};