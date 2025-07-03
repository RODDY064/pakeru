import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import React from "react";

type NavigationHandler = (
  e: React.MouseEvent<HTMLAnchorElement>,
  link: string,
  router: AppRouterInstance,
  setRouteChange: (value: boolean) => void,
  delay?: number
) => void;


export const handleNavigation: NavigationHandler = (
  e: React.MouseEvent<HTMLAnchorElement>,
  link: string,
  router: AppRouterInstance,
  setRouteChange: (value: boolean) => void,
  delay: number = 500
) => {
  e.preventDefault();
  setRouteChange(true);
  
  setTimeout(() => {
    router.push(link);
  }, delay);
};