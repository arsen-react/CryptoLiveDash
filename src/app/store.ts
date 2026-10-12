import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { marketApi } from "@/features/market/marketApi";
import { marketReducer } from "@/features/market/marketSlice";
import { chartReducer } from "@/features/chart/chartSlice";
import { portfolioReducer } from "@/features/portfolio/portfolioSlice";
import { watchlistReducer } from "@/features/watchlist/watchlistSlice";
import { alertsReducer } from "@/features/alerts/alertsSlice";
import { dashboardReducer } from "@/features/dashboard/dashboardSlice";

const rootReducer = combineReducers({
  [marketApi.reducerPath]: marketApi.reducer,
  market: marketReducer,
  chart: chartReducer,
  portfolio: portfolioReducer,
  watchlist: watchlistReducer,
  alerts: alertsReducer,
  dashboard: dashboardReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Builds a store; the app uses one instance, tests build a fresh one each. */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(marketApi.middleware),
    preloadedState,
  });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
