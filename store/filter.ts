import { type StateCreator } from "zustand";
import { Store } from "./store";

type FilterItem = {
  name: string;
  content: string[] | string;
  view: boolean;
  selected: (string | number)[];
  multiSelect: boolean;
};

export type FilterStore = {
  filter: boolean;
  filterState: (filt: boolean) => void;
  filteritems: FilterItem[];
  toggleSelection: (name: string, value: string | number) => void;
  setFilterView: (name: string) => void;
  setFilterPrice: (value: string) => void;
};

export const useFilterStore: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  FilterStore
> = (set) => ({
  filter: false,
  filterState: (filt) => set({ filter: filt }),

  filteritems: [
    {
      name: "Category",
      content: ["shorts", "tshirts", "trouser", "hoodies", "jackets", "jeans"],
      view: false,
      selected: [],
      multiSelect: true,
    },
    {
      name: "sort by",
      content: [
        "price: low to high",
        "price: high to low",
        "newest",
        "popularity",
        "rating",
      ],
      view: false,
      selected: [],
      multiSelect: false,
    },
    {
      name: "price",
      content: "0",
      view: false,
      selected: [],
      multiSelect: false,
    },
  ],

  toggleSelection: (name, value) =>
    set((state) => {
      const item = state.filteritems.find((item) => item.name === name);
      if (!item) return state;

      let newSelected: (string | number)[];

      if (item.multiSelect) {
        newSelected = item.selected.includes(value)
          ? item.selected.filter((s) => s !== value)
          : [...item.selected, value];
      } else {
        newSelected = item.selected.includes(value) ? [] : [value];
      }

      return {
        filteritems: state.filteritems.map((i) =>
          i.name === name ? { ...i, selected: newSelected } : i
        ),
      };
    }),

  setFilterView: (name: string) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) => ({
        ...item,
        view: item.name === name ? !item.view : false,
      })),
    })),
  setFilterPrice: (value: string) =>
    set((state) => ({
      filteritems: state.filteritems.map((item) =>
        item.name === "price" ? { ...item, content: value } : item
      ),
    })),

  // add setFilterPrice
});
