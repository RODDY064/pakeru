import { type StateCreator } from "zustand";

import { apiCall } from "@/libs/functions";
import { toast } from "@/app/ui/toaster";
import { ProductData } from "../products";
import { Store } from "@/store/store";

export type OrdersData = {
  _id: string;
  IDTrim?: string;
  date: string;
  time: string;
  shippedAt?: string;
  deliveredAt?: string;
  user: {
    userID: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  total: number;
  paymentStatus: "completed" | "pending" | "cancelled";
  deliveryStatus: "delivered" | "pending" | "cancelled" | "shipped";
  fulfilledStatus: "unfulfilled" | "fulfilled";
  items: {
    numOfItems: number;
    products: Array<{
      _id: string;
      product: ProductData;
      variantID: string;
      size: string;
      quantity: number;
    }>;
  };
  discount: number;
  shipmentDays?: string;
};

export type OrdersStats = {
  totalOrders: number;
  ordersDelivered: number;
  orderShipped: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
};

export type DateFilter = {
  from?: string;
  to?: string;
};

export type OrdersStore = {
  // Separated order storage - clean architecture
  fulfilledOrders: OrdersData[];
  unfulfilledOrders: OrdersData[];

  // UI state
  orderInView: OrdersData | null;
  showOrderModal: boolean;

  // Filter state
  search: string;
  activeFilter: string;
  dateFilter: DateFilter;
  sortDate: "ascending" | "descending";

  // Loading states
  fulfilledState: "idle" | "loading" | "success" | "failed";
  unfulfilledState: "idle" | "loading" | "success" | "failed";
  singleOrderState: "idle" | "loading" | "success" | "failed";

  // Error states
  ordersError: {
    fulfilled: string;
    unfulfilled: string;
    single: string;
  };

  // Actions
  setOrderError: (
    type: keyof OrdersStore["ordersError"],
    error: string
  ) => void;
  setOrdersState: (
    type: "fulfilled" | "unfulfilled",
    state: "idle" | "loading" | "success" | "failed"
  ) => void;
  setSingleOrderState: (state: OrdersStore["singleOrderState"]) => void;

  // UI actions
  setOrderModal: (show?: boolean) => void;
  setOrderInView: (order: OrdersData | null) => void;

  // Filter actions
  setSearch: (search: string) => void;
  setActiveFilter: (filter: string) => void;
  setDateFilter: (filter: DateFilter) => void;
  toggleDateSorting: () => void;

  // Data actions
  loadOrders: (
    type: "fulfilled" | "unfulfilled",
    options?: { force?: boolean; limit?: number }
  ) => Promise<void>;
  loadOrder: (id: string) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<OrdersData>) => Promise<void>;
  refundOrder: (orderId: string) => Promise<void>;

  // Computed getters
  getFilteredOrders: (type: "fulfilled" | "unfulfilled") => OrdersData[];
  getOrdersStats: (type: "fulfilled" | "unfulfilled") => OrdersStats;

  // Utility
  resetErrors: () => void;
};

// Clean stats computation
export function computeOrdersStats(orders: OrdersData[]): OrdersStats {
  if (!orders.length) {
    return {
      totalOrders: 0,
      ordersDelivered: 0,
      orderShipped: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    };
  }

  const stats = orders.reduce(
    (acc, order) => {
      switch (order.deliveryStatus) {
        case "delivered":
          acc.ordersDelivered++;
          break;
        case "shipped":
          acc.orderShipped++;
          break;
        case "pending":
          acc.pendingOrders++;
          break;
        case "cancelled":
          acc.cancelledOrders++;
          break;
      }

      if (order.paymentStatus === "completed") {
        acc.totalRevenue += order.total;
      }

      return acc;
    },
    {
      totalOrders: orders.length,
      ordersDelivered: 0,
      orderShipped: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    }
  );

  const completedOrders = orders.filter((o) => o.paymentStatus === "completed");
  stats.averageOrderValue =
    completedOrders.length > 0
      ? stats.totalRevenue / completedOrders.length
      : 0;

  return stats;
}

// Efficient filtering with date support
export function filterOrders(
  orders: OrdersData[],
  search: string,
  activeFilter: string,
  dateFilter: DateFilter
): OrdersData[] {
  return orders.filter((order) => {
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const customerName =
        `${order.user.firstname} ${order.user.lastname}`.toLowerCase();
      const searchMatch =
        customerName.includes(searchLower) ||
        order._id.toLowerCase().includes(searchLower) ||
        order.IDTrim?.toLowerCase().includes(searchLower) ||
        order.paymentStatus.toLowerCase().includes(searchLower) ||
        order.deliveryStatus.toLowerCase().includes(searchLower);

      if (!searchMatch) return false;
    }

    // Status filter
    if (activeFilter !== "All") {
      const filterLower = activeFilter.toLowerCase();
      const statusMatch =
        order.paymentStatus.toLowerCase() === filterLower ||
        order.deliveryStatus.toLowerCase() === filterLower ||
        order.fulfilledStatus.toLowerCase() === filterLower;

      if (!statusMatch) return false;
    }

    // Date filter
    if (dateFilter.from || dateFilter.to) {
      const orderDate = new Date(order.date);

      if (dateFilter.from && orderDate < new Date(dateFilter.from)) {
        return false;
      }

      if (dateFilter.to && orderDate > new Date(dateFilter.to)) {
        return false;
      }
    }

    return true;
  });
}

// Clean sorting utility
export function sortOrdersByDate(
  orders: OrdersData[],
  sortDirection: "ascending" | "descending"
): OrdersData[] {
  return [...orders].sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
    const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();

    return sortDirection === "ascending"
      ? dateTimeA - dateTimeB
      : dateTimeB - dateTimeA;
  });
}

// Transform utilities (unchanged for brevity)
const generateTrimmedId = (fullId: string): string => {
  const trimmed = fullId.substring(4, 8).toUpperCase();
  return `ORD-${trimmed}`;
};

export const transformApiOrderToOrdersData = (apiOrder: any): OrdersData => {
  const createdDate = new Date(apiOrder.createdAt);
  const date = createdDate.toISOString().split("T")[0];
  const time = createdDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const shipmentDeadline = new Date(createdDate);
  shipmentDeadline.setDate(createdDate.getDate() + 7);
  const today = new Date();
  const msDiff = shipmentDeadline.getTime() - today.getTime();
  const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

  return {
    _id: apiOrder._id,
    IDTrim: generateTrimmedId(apiOrder._id),
    date,
    time,
    user: {
      userID: apiOrder.user.userID,
      firstname: apiOrder.user.firstname,
      lastname: apiOrder.user.lastname,
      email: apiOrder.user.email,
    },
    total: apiOrder.totalPrice,
    deliveryStatus: apiOrder.deliveryStatus,
    paymentStatus: apiOrder.paymentStatus,
    fulfilledStatus: apiOrder.fulfilledStatus,
    items: {
      numOfItems: apiOrder.items.numOfItems,
      products: apiOrder.items.products,
    },
    discount: apiOrder.discount,
    shipmentDays: daysLeft > 0 ? `${daysLeft} day(s) left` : "ready to ship",
  };
};

export const transformApiOrdersToOrdersData = (
  apiOrders: any
): OrdersData[] => {
  return apiOrders.map(transformApiOrderToOrdersData);
};

// Clean API service
const apiService = {
  async fetchOrders(
    type: "fulfilled" | "unfulfilled",
    limit?: number
  ): Promise<OrdersData[]> {
    try {
      const query = new URLSearchParams();
      query.append("fulfilledStatus", type);
      if (limit) query.append("limit", limit.toString());

      const response = await apiCall(`/orders?${query.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });

      const orders = response.orders || response.data || response;
      if (!Array.isArray(orders)) {
        throw new Error("Expected orders array from API");
      }

      return transformApiOrdersToOrdersData(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  },

  async fetchOrder(id: string): Promise<OrdersData> {
    try {
      const data = await apiCall(`/orders/${id}`);
      return transformApiOrderToOrdersData(data.order || data);
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

  async updateOrderStatus(
    orderId: string,
    updates: Partial<OrdersData>
  ): Promise<OrdersData> {
    try {
      if (!orderId) throw new Error("Order ID not provided");

      const response = await apiCall(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      return transformApiOrderToOrdersData(response.order || response);
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error;
    }
  },

  async refundOrder(orderId: string): Promise<void> {
    try {
      await apiCall(`/orders/${orderId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to refund order:", error);
      throw error;
    }
  },
};

export const useOrdersStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  OrdersStore
> = (set, get) => ({
  // Separated order storage
  fulfilledOrders: [],
  unfulfilledOrders: [],

  // UI state
  orderInView: null,
  showOrderModal: false,

  // Filter state
  search: "",
  activeFilter: "All",
  dateFilter: {},
  sortDate: "descending",

  // Loading states
  fulfilledState: "idle",
  unfulfilledState: "idle",
  singleOrderState: "idle",

  // Error states
  ordersError: {
    fulfilled: "",
    unfulfilled: "",
    single: "",
  },

  // Error management
  setOrderError: (type, error) => {
    set((state) => {
      state.ordersError[type] = error;
    });
  },

  setOrdersState: (type, newState) => {
    set((state) => {
      if (type === "fulfilled") {
        state.fulfilledState = newState;
        if (newState === "loading") state.ordersError.fulfilled = "";
      } else {
        state.unfulfilledState = newState;
        if (newState === "loading") state.ordersError.unfulfilled = "";
      }
    });
  },

  setSingleOrderState: (newState) => {
    set((state) => {
      state.singleOrderState = newState;
      if (newState === "loading") state.ordersError.single = "";
    });
  },

  resetErrors: () => {
    set((state) => {
      state.ordersError = { fulfilled: "", unfulfilled: "", single: "" };
    });
  },

  // UI actions
  setOrderModal: (show) => {
    set((state) => {
      state.showOrderModal = show !== undefined ? show : !state.showOrderModal;
    });
  },

  setOrderInView: (order) => {
    set((state) => {
      state.orderInView = order;
    });
  },

  // Filter actions
  setSearch: (search) => {
    set((state) => {
      state.search = search;
    });
  },

  setActiveFilter: (filter) => {
    set((state) => {
      state.activeFilter = filter;
    });
  },

  setDateFilter: (filter) => {
    set((state) => {
      state.dateFilter = filter;
    });
  },

  toggleDateSorting: () => {
    set((state) => {
      state.sortDate =
        state.sortDate === "ascending" ? "descending" : "ascending";
    });
  },

  // Data actions
  loadOrders: async (type, options = {}) => {
    const { setOrdersState, setOrderError } = get();
    const { force = false, limit = 250 } = options;

    // Skip if already loaded and not forcing refresh
    const currentOrders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;
    const currentState =
      type === "fulfilled" ? get().fulfilledState : get().unfulfilledState;

    if (!force && currentState === "success" && currentOrders.length > 0) {
      return;
    }

    setOrdersState(type, "loading");

    try {
      const ordersData = await apiService.fetchOrders(type, limit);

      set((state) => {
        if (type === "fulfilled") {
          state.fulfilledOrders = ordersData;
        } else {
          state.unfulfilledOrders = ordersData;
        }
      });

      setOrdersState(type, "success");
    } catch (error) {
      setOrdersState(type, "failed");
      setOrderError(
        type,
        error instanceof Error ? error.message : `Failed to load ${type} orders`
      );
    }
  },

  loadOrder: async (id) => {
    const { setSingleOrderState, setOrderError } = get();

    // Check existing orders first
    const allOrders = [...get().fulfilledOrders, ...get().unfulfilledOrders];
    const existingOrder = allOrders.find((o) => o._id === id);

    if (existingOrder) {
      set((state) => {
        state.orderInView = existingOrder;
      });
      return;
    }

    setSingleOrderState("loading");

    try {
      const orderData = await apiService.fetchOrder(id);
      set((state) => {
        state.orderInView = orderData;
      });
      setSingleOrderState("success");
    } catch (error) {
      setSingleOrderState("failed");
      setOrderError(
        "single",
        error instanceof Error ? error.message : `Failed to load order ${id}`
      );
    }
  },

  updateOrder: async (orderId, updates) => {
    const updatePromise = (async () => {
      const { setSingleOrderState, setOrderError } = get();

      setSingleOrderState("loading");

      try {
        const updatedOrder = await apiService.updateOrderStatus(
          orderId,
          updates
        );

        set((state) => {
          // Helper to update order in array
          const updateOrderInArray = (orders: OrdersData[]) => {
            const index = orders.findIndex((o) => o._id === orderId);
            if (index !== -1) {
              orders[index] = updatedOrder;
            }
          };

          // updateOrderInArray(state.fulfilledOrders);
          updateOrderInArray(state.unfulfilledOrders);

          // Update view if same order
          if (state.orderInView?._id === orderId) {
            state.orderInView = updatedOrder;
          }

          // Handle status change - move between fulfilled/unfulfilled
          if (updates.fulfilledStatus) {
            const sourceArray =
              updates.fulfilledStatus === "fulfilled"
                ? state.unfulfilledOrders
                : state.fulfilledOrders;
            const targetArray =
              updates.fulfilledStatus === "fulfilled"
                ? state.fulfilledOrders
                : state.unfulfilledOrders;

            const orderIndex = sourceArray.findIndex((o) => o._id === orderId);
            if (orderIndex !== -1) {
              const [order] = sourceArray.splice(orderIndex, 1);
              targetArray.push({ ...order, ...updates });
            }
          }
        });

        setSingleOrderState("success");
      } catch (error) {
        setSingleOrderState("failed");
        setOrderError(
          "single",
          error instanceof Error ? error.message : "Failed to update order"
        );
      }
    })();
    // Show promise toast for update fulfilledStatus
    toast.promise(updatePromise, {
      loading: "Marking order as fulfilled...",
      success: () => {
        const order = [
          ...get().fulfilledOrders,
          ...get().unfulfilledOrders,
        ].find((o) => o._id === orderId);
        return {
          title: `Order ${
            order?.IDTrim || orderId
          } marked as fulfilled successfully`,
        };
      },
      error: "Failed to mark order as fulfilled. Please try again.",
      position:"top-left"
      
    });

    return updatePromise;
  },

  refundOrder: async (orderId) => {
    // promise toast for refund operation
    const refundPromise = (async () => {
      try {
        await apiService.refundOrder(orderId);

        set((state) => {
          // Remove from both arrays
          state.fulfilledOrders = state.fulfilledOrders.filter(
            (o) => o._id !== orderId
          );
          state.unfulfilledOrders = state.unfulfilledOrders.filter(
            (o) => o._id !== orderId
          );

          // Clear view if same order
          if (state.orderInView?._id === orderId) {
            state.orderInView = null;
          }
        });

        return;
      } catch (error) {
        console.error("Failed to refund order:", error);
        throw error;
      }
    })();

    // Show promise toast for refund
    toast.promise(refundPromise, {
      loading: "Processing refund...",
      success: () => {
        const order = [
          ...get().fulfilledOrders,
          ...get().unfulfilledOrders,
        ].find((o) => o._id === orderId);
        return {
          title: `Order ${order?.IDTrim || orderId} refunded successfully`,
        };
      },
      error: "Failed to process refund. Please try again.",
    });

    return refundPromise;
  },

  // Computed getters
  getFilteredOrders: (type) => {
    const { search, activeFilter, dateFilter, sortDate } = get();
    const orders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;

    const filtered = filterOrders(orders, search, activeFilter, dateFilter);
    return sortOrdersByDate(filtered, sortDate);
  },

  getOrdersStats: (type) => {
    const orders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;
    return computeOrdersStats(orders);
  },
});
