// account-context.tsx
"use client";
import { createContext, useContext } from "react";

type Page = { name: string; label: string; isActive: boolean };

type AccountContextType = {
  pages: Page[];
  handlePage: (pageName: string) => void;
};

export const AccountContext = createContext<AccountContextType | null>(null);

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside AccountWrapper");
  return ctx;
};
