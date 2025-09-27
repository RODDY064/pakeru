"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "@/app/ui/toaster";
import { useBoundStore } from "@/store/store";
import {
  OrdersData,
  transformApiOrderToOrdersData,
  computeOrdersStats,
  filterOrders,
} from "@/store/dashbaord/orders-store/orders";
import { produce } from "immer";
import Image from "next/image";

interface OrderEvents {
  new_order: any;
  order_updated: { orderId: string; updates: Partial<OrdersData> };
  order_cancelled: { orderId: string };
  order_refunded: { orderId: string };
}

interface ConnectionState {
  isConnected: boolean;
  hasJoinedRoom: boolean;
}

export function useOrdersWebhook() {
  const socketRef = useRef<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    hasJoinedRoom: false,
  });

  // Store methods
  const updateOrdersState = useCallback(() => {
    const state = useBoundStore.getState();
    useBoundStore.setState(
      produce((draft: any) => {
        draft.ordersStats = computeOrdersStats(draft.unfulfilledOrders);
        draft.filteredOrders = filterOrders(
          draft.unfulfilledOrders,
          draft.OrderFilters
        );
      })
    );
  }, []);

  // Event handlers
  const handleConnection = useCallback(() => {
    console.log("WebSocket connected");
    const socket = socketRef.current;
    if (!socket) return;

    setConnectionState(prev => ({ ...prev, isConnected: true }));
    socket.emit("join_admin_room");
  }, []);

  const handleDisconnection = useCallback((reason: string) => {
    console.log("WebSocket disconnected, reason:", reason);
    setConnectionState({ isConnected: false, hasJoinedRoom: false });

    // Auto-reconnect only for server-initiated disconnections
    if (reason === "io server disconnect") {
      socketRef.current?.connect();
    }
  }, []);

  const handleAdminRoomJoined = useCallback(() => {
    setConnectionState(prev => ({ ...prev, hasJoinedRoom: true }));

    toast({
      title: "Connected",
      description: "Real-time order updates enabled",
      variant: "default",
    });
  }, []);

  const handleNewOrder = useCallback(
    (apiOrder: any) => {
      try {
        const newOrder = transformApiOrderToOrdersData(apiOrder);

        // Update store atomically
        useBoundStore.setState(
          produce((draft: any) => {
            // Prevent duplicates
            const exists = draft.unfulfilledOrders.some(
              (order: OrdersData) => order._id === newOrder._id
            );

            if (!exists) {
              draft.unfulfilledOrders.unshift(newOrder);
            }
          })
        );

        // Update computed state
        updateOrdersState();

        // Show user notification
        toast({
          title: (
            <div className="flex items-center gap-2 px-2">
              <Image
                src="/icons/orders-w.svg"
                width={20}
                height={20}
                alt="New order"
              />
              <span className="text-white pt-[2px]">New order placed</span>
            </div>
          ),
          description: `Order ${newOrder.IDTrim} from ${newOrder.user.firstname} ${newOrder.user.lastname}`,
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to process new order:", error);

        toast({
          title: "Order Update Failed",
          description: "Unable to display new order. Please refresh.",
          variant: "error",
        });
      }
    },
    [updateOrdersState]
  );

  const handleOrderUpdate = useCallback(
    ({ orderId, updates }: OrderEvents["order_updated"]) => {
      useBoundStore.setState(
        produce((draft: any) => {
          const orderIndex = draft.unfulfilledOrders.findIndex(
            (order: OrdersData) => order._id === orderId
          );

          if (orderIndex !== -1) {
            Object.assign(draft.unfulfilledOrders[orderIndex], updates);
          }
        })
      );

      updateOrdersState();
    },
    [updateOrdersState]
  );

  const handleOrderCancellation = useCallback(
    ({ orderId }: OrderEvents["order_cancelled"]) => {
      useBoundStore.setState(
        produce((draft: any) => {
          draft.unfulfilledOrders = draft.unfulfilledOrders.filter(
            (order: OrdersData) => order._id !== orderId
          );
        })
      );

      updateOrdersState();

      toast({
        title: "Order Cancelled",
        description: "An order has been cancelled",
        variant: "default",
      });
    },
    [updateOrdersState]
  );

  const handleOrderRefund = useCallback(
    ({ orderId }: OrderEvents["order_refunded"]) => {
      useBoundStore.setState(
        produce((draft: any) => {
          const order = draft.unfulfilledOrders.find(
            (order: OrdersData) => order._id === orderId
          );

          if (order) {
            order.status = "refunded";
          }
        })
      );

      updateOrdersState();

      toast({
        title: "Order Refunded",
        description: "A refund has been processed",
        variant: "default",
      });
    },
    [updateOrdersState]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const socket = io(baseUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection lifecycle
    socket.on("connect", handleConnection);
    socket.on("disconnect", handleDisconnection);
    socket.on("connect_error", (error) => {
      console.error("WebSocket connection failed:", error.message);
    });

    // Admin room
    socket.on("admin_room_joined", handleAdminRoomJoined);

    // Order events
    socket.on("new_order", handleNewOrder);
    socket.on("order_updated", handleOrderUpdate);
    socket.on("order_cancelled", handleOrderCancellation);
    socket.on("order_refunded", handleOrderRefund);

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnectionState({ isConnected: false, hasJoinedRoom: false });
    };
  }, [
    handleConnection,
    handleDisconnection,
    handleAdminRoomJoined,
    handleNewOrder,
    handleOrderUpdate,
    handleOrderCancellation,
    handleOrderRefund,
  ]);

  // Public API
  return {
    isConnected: connectionState.isConnected,
    hasJoinedRoom: connectionState.hasJoinedRoom,
    disconnect: () => socketRef.current?.disconnect(),
    reconnect: () => socketRef.current?.connect(),
  };
}