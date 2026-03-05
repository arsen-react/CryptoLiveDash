import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { marketApi } from "@/features/market/marketApi";
import { marketReducer } from "@/features/market/marketSlice";
import { chartReducer } from "@/features/chart/chartSlice";
import { portfolioReducer } from "@/features/portfolio/portfolioSlice";
import { watchlistReducer } from "@/features/watchlist/watchlistSlice";
import { alertsReducer } from "@/features/alerts/alertsSlice";
import { dashboardReducer } from "@/features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    [marketApi.reducerPath]: marketApi.reducer,
    market: marketReducer,
    chart: chartReducer,
    portfolio: portfolioReducer,
    watchlist: watchlistReducer,
    alerts: alertsReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(marketApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
