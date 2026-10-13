import { MainLayout } from "@/shared/components/Layout/MainLayout";
import { NotFound } from "@/shared/components/NotFound";
import type { RouteObject } from "react-router-dom";
import { lazyRoute } from "./lazyLoad";

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: lazyRoute(() => import("@/features/dashboard/components/Dashboard")),
      },
      {
        path: "/market",
        element: lazyRoute(() => import("@/features/market/components/MarketOverview")),
      },
      {
        path: "/portfolio",
        element: lazyRoute(() => import("@/features/portfolio/components/Portfolio")),
      },
      {
        path: "/watchlist",
        element: lazyRoute(() => import("@/features/watchlist/components/Watchlist")),
      },
      {
        path: "/alerts",
        element: lazyRoute(() => import("@/features/alerts/components/AlertsList")),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];
