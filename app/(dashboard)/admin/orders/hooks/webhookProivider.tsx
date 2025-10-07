"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { useOrdersWebhook } from './orderWebhooks';



interface OrdersWebhookContextType {
  isConnected: boolean;
  disconnect: () => void;
  reconnect: () => void;
}

const OrdersWebhookContext = createContext<OrdersWebhookContextType | undefined>(undefined);

interface OrdersWebhookProviderProps {
  children: ReactNode;
}

export function OrdersWebhookProvider({ children }: OrdersWebhookProviderProps) {
  const webhook = useOrdersWebhook();

  return (
    <OrdersWebhookContext.Provider value={webhook}>
      {children}
    </OrdersWebhookContext.Provider>
  );
}

export function useOrdersWebhookContext() {
  const context = useContext(OrdersWebhookContext);
  if (context === undefined) {
    throw new Error('useOrdersWebhookContext must be used within an OrdersWebhookProvider');
  }
  return context;
}

// Optional: Connection status indicator component
export function WebhookConnectionStatus() {
  const { isConnected } = useOrdersWebhookContext();

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Real-time inactive
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      Real-time active
    </div>
  );
}