"use client";

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

  const { post, isAuthLoading } = useApiClient();

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
      options?: { accessToken?: string }
    ): Promise<{
      error: string; success: boolean 
}> => {
      if (processingPayment || isAuthLoading) {
        throw new Error("Payment already in progress");
      }

      // Validate input data
      const validationErrors = validatePaymentData(formData, cartItems, cartStats);
      if (validationErrors.length) {
        throw new Error(validationErrors.join(", "));
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

        clearCart();

        console.log(authUrl, "auth url");

        // Redirect safely
        try {
          const isAbsolute = /^https?:\/\//i.test(authUrl);
          if (isAbsolute) {
            window.location.assign(authUrl);
          } else {
            router.push(authUrl);
          }
        } catch {
          window.location.assign(authUrl);
        }

        return { success: true, error:"" };
      } catch (error: any) {
        console.error("Payment processing failed:", error);

        if (error instanceof AuthError) {
          const currentPath = encodeURIComponent(window.location.pathname);
          router.push(`/sign-in?callbackUrl=${currentPath}`);
          throw new Error("Please sign in to continue with payment");
        }

        if (error instanceof ApiError) {
          throw new Error(error.message || "Payment processing failed");
        }

        throw new Error(error.message || "An unexpected error occurred during payment processing");
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
    ): Promise<{ success: boolean }> => {
      const maxRetries = options?.maxRetries ?? 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await processPayment(formData, cartItems, cartStats, {
            accessToken: options?.accessToken,
          });
        } catch (error) {
          if (attempt === maxRetries) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }

      throw new Error("Payment failed after multiple attempts");
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
