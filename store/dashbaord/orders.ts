import { type StateCreator } from "zustand";
import { Store } from "../store";

export type OrdersData = {
  id: string;
  date: string;
  time: string;
  customer: {
    userID: string;
    firstname: string;
    lastname: string;
  };
  total: number;
  paymentStatus: "completed" | "pending" | "cancelled";
  deliveryStatus: "completed" | "pending" | "cancelled" | "shpped";
  items: {
    numOfItems: number;
    itemsIDS: string[];
  };
  discount: number;
};

export type OrdersStore = {
  orders: OrdersData[];
  sortDate: "ascending" | "descending";
  activeFilter: string;
  selectedOrders: OrdersData[];
  selectAllOrders: boolean;
  search: string;
  totalOrders: number;
  ordersDelivered: number;
  orderShipped: number;
  pendingOrders: number;
  cancelledOrders: number;
  showOrderModal:boolean;
  setOrderModal:() => void;
  setStatus: (
    type: "paymentStatus" | "deliveryStatus",
    action: "completed" | "pending" | "cancelled"
  ) => void;
  setSearching: (search: string) => void;
  toggleDateSorting: () => void;
  setActiveFilter: (filter: string) => void;
  toggleSelectAll: () => void;
  toggleSelectOrder: (order: OrdersData) => void;
  setOrders: (orders: OrdersData[]) => void;
};

// 🧠 Helper to compute counts
function computeStats(orders: OrdersData[]) {
  return {
    totalOrders: orders.length,
    ordersDelivered: orders.filter((o) => o.deliveryStatus === "completed")
      .length,
    orderShipped: orders.filter((o) => o.deliveryStatus === "shpped").length,
    pendingOrders: orders.filter((o) => o.deliveryStatus === "pending").length,
    cancelledOrders: orders.filter((o) => o.deliveryStatus === "cancelled")
      .length,
  };
}

export const useOrdersStore: StateCreator<
  Store,
  [["zustand/persist", unknown], ["zustand/immer", never]],
  [],
  OrdersStore
> = (set, get) => ({
  orders: [],
  sortDate: "descending",
  activeFilter: "All",
  selectedOrders: [],
  selectAllOrders: false,
  search: "",
  totalOrders: 0,
  ordersDelivered: 0,
  orderShipped: 0,
  pendingOrders: 0,
  cancelledOrders: 0,
  showOrderModal:false,

  setOrderModal:()=>{
    set((state)=>{
      state.showOrderModal = !state.showOrderModal
    })
  },


  setStatus: (type, action) => {
    set((state) => {
      state.orders = state.orders.map((order) => ({
        ...order,
        [type]: action,
      }));
      const stats = computeStats(state.orders);
      Object.assign(state, stats);
    });
  },

  setSearching: (search) => {
    set((state) => {
      state.search = search;
    });
  },

  setActiveFilter: (filter) => {
    set((state) => {
      state.activeFilter = filter;
    });
  },

  toggleSelectAll: () => {
    const { selectAllOrders, orders } = get();
    set((state) => {
      state.selectAllOrders = !selectAllOrders;
      state.selectedOrders = !selectAllOrders ? [...orders] : [];
    });
  },

  toggleSelectOrder: (order) => {
    const { selectedOrders } = get();
    const exists = selectedOrders.some((o) => o.id === order.id);
    set((state) => {
      state.selectedOrders = exists
        ? selectedOrders.filter((o) => o.id !== order.id)
        : [...selectedOrders, order];
    });
  },

  setOrders: (orders) => {
    set((state) => {
      state.orders = orders;
      const stats = computeStats(orders);
      Object.assign(state, stats);
    });
  },
  
  toggleDateSorting: () => {
    set((state) => {
      const newSort =
        state.sortDate === "ascending" ? "descending" : "ascending";

      const sortedOrders = [...state.orders].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        return newSort === "ascending" ? dateA - dateB : dateB - dateA;
      });

      state.sortDate = newSort;
      state.orders = sortedOrders;
    });
  },
});

export function generateMockOrders(count: number = 20): OrdersData[] {
  const statuses = ["completed", "pending", "cancelled"] as const;
  const firstNames = ["John", "Jane", "Alice", "Bob", "Emily", "Michael"];
  const lastNames = ["Doe", "Smith", "Johnson", "Brown", "Lee", "Taylor"];

  const orders: OrdersData[] = [];

  for (let i = 1; i <= count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const numItems = Math.floor(Math.random() * 5) + 1;

    // Generate valid day string
    const day = ((i % 30) + 1).toString().padStart(2, "0");

    // Time components
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 60);
    const isPM = Math.random() > 0.5;

    // Convert to 24-hour format
    const hour24 = isPM
      ? hour === 12
        ? 12
        : hour + 12
      : hour === 12
      ? 0
      : hour;

    // Create valid Date object
    const fullDate = new Date(
      `2025-07-${day}T${hour24.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00`
    );

    // Extract date and time
    const date = fullDate.toISOString().split("T")[0]; // "2025-07-24"
    const time = fullDate
      .toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase(); // e.g., "8:33 am"

    orders.push({
      id: `ORD-${i.toString().padStart(3, "0")}`,
      date,
      time,
      customer: {
        userID: `U${i}`,
        firstname: first,
        lastname: last,
      },
      total: parseFloat((Math.random() * 200 + 20).toFixed(2)),
      paymentStatus: statuses[Math.floor(Math.random() * statuses.length)],
      deliveryStatus: statuses[Math.floor(Math.random() * statuses.length)],
      items: {
        numOfItems: numItems,
        itemsIDS: Array.from(
          { length: numItems },
          () => `P${Math.floor(Math.random() * 10000)}`
        ),
      },
      discount: parseFloat((Math.random() * 30).toFixed(2)), // fixed typo from "dsicount"
    });
  }

  return orders;
}
