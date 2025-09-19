import { type StateCreator } from "zustand";
import { apiCall } from "@/libs/functions";
import { toast } from "@/app/ui/toaster";
import { ProductData } from "../products";
import { Store } from "@/store/store";
import { useApiClient } from "@/libs/useApiClient";

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
  fulfilledOrders: OrdersData[];
  unfulfilledOrders: OrdersData[];
  orderInView: OrdersData | null;
  showOrderModal: boolean;
  search: string;
  activeFilter: string;
  dateFilter: DateFilter;
  sortDate: "ascending" | "descending";
  fulfilledState: "idle" | "loading" | "success" | "failed";
  unfulfilledState: "idle" | "loading" | "success" | "failed";
  singleOrderState: "idle" | "loading" | "success" | "failed";
  ordersError: {
    fulfilled: string;
    unfulfilled: string;
    single: string;
  };
  setOrderError: (
    type: keyof OrdersStore["ordersError"],
    error: string
  ) => void;
  setOrdersState: (
    type: "fulfilled" | "unfulfilled",
    state: "idle" | "loading" | "success" | "failed"
  ) => void;
  setSingleOrderState: (state: OrdersStore["singleOrderState"]) => void;
  setOrderModal: (show?: boolean) => void;
  setOrderInView: (order: OrdersData | null) => void;
  setSearch: (search: string) => void;
  setActiveFilter: (filter: string) => void;
  setDateFilter: (filter: DateFilter) => void;
  toggleDateSorting: () => void;
  loadOrders: (
    type: "fulfilled" | "unfulfilled",
    options?: {
      force?: boolean;
      limit?: number;
      get?: ReturnType<typeof useApiClient>["get"];
    }
  ) => Promise<void>;
  loadOrder: (
    id: string,
    options?: { get?: ReturnType<typeof useApiClient>["get"] }
  ) => Promise<void>;
  updateOrder: (
    orderId: string,
    updates: Partial<OrdersData>,
    options?: { patch?: ReturnType<typeof useApiClient>["patch"] }
  ) => Promise<void>;
  refundOrder: (orderId: string) => Promise<void>;
  getFilteredOrders: (type: "fulfilled" | "unfulfilled") => OrdersData[];
  getOrdersStats: (type: "fulfilled" | "unfulfilled") => OrdersStats;
  resetErrors: () => void;
};

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

export function filterOrders(
  orders: OrdersData[],
  search: string,
  activeFilter: string,
  dateFilter: DateFilter
): OrdersData[] {
  return orders.filter((order) => {
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

    if (activeFilter !== "All") {
      const filterLower = activeFilter.toLowerCase();
      const statusMatch =
        order.paymentStatus.toLowerCase() === filterLower ||
        order.deliveryStatus.toLowerCase() === filterLower ||
        order.fulfilledStatus.toLowerCase() === filterLower;

      if (!statusMatch) return false;
    }

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

const generateTrimmedId = (fullId: string): string => {
  const trimmed = fullId.substring(4, 8).toUpperCase();
  return `ORD-${trimmed}`;
};

export const transformApiOrderToOrdersData = (apiOrder: any): OrdersData => {
  const createdDate = new Date(apiOrder.createdAt);
  const date = createdDate?.toISOString().split("T")[0];
  const time = createdDate?.toLocaleTimeString("en-US", {
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

const apiService = {
  async fetchOrders(
    type: "fulfilled" | "unfulfilled",
    get: ReturnType<typeof useApiClient>["get"],
    limit?: number,
    token?: string
  ): Promise<OrdersData[]> {
    try {
      const query = new URLSearchParams();
      query.append("fulfilledStatus", type);
      if (limit) query.append("limit", limit.toString());

      const response = await get<{ data:OrdersData[]}>(`/orders?${query.toString()}`, {
        requiresAuth: true,
      });

      console.log(response, "order response");

      const orders = response.data;
      if (!Array.isArray(orders)) {
        throw new Error("Expected orders array from API");
      }

      return transformApiOrdersToOrdersData(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  },

  async fetchOrder(
    id: string,
    get: ReturnType<typeof useApiClient>["get"]
  ): Promise<OrdersData> {
    try {
      const data = await get<{ data:OrdersData }>(`/orders/${id}`, {
        requiresAuth: true,
      });
      return transformApiOrderToOrdersData(data);
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

  async updateOrderStatus(
    orderId: string,
    patch: ReturnType<typeof useApiClient>["patch"],
    updates: Partial<OrdersData>
  ): Promise<OrdersData> {
    try {
      if (!orderId) throw new Error("Order ID not provided");

      const response = await patch<OrdersData[]>(
        `/orders/${orderId}`,
        updates,
        {
          requiresAuth: true,
        }
      );

      return transformApiOrderToOrdersData(response);
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
  fulfilledOrders: [],
  unfulfilledOrders: [],
  orderInView: null,
  showOrderModal: false,
  search: "",
  activeFilter: "All",
  dateFilter: {},
  sortDate: "descending",
  fulfilledState: "idle",
  unfulfilledState: "idle",
  singleOrderState: "idle",
  ordersError: {
    fulfilled: "",
    unfulfilled: "",
    single: "",
  },
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
  loadOrders: async (type, options = {}) => {
    const { setOrdersState, setOrderError } = get();
    const { force = false, limit = 250, get: apiGet } = options;

    if (!apiGet) {
      throw new Error("API get function is required");
    }

    const currentOrders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;
    const currentState =
      type === "fulfilled" ? get().fulfilledState : get().unfulfilledState;

    if (!force && currentState === "success" && currentOrders.length > 0) {
      return;
    }

    setOrdersState(type, "loading");

    try {
      const ordersData = await apiService.fetchOrders(type, apiGet, limit);

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
  loadOrder: async (id, options = {}) => {
    const { setSingleOrderState, setOrderError } = get();

    const { get: apiGet } = options;

    if (!apiGet) {
      throw new Error("API get function is required");
    }

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
      const orderData = await apiService.fetchOrder(id, apiGet);
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
  updateOrder: async (orderId, updates, options = {}) => {
    const updatePromise = (async () => {
      const { setSingleOrderState, setOrderError } = get();
      const { patch: apiPatch } = options;

      if (!apiPatch) {
        throw new Error("API patch function is required");
      }

      setSingleOrderState("loading");

      try {
        const updatedOrder = await apiService.updateOrderStatus(
          orderId,
          apiPatch,
          updates
        );

        set((state) => {
          const updateOrderInArray = (orders: OrdersData[]) => {
            const index = orders.findIndex((o) => o._id === orderId);
            if (index !== -1) {
              orders[index] = updatedOrder;
            }
          };

          updateOrderInArray(state.unfulfilledOrders);

          if (state.orderInView?._id === orderId) {
            state.orderInView = updatedOrder;
          }

          if (updates.fulfilledStatus) {
            const sourceArray = updates.fulfilledStatus === "fulfilled"  ? state.unfulfilledOrders : state.fulfilledOrders;
            const targetArray = updates.fulfilledStatus === "fulfilled" ? state.fulfilledOrders : state.unfulfilledOrders;

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
      position: "top-left",
    });

    return updatePromise;
  },
  refundOrder: async (orderId) => {
    const refundPromise = (async () => {
      try {
        await apiService.refundOrder(orderId);

        set((state) => {
          state.fulfilledOrders = state.fulfilledOrders.filter(
            (o) => o._id !== orderId
          );
          state.unfulfilledOrders = state.unfulfilledOrders.filter(
            (o) => o._id !== orderId
          );

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
