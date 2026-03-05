import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BINANCE_REST_URL } from "@/shared/utils/constants";
import type { Ticker, Kline, OrderBook, Timeframe } from "@/shared/types/market";

interface BinanceTickerResponse {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

type BinanceKlineResponse = [
  number, string, string, string, string, string,
  number, string, string, string, string, string,
];

export const marketApi = createApi({
  reducerPath: "marketApi",
  baseQuery: fetchBaseQuery({ baseUrl: BINANCE_REST_URL }),
  endpoints: (builder) => ({
    getTickers: builder.query<Ticker[], void>({
      query: () => "/api/v3/ticker/24hr",
      transformResponse: (response: BinanceTickerResponse[]) =>
        response
          .filter((t) => t.symbol.endsWith("USDT"))
          .map((t) => ({
            symbol: t.symbol,
            price: t.lastPrice,
            priceChange: t.priceChange,
            priceChangePercent: t.priceChangePercent,
            highPrice: t.highPrice,
            lowPrice: t.lowPrice,
            volume: t.volume,
            quoteVolume: t.quoteVolume,
          })),
    }),

    getKlines: builder.query<Kline[], { symbol: string; interval: Timeframe; limit?: number }>({
      query: ({ symbol, interval, limit = 500 }) =>
        `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      transformResponse: (response: BinanceKlineResponse[]) =>
        response.map((k) => ({
          openTime: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          closeTime: k[6],
        })),
    }),

    getOrderBook: builder.query<OrderBook, { symbol: string; limit?: number }>({
      query: ({ symbol, limit = 20 }) =>
        `/api/v3/depth?symbol=${symbol}&limit=${limit}`,
      transformResponse: (response: {
        lastUpdateId: number;
        bids: [string, string][];
        asks: [string, string][];
      }) => ({
        lastUpdateId: response.lastUpdateId,
        bids: response.bids.map(([price, quantity]) => ({ price, quantity })),
        asks: response.asks.map(([price, quantity]) => ({ price, quantity })),
      }),
    }),
  }),
});

export const { useGetTickersQuery, useGetKlinesQuery, useGetOrderBookQuery } = marketApi;
