import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBoundStore } from "@/store/store";

export const useFilterPagination = () => {
  const {
    filter,
    filterState,
    loadProducts,
    getFilterQueries,
    loadFiltersFromURL,
    productPaginationState,
    cartProductState,
    categories,
    setFilterCategories,
  } = useBoundStore();

  const [pagination, setPagination] = useState(1);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Track ongoing requests
  const lastKeyRef = useRef<string>("");
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load categories once
  useEffect(() => {
    const loadCats = async () => {
      if (!categoriesLoaded) {
        await setFilterCategories();
        setCategoriesLoaded(true);
      }
    };
    loadCats();
  }, [categoriesLoaded, setFilterCategories]);

  // Stable load function that doesn't change reference
  const executeLoad = useCallback(
    async (reset: boolean, page: number, queries?: Record<string, any>) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      abortControllerRef.current = new AbortController();

      console.log("Starting load products:", { reset, page, queries });

      try {
        await loadProducts(reset, page, 24, queries);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
        } else {
        }
      } finally {
        loadingRef.current = false;
        abortControllerRef.current = null;
        console.log("Loading ref cleared");
      }
    },
    [loadProducts]
  );

  // Main effect for URL changes
  useEffect(() => {
    if (!categoriesLoaded || categories.length === 0) {
      return;
    }

    // Create stable query key from current URL state
    const params = Object.fromEntries(searchParams.entries());
    const { page, ...filtersOnly } = params;
    const currentPage = page ? parseInt(page) : 1;
    const hasFilters = Object.keys(filtersOnly).length > 0;

    // Create query key that includes all filter params
    const filterKey = Object.keys(filtersOnly)
      .sort()
      .map((k) => `${k}=${filtersOnly[k]}`)
      .join("&");
    
    const fullKey = `${pathname}?${filterKey}|page=${currentPage}`;

    if (lastKeyRef.current === fullKey) {
      // console.log("Same query key and page, skipping effect");
      return;
    }

    const oldFilterKey = lastKeyRef.current.split("|page=")[0];
    const newFilterKey = `${pathname}?${filterKey}`;
    const isOnlyPageChange = oldFilterKey === newFilterKey;

    lastKeyRef.current = fullKey;

    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setPagination(currentPage);

    const delay = isOnlyPageChange ? 0 : 300;

    timeoutRef.current = setTimeout(() => {
      // console.log("Loading products:", { hasFilters, currentPage, isOnlyPageChange });

      if (hasFilters) {
        loadFiltersFromURL(searchParams);
        const queries = getFilterQueries();
        // console.log("Filter queries:", queries);
        executeLoad(true, currentPage, queries);
      } else {
        executeLoad(true, currentPage);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    pathname,
    searchParams,
    categoriesLoaded,
    categories.length,
    executeLoad,
    loadFiltersFromURL,
    getFilterQueries,
  ]);

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (productPaginationState === "loading" || loadingRef.current) {
        console.log("Already loading, skipping page change");
        return;
      }
      // console.log("Changing page to:", newPage);
      setPagination(newPage);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
     router.push(`${pathname}?${params.toString()}`, { scroll: false });
      const queries = getFilterQueries();
      await executeLoad(false, newPage, queries);
    },
    [
      productPaginationState,
      searchParams,
      getFilterQueries,
      executeLoad,
      router,
      pathname,
    ]
  );

  const applyFilters = useCallback(async () => {
    if (loadingRef.current) {
      console.log("Already loading, skipping filter apply");
      return;
    }
    // console.log("Applying filters");    
    const queries = getFilterQueries();
    // console.log("Filter queries being applied:", queries);

    setPagination(1);

    const params = new URLSearchParams();
    
    // Build URL params correctly
    if (queries) {
      Object.entries(queries).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        
        // Handle array values (like categories)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Join array values with comma (no encoding)
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, String(value));
        }
      });
    }

    // Remove page parameter for fresh filter
    params.delete("page");
    
    // console.log("URL params being set:", params.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    filterState(false);

  }, [getFilterQueries, router, pathname, filterState]);

  return useMemo(
    () => ({
      pagination,
      filter,
      filterState,
      handlePageChange,
      applyFilters,
      productPaginationState,
      categoriesLoaded,
      isFilterLoading: cartProductState === "loading",
      isPaginationLoading: productPaginationState === "loading",
    }),
    [
      pagination,
      filter,
      filterState,
      handlePageChange,
      applyFilters,
      productPaginationState,
      categoriesLoaded,
    ]
  );
};