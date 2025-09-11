import { type StateCreator } from "zustand";
import { Store } from "../store";
import { ProductData } from "./products";

export type OrdersData = {
  _id: string;
  IDTrim?:string,
  date: string;
  time: string;
  user: {
    userID: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  total: number;
  paymentStatus: "completed" | "pending" | "cancelled";
  deliveryStatus: "completed" | "pending" | "cancelled" | "shipped";
  fulfilledStatus: "unfulfilled" | "fulfilled";
  items: {
    numOfItems: number;
    products: Array<{
      _id: string;
      product: ProductData;
      variantID: string;
      size: string;
      quantiy:number
    }>;
  };
  discount: number;
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

export type OrdersStore = {
  // Core state
  orders: OrdersData[];
  filteredOrders: OrdersData[];
  sortDate: "ascending" | "descending";
  activeFilter: string;
  selectedOrders: OrdersData[];
  orderInView: OrdersData | null;
  selectAllOrders: boolean;
  search: string;
  showOrderModal: boolean;

  // Loading states
  ordersState: "idle" | "loading" | "success" | "failed";
  singleOrderState: "idle" | "loading" | "success" | "failed";
  bulkUpdateState: "idle" | "loading" | "success" | "failed";

  // Error states
  ordersError: {
    all: string;
    single: string;
    bulkUpdate: string;
  };

  // Computed ordersStats (memoized)
  ordersStats: OrdersStats;

  // Actions
  setOrderError: (
    type: keyof OrdersStore["ordersError"],
    error: string
  ) => void;
  setOrdersState: (state: OrdersStore["ordersState"]) => void;
  setSingleOrderState: (state: OrdersStore["singleOrderState"]) => void;
  setBulkUpdateState: (state: OrdersStore["bulkUpdateState"]) => void;

  setOrderModal: (show?: boolean) => void;
  setOrderStatus: (
    type: "paymentStatus" | "deliveryStatus" | "fulfilledStatus",
    action: string,
    orderIds?: string[]
  ) => Promise<void>;
  setSearching: (search: string) => void;
  toggleDateSorting: () => void;
  setActiveFilter: (filter: string) => void;
  toggleSelectAll: () => void;
  toggleSelectOrder: (order: OrdersData) => void;
  setSelectedOrders: (orders: OrdersData[]) => void;
  clearSelectedOrders: () => void;

  // Async actions
  loadOrders: (options?: { force?: boolean }) => Promise<void>;
  loadOrder: (ID: string) => Promise<void>;
  updateOrder: (order: Partial<OrdersData> & { _id: string }) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Computed getters
  getFilteredOrders: () => OrdersData[];
  getSelectedOrderIds: () => string[];

  // Utility actions
  setOrderInView: (order: OrdersData | null) => void;
  resetErrors: () => void;
  refreshStats: () => void;
};

// 🧠 Performance optimized ordersStats computation with memoization
function computeStats(orders: OrdersData[]): OrdersStats {
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

  const ordersStats = orders.reduce(
    (acc, order) => {
      // Count by delivery status
      if (order.deliveryStatus === "completed") acc.ordersDelivered++;
      else if (order.deliveryStatus === "shipped") acc.orderShipped++;
      else if (order.deliveryStatus === "pending") acc.pendingOrders++;
      else if (order.deliveryStatus === "cancelled") acc.cancelledOrders++;

      // Revenue calculation (only for completed payments)
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

  ordersStats.averageOrderValue =
    ordersStats.totalRevenue /
      orders.filter((o) => o.paymentStatus === "completed").length || 0;
  return ordersStats;
}

// 🔍 Optimized filtering with debouncing capability
function filterOrders(
  orders: OrdersData[],
  search: string,
  activeFilter: string
): OrdersData[] {
  let filtered = orders;

  // Apply search filter
  if (search.trim()) {
    const searchLower = search.toLowerCase().trim();
    filtered = filtered.filter((order) => {
      const customerName =
        `${order.user.firstname} ${order.user.lastname}`.toLowerCase();
      const orderId = order._id.toLowerCase();

      return (
        customerName.includes(searchLower) ||
        orderId.includes(searchLower) ||
        order.paymentStatus.toLowerCase().includes(searchLower) ||
        order.deliveryStatus.toLowerCase().includes(searchLower)
      );
    });
  }

  // Apply status filter
  if (activeFilter !== "All") {
    const filterLower = activeFilter.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.paymentStatus.toLowerCase() === filterLower ||
        order.deliveryStatus.toLowerCase() === filterLower ||
        order.fulfilledStatus.toLowerCase() === filterLower
    );
  }

  return filtered;
}

// 🎯 API

function getHeaders(): HeadersInit {
  const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  headers["Content-Type"] = "application/json";
  // headers[ "ngrok-skip-browser-warning"] =  "true";
  return headers;
}

const generateTrimmedId = (fullId: string): string => {
  const trimmed = fullId.substring(4, 8).toUpperCase(); 
  return `ORD-${trimmed}`;
};


// transform

export const transformApiOrderToOrdersData = (apiOrder: any): OrdersData => {
  // Parse the createdAt ISO string to extract date and time
  const createdDate = new Date(apiOrder.createdAt);

  // Format date as YYYY-MM-DD
  const date = createdDate.toISOString().split("T")[0];

  // Format time as HH:MM AM/PM
  const time = createdDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

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
    paymentStatus: apiOrder.paymentStatus,
    deliveryStatus: apiOrder.deliveryStatus,
    fulfilledStatus: apiOrder.fulfilledStatus,
    items: {
      numOfItems: apiOrder.items.numOfItems,
      products: apiOrder.items.products,
    },
    discount: apiOrder.discount,
  };
};

export const transformApiOrdersToOrdersData = (
  apiOrders: any
): OrdersData[] => {
  return apiOrders.map(transformApiOrderToOrdersData);
};



const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: getHeaders(),
    // credentials: "include",
    signal: AbortSignal.timeout(30000),
    ...options,
  });

  console.log(response);

  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

const apiService = {
  async fetchOrders(): Promise<OrdersData[]> {
    try {
      const response = await apiCall("/orders", {
        method: "GET",
        // credentials: "include",
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
      return data.order || data;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

  async updateOrderStatus(
    orderIds: string[],
    updates: Partial<OrdersData>
  ): Promise<void> {
    try {
      await apiCall("/orders/bulk-update", {
        method: "PUT",
        body: JSON.stringify({
          orderIds,
          updates,
        }),
      });
    } catch (error) {
      console.error("Failed to update orders:", error);
      throw error;
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    try {
     const res =  await apiCall(`/orders/${orderId}`, {
        method: "DELETE",
      });
     
      if(!res.ok){
        throw new Error("Failed to delete orders")
      }

    } catch (error) {
      console.error("Failed to delete orders:", error);
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
  // Initial state
  orders: [],
  filteredOrders: [],
  sortDate: "descending",
  activeFilter: "All",
  selectedOrders: [],
  orderInView: null,
  selectAllOrders: false,
  search: "",
  showOrderModal: false,

  // Loading states
  ordersState: "idle",
  singleOrderState: "idle",
  bulkUpdateState: "idle",

  // Error states
  ordersError: {
    all: "",
    single: "",
    bulkUpdate: "",
  },

  // Stats
  ordersStats: computeStats([]),

  // Error management
  setOrderError: (type, error) => {
    set((state) => {
      state.ordersError[type] = error;
    });
  },

  setOrdersState: (newState) => {
    set((state) => {
      state.ordersState = newState;
      if (newState === "loading") {
        state.ordersError.all = "";
      }
    });
  },

  setSingleOrderState: (newState) => {
    set((state) => {
      state.singleOrderState = newState;
      if (newState === "loading") {
        state.ordersError.single = "";
      }
    });
  },

  setBulkUpdateState: (newState) => {
    set((state) => {
      state.bulkUpdateState = newState;
      if (newState === "loading") {
        state.ordersError.bulkUpdate = "";
      }
    });
  },

  resetErrors: () => {
    set((state) => {
      state.ordersError = {
        all: "",
        single: "",
        bulkUpdate: "",
      };
    });
  },

  // Modal management
  setOrderModal: (show) => {
    set((state) => {
      state.showOrderModal = show !== undefined ? show : !state.showOrderModal;
    });
  },

  // status updates with API integration
  setOrderStatus: async (type, action, orderIds) => {
    const { selectedOrders, setBulkUpdateState, setOrderError } = get();
    const idsToUpdate = orderIds || selectedOrders.map((o) => o._id);

    if (!idsToUpdate.length) return;

    setBulkUpdateState("loading");

    try {
      // Make API call
      await apiService.updateOrderStatus(idsToUpdate, { [type]: action });

      set((state) => {
        // Update orders optimistically
        state.orders = state.orders.map((order) => {
          if (idsToUpdate.includes(order._id)) {
            return { ...order, [type]: action };
          }
          return order;
        });

        // Update selected orders
        state.selectedOrders = state.selectedOrders.map((order) => ({
          ...order,
          [type]: action,
        }));

        // Refresh computed data
        state.ordersStats = computeStats(state.orders);
        state.filteredOrders = filterOrders(
          state.orders,
          state.search,
          state.activeFilter
        );
      });

      setBulkUpdateState("success");
    } catch (error) {
      setBulkUpdateState("failed");
      setOrderError(
        "bulkUpdate",
        error instanceof Error ? error.message : "Failed to update orders"
      );
    }
  },

  // Search with  filtering
  setSearching: (search) => {
    set((state) => {
      state.search = search;
      state.filteredOrders = filterOrders(
        state.orders,
        search,
        state.activeFilter
      );
    });
  },

  // Filter management
  setActiveFilter: (filter) => {
    set((state) => {
      state.activeFilter = filter;
      state.filteredOrders = filterOrders(state.orders, state.search, filter);
    });
  },

  // Selection management
  toggleSelectAll: () => {
    const { selectAllOrders, filteredOrders } = get();
    set((state) => {
      const newSelectAll = !selectAllOrders;
      state.selectAllOrders = newSelectAll;
      state.selectedOrders = newSelectAll ? [...filteredOrders] : [];
    });
  },

  toggleSelectOrder: (order) => {
    const { selectedOrders, filteredOrders } = get();
    const exists = selectedOrders.some((o) => o._id === order._id);

    set((state) => {
      state.selectedOrders = exists
        ? selectedOrders.filter((o) => o._id !== order._id)
        : [...selectedOrders, order];

      state.selectAllOrders =
        state.selectedOrders.length === filteredOrders.length;
    });
  },

  setSelectedOrders: (orders) => {
    const { filteredOrders } = get();
    set((state) => {
      state.selectedOrders = orders;
      state.selectAllOrders = orders.length === filteredOrders.length;
    });
  },

  clearSelectedOrders: () => {
    set((state) => {
      state.selectedOrders = [];
      state.selectAllOrders = false;
    });
  },

  // Optimized sorting
  toggleDateSorting: () => {
    set((state) => {
      const newSort =
        state.sortDate === "ascending" ? "descending" : "ascending";

      const sortedOrders = [...state.orders].sort((a, b) => {
        const dateTimeA = new Date(`${a.date} ${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date} ${b.time}`).getTime();

        return newSort === "ascending"
          ? dateTimeA - dateTimeB
          : dateTimeB - dateTimeA;
      });

      state.sortDate = newSort;
      state.orders = sortedOrders;
      state.filteredOrders = filterOrders(
        sortedOrders,
        state.search,
        state.activeFilter
      );
    });
  },

  // Async operations with proper error handling
  loadOrders: async (options = {}) => {
    const { setOrdersState, setOrderError } = get();

    // Skip if already loaded and not forcing refresh
    if (
      !options.force &&
      get().ordersState === "success" &&
      get().orders.length > 0
    ) {
      return;
    }

    setOrdersState("loading");

    try {
      const ordersData = await apiService.fetchOrders();

      console.log(ordersData, "order data");

      set((state) => {
        state.orders = ordersData;
        state.ordersStats = computeStats(ordersData);
        state.filteredOrders = filterOrders(
          ordersData,
          state.search,
          state.activeFilter
        );

        // Clear selections when loading new data
        state.selectedOrders = [];
        state.selectAllOrders = false;
      });

      setOrdersState("success");
    } catch (error) {
      setOrdersState("failed");
      setOrderError(
        "all",
        error instanceof Error ? error.message : "Failed to load orders"
      );
    }
  },

  loadOrder: async (ID: string) => {
    const { setSingleOrderState, setOrderError, orders } = get();

    // Check if order exists in current orders first
    const existingOrder = orders.find((o) => o._id === ID);
    if (existingOrder) {
      set((state) => {
        state.orderInView = existingOrder;
      });
      return;
    }

    setSingleOrderState("loading");

    try {
      const orderData = await apiService.fetchOrder(ID);

      set((state) => {
        state.orderInView = orderData;
      });

      setSingleOrderState("success");
    } catch (error) {
      setSingleOrderState("failed");
      setOrderError(
        "single",
        error instanceof Error ? error.message : `Failed to load order ${ID}`
      );
    }
  },

  updateOrder: async (orderUpdate) => {
    const { orders, setSingleOrderState, setOrderError } = get();

    setSingleOrderState("loading");

    try {
      // Simulate API call
      await apiService.updateOrderStatus([orderUpdate._id as string], orderUpdate);

      set((state) => {
        // Update in main orders array
        const orderIndex = state.orders.findIndex(
          (o) => o._id === orderUpdate._id
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = {
            ...state.orders[orderIndex],
            ...orderUpdate,
          };
        }

        // Update in view if it's the same order
        if (state.orderInView?._id === orderUpdate._id) {
          state.orderInView = { ...state.orderInView, ...orderUpdate };
        }

        // Refresh computed data
        state.ordersStats = computeStats(state.orders);
        state.filteredOrders = filterOrders(
          state.orders,
          state.search,
          state.activeFilter
        );
      });

      setSingleOrderState("success");
    } catch (error) {
      setSingleOrderState("failed");
      setOrderError(
        "single",
        error instanceof Error ? error.message : "Failed to update order"
      );
    }
  },

  deleteOrder: async (orderIds) => {
    const { setBulkUpdateState, setOrderError } = get();

    setBulkUpdateState("loading");

    try {
      await apiService.deleteOrder(orderIds);

      set((state) => {
        state.orders = state.orders.filter(
          (order) => !orderIds.includes(order._id)
        );
        state.selectedOrders = state.selectedOrders.filter(
          (order) => !orderIds.includes(order._id)
        );
        state.ordersStats = computeStats(state.orders);
        state.filteredOrders = filterOrders(
          state.orders,
          state.search,
          state.activeFilter
        );
        state.selectAllOrders = false;
      });

      setBulkUpdateState("success");
    } catch (error) {
      setBulkUpdateState("failed");
      setOrderError(
        "bulkUpdate",
        error instanceof Error ? error.message : "Failed to delete orders"
      );
    }
  },

  // Computed getters
  getFilteredOrders: () => {
    const { filteredOrders } = get();
    return filteredOrders;
  },

  getSelectedOrderIds: () => {
    const { selectedOrders } = get();
    return selectedOrders.map((o) => o._id);
  },

  setOrderInView: (order) => {
    set((state) => {
      state.orderInView = order;
    });
  },

  refreshStats: () => {
    set((state) => {
      state.ordersStats = computeStats(state.orders);
    });
  },
});
