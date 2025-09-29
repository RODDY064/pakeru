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
  deliveredAt: string;
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
  shippingAddress: {
    address: string;
    landmark?: string;
    region: string;
    town: string;
  };
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

export type DeliveryStatusFilter =
  | "All"
  | "Pending"
  | "Delivered"
  | "Shipped"
  | "Cancelled";

export type PaymentStatusFilter = "All" | "Completed" | "Pending" | "Cancelled";

export type OrderFiltersTypes = {
  search: string;
  deliveryStatus: DeliveryStatusFilter;
  type: "fulfilled" | "unfulfilled" | null;
  paymentStatus: PaymentStatusFilter;
  dateFilter: DateFilter;
  sortDate: "ascending" | "descending";
};

export type OrdersStore = {
  fulfilledOrders: OrdersData[];
  unfulfilledOrders: OrdersData[];
  fulfilledFilteredOrders: OrdersData[];
  unfulfilledFilteredOrders: OrdersData[];
  userOrders: OrdersData[];
  orderInView: OrdersData | null;
  showOrderModal: boolean;
  orderTotalSize: number;

  OrderFilters: OrderFiltersTypes;

  // search: string;
  // activeFilter: string;
  // dateFilter: DateFilter;

  fulfilledState: "idle" | "loading" | "success" | "failed";
  unfulfilledState: "idle" | "loading" | "success" | "failed";
  singleOrderState: "idle" | "loading" | "success" | "failed";
  userOrdersState: "idle" | "loading" | "success" | "failed";
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

  setDeliveryStatusFilter: (status: DeliveryStatusFilter) => void;
  setPaymentStatusFilter: (status: PaymentStatusFilter) => void;
  setOrderSearch: (search: string) => void;
  setOrderTypeFilter: (type: "fulfilled" | "unfulfilled" | null) => void;
  applyOrderFilters: () => void;

  setDateFilter: (filter: DateFilter) => void;
  toggleDateSorting: () => void;
  resetOrdersFilters: () => void;

  loadOrders: (
    type: "fulfilled" | "unfulfilled",
    options?: {
      force?: boolean;
      limit?: number;
      get?: ReturnType<typeof useApiClient>["get"];
      page?: number;
    }
  ) => Promise<void>;
  loadOrder: (
    id: string,
    options?: { get?: ReturnType<typeof useApiClient>["get"] }
  ) => Promise<void>;
  loadUserOrders: (options?: {
    force?: boolean;
    limit?: number;
    get?: ReturnType<typeof useApiClient>["get"];
  }) => Promise<void>;
  updateOrder: (
    orderId: string,
    updates: Partial<OrdersData>,
    options?: {
      patch?: ReturnType<typeof useApiClient>["patch"];
      get?: ReturnType<typeof useApiClient>["get"];
    }
  ) => Promise<OrdersData>;
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
  filters: OrderFiltersTypes
): OrdersData[] {
  return orders.filter((order) => {
    // Search filter (by ID, customer name, or email)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      const customerName =
        `${order.user.firstname} ${order.user.lastname}`.toLowerCase();
      const customerEmail = order.user.email.toLowerCase();

      const searchMatch =
        customerName.includes(searchLower) ||
        customerEmail.includes(searchLower) ||
        order._id.toLowerCase().includes(searchLower) ||
        order.IDTrim?.toLowerCase().includes(searchLower);

      if (!searchMatch) return false;
    }

    // Delivery status filter
    if (filters.deliveryStatus !== "All") {
      const statusMap: Record<DeliveryStatusFilter, string> = {
        All: "all",
        Pending: "pending",
        Delivered: "delivered",
        Shipped: "shipped",
        Cancelled: "cancelled",
      };

      if (order.deliveryStatus !== statusMap[filters.deliveryStatus]) {
        return false;
      }
    }

    // Payment status filter
    if (filters.paymentStatus !== "All") {
      const statusMap: Record<PaymentStatusFilter, string> = {
        All: "",
        Completed: "completed",
        Pending: "pending",
        Cancelled: "cancelled",
      };

      if (order.paymentStatus !== statusMap[filters.paymentStatus]) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFilter.from || filters.dateFilter.to) {
      const orderDate = new Date(order.date);

      if (
        filters.dateFilter.from &&
        orderDate < new Date(filters.dateFilter.from)
      ) {
        return false;
      }

      if (
        filters.dateFilter.to &&
        orderDate > new Date(filters.dateFilter.to)
      ) {
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
  const trimmed = fullId?.substring(4, 8).toUpperCase();
  return `ORD-${trimmed}`;
};

export const transformApiOrderToOrdersData = (apiOrder: any): OrdersData => {
  const createdAt = apiOrder?.createdAt ? new Date(apiOrder?.createdAt) : null;
  const deliveredAt = apiOrder.deliveryDate
    ? new Date(apiOrder.deliveryDate)
    : null;
  const isDeleiveredDateValid = deliveredAt && !isNaN(deliveredAt.getTime());
  const isCreatedAtValid = createdAt && !isNaN(createdAt.getTime());

  const date = isCreatedAtValid ? createdAt.toISOString().split("T")[0] : "";
  const time = isCreatedAtValid
    ? createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  let shipmentDeadline: Date | null = null;
  let daysLeft: number = 0;

  if (isDeleiveredDateValid && deliveredAt) {
    shipmentDeadline = new Date(deliveredAt);
    shipmentDeadline.setDate(deliveredAt.getDate());
    const today = new Date();
    const msDiff = shipmentDeadline.getTime() - today.getTime();
    daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
  }

  return {
    _id: apiOrder._id,
    IDTrim: apiOrder.orderId || generateTrimmedId(apiOrder._id),
    date,
    time,
    user: {
      userID: apiOrder.user?.userID || "",
      firstname: apiOrder.user?.firstname || "",
      lastname: apiOrder.user?.lastname || "",
      email: apiOrder.user?.email || "",
    },
    total: apiOrder.totalPrice || 0,
    deliveryStatus: apiOrder.deliveryStatus || "",
    deliveredAt: apiOrder.deliveryDate || "",
    paymentStatus: apiOrder.paymentStatus || "",
    fulfilledStatus: apiOrder.fulfilledStatus || "",
    shippingAddress: apiOrder.shippingAddress || null,
    items: {
      numOfItems: apiOrder.items?.numOfItems || 0,
      products: apiOrder.items?.products || [],
    },
    discount: apiOrder.discount || 0,
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
    page?: number
  ): Promise<{ total: number; orders: OrdersData[] }> {
    try {
      const query = new URLSearchParams();
      query.append("fulfilledStatus", type);
      if (limit) query.append("limit", limit.toString());
      if (page) query.append("page", page.toString());

      const response = await get<{ data: OrdersData[]; total: number }>(
        `/orders?${query.toString()}`,
        {
          requiresAuth: true,
        }
      );

      // console.log(response, "order response");

      const orders = response.data;
      if (!Array.isArray(orders)) {
        throw new Error("Expected orders array from API");
      }

      return {
        total: response.total,
        orders: transformApiOrdersToOrdersData(orders),
      };
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
      const data = await get<{ data: OrdersData }>(`/orders/id/${id}`, {
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

      console.log(updates, "updates");

      const response = await patch<{ data:OrdersData }>(
        `/orders/id/${orderId}`,
        updates,
        { requiresAuth: true }
      );

      console.log(response.data)

      return transformApiOrderToOrdersData(response.data);
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error;
    }
  },

  async refundOrder(orderId: string): Promise<void> {
    try {
      await apiCall(`/orders/id/${orderId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to refund order:", error);
      throw error;
    }
  },

  async fetchUserOrders(
    get: ReturnType<typeof useApiClient>["get"]
  ): Promise<OrdersData[]> {
    try {
      const myOrder = "myOrder";
      const endpoint = `/orders/my/${myOrder}`;

      const response = await get<{ data: OrdersData[] }>(endpoint, {
        requiresAuth: true,
      });

      console.log(response, "user orders response");

      const orders = response.data;
      if (!Array.isArray(orders)) {
        throw new Error("Expected orders array from API");
      }

      return transformApiOrdersToOrdersData(orders);
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
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
  fulfilledFilteredOrders: [],
  unfulfilledFilteredOrders: [],
  userOrders: [],
  orderInView: null,
  showOrderModal: false,
  orderTotalSize: 0,

  OrderFilters: {
    search: "",
    deliveryStatus: "All",
    type: null,
    paymentStatus: "All",
    dateFilter: {},
    sortDate: "descending",
  },

  fulfilledState: "idle",
  unfulfilledState: "idle",
  singleOrderState: "idle",
  userOrdersState: "idle",

  ordersError: {
    fulfilled: "",
    unfulfilled: "",
    single: "",
  },

  setOrderSearch: (search) => {
    set((state) => {
      state.OrderFilters.search = search;
    });
    get().applyOrderFilters();
  },

  setDeliveryStatusFilter: (status) => {
    set((state) => {
      state.OrderFilters.deliveryStatus = status;
    });
    get().applyOrderFilters();
  },

  setPaymentStatusFilter: (status) => {
    set((state) => {
      state.OrderFilters.paymentStatus = status;
    });
    get().applyOrderFilters();
  },

  setDateFilter: (filter) => {
    set((state) => {
      state.OrderFilters.dateFilter = {
        ...state.OrderFilters.dateFilter,
        ...filter,
      };
    });
    get().applyOrderFilters();
  },

  setOrderTypeFilter: (type: "fulfilled" | "unfulfilled" | null) => {
    set((state) => {
      state.OrderFilters.type = type;
    });
    get().applyOrderFilters();
  },

  resetOrdersFilters: () => {
    set((state) => {
      state.OrderFilters = {
        search: "",
        deliveryStatus: "All",
        paymentStatus: "All",
        type: null,
        dateFilter: {},
        sortDate: "descending",
      };
    });
  },

  applyOrderFilters: () => {
    const { OrderFilters, fulfilledOrders, unfulfilledOrders } = get();

    let ordersToFilter: OrdersData[] = [];

    if (OrderFilters.type === "fulfilled") {
      ordersToFilter = fulfilledOrders;
    } else if (OrderFilters.type === "unfulfilled") {
      ordersToFilter = unfulfilledOrders;
    }

    const filteredOrders = filterOrders(ordersToFilter, OrderFilters);

    set((state) => {
      if (OrderFilters.type === "fulfilled") {
        state.fulfilledFilteredOrders = filteredOrders;
      } else {
        state.unfulfilledFilteredOrders = filteredOrders;
      }
    });
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
      } else if (type === "unfulfilled") {
        state.unfulfilledState = newState;
        if (newState === "loading") state.ordersError.unfulfilled = "";
      } else if (type === "user") {
        state.userOrdersState = newState;
        if (newState === "loading") state.ordersError.single = "";
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

  toggleDateSorting: () => {
    set((state) => {
      const newSort =
        state.OrderFilters.sortDate === "ascending"
          ? "descending"
          : "ascending";
    });
  },

  // loadOrders: async (type, options = { force: false , page: 1 }) => {
  //   const { setOrdersState, setOrderError } = get();
  //   const { force = false, limit = 25, get: apiGet, page } = options;

  //   if (!apiGet) {
  //     throw new Error("API get function is required");
  //   }

  //   const currentOrders =
  //     type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;
  //   const currentState =
  //     type === "fulfilled" ? get().fulfilledState : get().unfulfilledState;

  //   if (!force && currentState === "success" && currentOrders.length > 0 ) {
  //     return;
  //   }

  //   setOrdersState(type, "loading");

  //   try {
  //     const { total, orders: ordersData } = await apiService.fetchOrders(
  //       type,
  //       apiGet,
  //       limit,
  //       page
  //     );

  //     set((state) => {
  //       if (type === "fulfilled") {
  //         state.fulfilledOrders = ordersData;
  //       } else {
  //         state.unfulfilledOrders = ordersData;
  //       }
  //       state.orderTotalSize = total;
  //     });

  //     setOrdersState(type, "success");
  //     get().applyOrderFilters();
  //   } catch (error) {
  //     setOrdersState(type, "failed");
  //     setOrderError(
  //       type,
  //       error instanceof Error ? error.message : `Failed to load ${type} orders`
  //     );
  //   }
  // },

  loadOrders: async (type, options = { force: false, page: 1 }) => {
    const { setOrdersState, setOrderError } = get();
    const { force = false, limit = 25, get: apiGet, page } = options;

    if (!apiGet) {
      throw new Error("API get function is required");
    }

    const currentOrders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;
    const currentState =
      type === "fulfilled" ? get().fulfilledState : get().unfulfilledState;

    // ✅ Skip fetch only for first page if already loaded
    if (
      !force &&
      page === 1 &&
      currentState === "success" &&
      currentOrders.length > 0
    ) {
      return;
    }

    setOrdersState(type, "loading");

    try {
      const { total, orders: ordersData } = await apiService.fetchOrders(
        type,
        apiGet,
        limit,
        page
      );

      set((state) => {
        const existing =
          type === "fulfilled"
            ? state.fulfilledOrders
            : state.unfulfilledOrders;

        const merged =
          page === 1
            ? ordersData // ✅ fresh load
            : [
                ...existing,
                ...ordersData.filter(
                  (order) => !existing.some((o) => o._id === order._id)
                ),
              ]; // ✅ append + dedupe

        if (type === "fulfilled") {
          state.fulfilledOrders = merged;
        } else {
          state.unfulfilledOrders = merged;
        }

        state.orderTotalSize = total;
      });

      setOrdersState(type, "success");
      get().applyOrderFilters();
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
  loadUserOrders: async (options = {}) => {
    const { setOrderError } = get();
    const { force = false, get: apiGet } = options;

    if (!apiGet) {
      throw new Error("API get function is required");
    }

    const currentUserOrders = get().userOrders;
    const currentState = get().userOrdersState;

    // Skip if already loaded and not forcing reload
    if (!force && currentState === "success" && currentUserOrders.length > 0) {
      return;
    }

    // Set loading state
    set((state) => {
      state.userOrdersState = "loading";
      state.ordersError.single = "";
    });

    try {
      const ordersData = await apiService.fetchUserOrders(apiGet);

      set((state) => {
        state.userOrders = ordersData;
        state.userOrdersState = "success";
      });
    } catch (error) {
      set((state) => {
        state.userOrdersState = "failed";
        state.ordersError.single =
          error instanceof Error ? error.message : "Failed to load user orders";
      });

      setOrderError(
        "single",
        error instanceof Error ? error.message : "Failed to load user orders"
      );
    }
  },
  updateOrder: async (orderId, updates, options = {}) => {
    const { patch: apiPatch } = options;

    if (!apiPatch) {
      throw new Error("API patch function is required");
    }

    const { setSingleOrderState, setOrderError } = get();

    setSingleOrderState("loading");

    const updatePromise = (async () => {
      try {
        const updatedOrder = await apiService.updateOrderStatus(
          orderId,
          apiPatch,
          updates
        );


        set((state) => {
          // Helper function to update order in array
          interface UpdateOrderInArray {
            (orders: OrdersData[]): boolean;
          }

          const updateOrderInArray: UpdateOrderInArray = (
            orders: OrdersData[]
          ): boolean => {
            const index: number = orders.findIndex(
              (o: OrdersData) => o._id === orderId
            );
            if (index !== -1) {
              orders[index] = { ...orders[index], ...updatedOrder };
            }
            return index !== -1;
          };

          // Update in both arrays first
          let foundInUnfulfilled = updateOrderInArray(state.unfulfilledFilteredOrders);
          let foundInFulfilled = updateOrderInArray(state.fulfilledFilteredOrders);

          // Update orderInView if it matches
          if (state.orderInView?._id === orderId) {
            state.orderInView = { ...state.orderInView, ...updatedOrder };
          }

          // Handle fulfillment status changes (moving between arrays)
          if (updates.fulfilledStatus !== undefined) {
            const isBeingFulfilled = updates.fulfilledStatus === "fulfilled";

            if (isBeingFulfilled && foundInUnfulfilled) {
              // Move from unfulfilled to fulfilled
              const orderIndex = state.unfulfilledOrders.findIndex(
                (o) => o._id === orderId
              );
              if (orderIndex !== -1) {
                const [order] = state.unfulfilledOrders.splice(orderIndex, 1);
                state.fulfilledOrders.push({ ...order, ...updatedOrder });
              }
            } else if (!isBeingFulfilled && foundInFulfilled) {
              // Move from fulfilled to unfulfilled
              const orderIndex = state.fulfilledOrders.findIndex(
                (o) => o._id === orderId
              );
              if (orderIndex !== -1) {
                const [order] = state.fulfilledOrders.splice(orderIndex, 1);
                state.unfulfilledOrders.push({ ...order, ...updatedOrder });
              }
            }
          }
        });

        setSingleOrderState("success");
        return updatedOrder;
      } catch (error) {
        console.error("Order update failed:", error);
        setSingleOrderState("failed");
        setOrderError(
          "single",
          error instanceof Error ? error.message : "Failed to update order"
        );
        throw error;
      }
    })();

    // Toast notifications
    toast.promise(updatePromise, {
      loading: getLoadingMessage(updates),
      success: (updatedOrder) => {
        const orderIdentifier =  updatedOrder?.IDTrim || generateTrimmedId(orderId);
        const toastMessage = getToastMessages(updates);

        return {
          title: `Order ${orderIdentifier}`,
          description: toastMessage.description,
        };
      },
      error: getErrorMessage(updates),
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
          title: `Order ${
            order?.IDTrim || generateTrimmedId(orderId)
          } refunded successfully`,
        };
      },
      error: "Failed to process refund. Please try again.",
    });

    return refundPromise;
  },
  getFilteredOrders: (type) => {
    const { OrderFilters: filters } = get();
    const orders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;

    const filtered = filterOrders(orders, filters);
    return sortOrdersByDate(filtered, filters.sortDate);
  },
  getOrdersStats: (type) => {
    const orders =
      type === "fulfilled" ? get().fulfilledOrders : get().unfulfilledOrders;
    return computeOrdersStats(orders);
  },
});

const getLoadingMessage = (updates: any) => {
  if (updates.fulfilledStatus && updates.deliveryStatus) {
    return {
      title: "Updating Order",
      description: "Updating order status...",
    };
  } else if (updates.fulfilledStatus) {
    const action =
      updates.fulfilledStatus === "fulfilled" ? "fulfilled" : "unfulfilled";
    return {
      title: "Updating Order",
      description: `Marking order as ${action}...`,
    };
  } else if (updates.deliveryStatus) {
    return {
      title: "Updating Delivery",
      description: "Updating delivery status...",
    };
  }
  return {
    title: "Updating Order",
    description: "Updating order...",
  };
};

const getErrorMessage = (updates: any) => {
  if (updates.fulfilledStatus && updates.deliveryStatus) {
    return {
      title: "Update Failed",
      description: "Failed to update order status. Please try again.",
    };
  } else if (updates.fulfilledStatus) {
    const action =
      updates.fulfilledStatus === "fulfilled" ? "fulfilled" : "unfulfilled";
    return {
      title: "Update Failed",
      description: `Failed to mark order as ${action}. Please try again.`,
    };
  } else if (updates.deliveryStatus) {
    return {
      title: "Update Failed",
      description: "Failed to update delivery status. Please try again.",
    };
  }
  return {
    title: "Update Failed",
    description: "Failed to update order. Please try again.",
  };
};

const getToastMessages = (updates: any) => {
  const messages = [];
  if (updates.fulfilledStatus) {
    const action =
      updates.fulfilledStatus === "fulfilled" ? "fulfilled" : "unfulfilled";
    messages.push(`marked as ${action}`);
  }
  if (updates.deliveryStatus) {
    const statusMap = {
      delivered: "delivered",
      pending: "pending",
      cancelled: "cancelled",
      shipped: "shipped",
    };
    messages.push(
      `delivery status updated to ${
        statusMap[updates.deliveryStatus as keyof typeof statusMap]
      }`
    );
  }

  const description = messages.length > 0 ? messages.join(" and ") : "updated";
  return {
    title: "Order Updated",
    description: `Order ${description} successfully`,
  };
};
