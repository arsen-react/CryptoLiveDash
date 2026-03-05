import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MainLayout } from "@/shared/components/Layout/MainLayout";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";

const Dashboard = lazy(() => import("@/features/dashboard/components/Dashboard"));
const MarketOverview = lazy(() => import("@/features/market/components/MarketOverview"));
const Portfolio = lazy(() => import("@/features/portfolio/components/Portfolio"));
const Watchlist = lazy(() => import("@/features/watchlist/components/Watchlist"));
const AlertsList = lazy(() => import("@/features/alerts/components/AlertsList"));

// eslint-disable-next-line react-refresh/only-export-components
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSkeleton lines={8} className="mt-4" />}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/market",
        element: (
          <SuspenseWrapper>
            <MarketOverview />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/portfolio",
        element: (
          <SuspenseWrapper>
            <Portfolio />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/watchlist",
        element: (
          <SuspenseWrapper>
            <Watchlist />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/alerts",
        element: (
          <SuspenseWrapper>
            <AlertsList />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
