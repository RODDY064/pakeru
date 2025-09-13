"use client";

import { useEffect, useRef, useState } from "react";
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

type OrderWebhookEvents = {
  new_order: any;
  order_updated: { orderId: string; updates: Partial<OrdersData> };
  order_cancelled: { orderId: string };
  order_refunded: { orderId: string };
};

export function useOrdersWebhook() {
  const socketRef = useRef<Socket | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    connected: false,
    lastEvent: null as string | null,
    eventCount: 0,
    errors: [] as string[],
  });

  // Get store methods
  const orders = useBoundStore((state) => state.orders);
  const setOrdersState = useBoundStore((state) => state.setOrdersState);

  useEffect(() => {
    console.log("🔧 Initializing WebSocket connection...");

    const socket = io(
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
        forceNew: true, // Force new connection
      }
    );

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ WebSocket connected, ID:", socket.id);
      setDebugInfo((prev) => ({ ...prev, connected: true }));

      // Join admin room
      socket.emit("join_admin_room");
      console.log("📨 Emitted join_admin_room");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setDebugInfo((prev) => ({ ...prev, connected: false }));

      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error);
      setDebugInfo((prev) => ({
        ...prev,
        errors: [...prev.errors, `Connection error: ${error.message}`],
      }));
    });

    // Admin room confirmation
    socket.on("admin_room_joined", () => {
      console.log("✅ Successfully joined admin room");
      toast({
        title: "Connected",
        description: "Real-time order updates enabled",
        variant: "default",
      });
    });

    // Debug: Listen for ANY event
    socket.onAny((eventName, ...args) => {
      console.log(`🔍 Received event: ${eventName}`, args);
      setDebugInfo((prev) => ({
        ...prev,
        lastEvent: eventName,
        eventCount: prev.eventCount + 1,
      }));
    });

    // Handle new orders with extensive debugging
    socket.on("new_order", (apiOrder: any) => {
      console.log("🆕 NEW ORDER EVENT RECEIVED!");
      console.log("Raw API Order:", JSON.stringify(apiOrder, null, 2));

      try {
        // Transform the order
        const newOrder = transformApiOrderToOrdersData(apiOrder);
        console.log("Transformed Order:", JSON.stringify(newOrder, null, 2));

        setTimeout(() => {
          useBoundStore.setState(
            produce((state: any) => {
              console.log("🔄 Updating state with produce...");

              const exists = state.orders.some(
                (o: any) => o._id === newOrder._id
              );
              if (!exists) {
                state.orders.unshift(newOrder);
              } else {
                console.log(
                  "⚠️ Order already exists, skipping insert:",
                  newOrder._id
                );
              }

              state.ordersStats = computeOrdersStats(state.orders);
              state.filteredOrders = filterOrders(
                state.orders,
                state.search,
                state.activeFilter
              );
            })
          );
        });

        useBoundStore.persist.rehydrate();

        // Get current state before update
        const currentState = useBoundStore.getState();
        console.log("Current orders count:", currentState.orders.length);

        // Verify update
        // setTimeout(() => {
        //   const afterState = useBoundStore.getState();
        //   console.log("📊 Post-update verification:");
        //   console.log("- Orders count:", afterState.orders.length);
        //   console.log("- Filtered count:", afterState.filteredOrders.length);
        //   console.log("- First order ID:", afterState.orders[0]?._id);
        // }, 100);

        // Show toast
        toast({
          title: (
            <div className="flex items-center gap-2 px-2">
              <Image
                src="/icons/orders-w.svg"
                width={20}
                height={20}
                alt="order"
              />
              <p className="text-white pt-[2px]">New Order been placed</p>
            </div>
          ),
          description: `Order ${newOrder.IDTrim} from ${newOrder.user.firstname} ${newOrder.user.lastname}`,
          variant: "success",
        });

        console.log("✅ New order processed successfully:", newOrder.IDTrim);
      } catch (error) {
        console.error("❌ Failed to process new order:", error);
        console.error(
          "Error stack:",
          error instanceof Error ? error.stack : "No stack"
        );

        toast({
          title: "Order Processing Error",
          description: `Failed to process order: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }
    });

    // Handle other events (simplified for debugging)
    socket.on("order_updated", ({ orderId, updates }) => {
      console.log("📝 Order updated:", orderId, updates);
      // ... existing update logic
    });

    socket.on("order_cancelled", ({ orderId }) => {
      console.log("❌ Order cancelled:", orderId);
      // ... existing cancel logic
    });

    socket.on("order_refunded", ({ orderId }) => {
      console.log("💰 Order refunded:", orderId);
      // ... existing refund logic
    });

    // Test connection after setup
    setTimeout(() => {
      if (socket.connected) {
        console.log("🧪 Testing connection - emitting test event");
        socket.emit("test_connection", { timestamp: Date.now() });
      } else {
        console.warn("⚠️ Socket not connected after setup");
      }
    }, 1000);

    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Debug component (you can render this temporarily)
  const DebugPanel = () => (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "black",
        color: "white",
        padding: 10,
        borderRadius: 5,
        fontSize: 12,
        zIndex: 9999,
        maxWidth: 300,
      }}
    >
      <div>Connected: {debugInfo.connected ? "✅" : "❌"}</div>
      <div>Events: {debugInfo.eventCount}</div>
      <div>Last: {debugInfo.lastEvent || "None"}</div>
      <div>Orders: {orders.length}</div>
      {debugInfo.errors.length > 0 && (
        <div>Errors: {debugInfo.errors.slice(-2).join(", ")}</div>
      )}
    </div>
  );

  return {
    isConnected: socketRef.current?.connected || false,
    disconnect: () => socketRef.current?.disconnect(),
    reconnect: () => socketRef.current?.connect(),
    debugInfo,
    DebugPanel, // Temporary debug component
  };
}
