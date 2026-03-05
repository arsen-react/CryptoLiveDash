import { useEffect, useRef, useCallback, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type HistogramSeriesOptions,
  type UTCTimestamp,
  ColorType,
} from "lightweight-charts";
import { useGetKlinesQuery } from "@/features/market/marketApi";
import { useAppSelector } from "@/app/store";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { TimeframeSelector } from "./TimeframeSelector";
import { LastUpdated } from "@/shared/components/LastUpdated";
import { BINANCE_WS_URL } from "@/shared/utils/constants";
import { generateMockKlines } from "@/shared/utils/mockData";
import type { Kline, WebSocketKlineMessage } from "@/shared/types/market";

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const symbol = useAppSelector((state) => state.market.selectedSymbol);
  const timeframe = useAppSelector((state) => state.chart.timeframe);
  const showVolume = useAppSelector((state) => state.chart.showVolume);

  const { data: klines, isLoading, error } = useGetKlinesQuery({ symbol, interval: timeframe });

  // Decide which data to display: real or mock
  const chartData: Kline[] = klines ?? generateMockKlines(symbol);
  const isMock = !klines;

  // Live kline WebSocket
  const handleKlineMessage = useCallback((data: WebSocketKlineMessage) => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    const k = data.k;
    if (!k) return;

    const time = (k.t / 1000) as UTCTimestamp;
    candleSeriesRef.current.update({
      time,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
    });
    volumeSeriesRef.current.update({
      time,
      value: parseFloat(k.v),
      color: parseFloat(k.c) >= parseFloat(k.o) ? "#22c55e33" : "#ef444433",
    });
    setLastUpdated(Date.now());
    setUsingMock(false);
  }, []);

  useWebSocket<WebSocketKlineMessage>({
    url: `${BINANCE_WS_URL}/${symbol.toLowerCase()}@kline_${timeframe}`,
    onMessage: handleKlineMessage,
  });

  // Create chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#151823" },
        textColor: "#64748b",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e293b40" },
        horzLines: { color: "#1e293b40" },
      },
      crosshair: {
        vertLine: { color: "#6366f180", width: 1, style: 2, labelBackgroundColor: "#6366f1" },
        horzLine: { color: "#6366f180", width: 1, style: 2, labelBackgroundColor: "#6366f1" },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef444499",
      wickUpColor: "#22c55e99",
    } as CandlestickSeriesOptions);

    const volumeSeries = chart.addHistogramSeries({
      color: "#6366f1",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    } as HistogramSeriesOptions);

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Feed data into chart whenever chartData changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || chartData.length === 0) return;

    const candleData = chartData.map((k) => ({
      time: (k.openTime / 1000) as UTCTimestamp,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    const volumeData = chartData.map((k) => ({
      time: (k.openTime / 1000) as UTCTimestamp,
      value: k.volume,
      color: k.close >= k.open ? "#22c55e33" : "#ef444433",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    volumeSeriesRef.current.applyOptions({ visible: showVolume });

    chartRef.current?.timeScale().fitContent();

    if (klines) {
      setLastUpdated(Date.now());
      setUsingMock(false);
    } else {
      setUsingMock(true);
    }
  }, [chartData, showVolume, klines]);

  return (
    <div>
      {/* Chart header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-muted">Chart</h2>
          <LastUpdated
            timestamp={lastUpdated}
            isMock={usingMock}
            isLive={!usingMock && lastUpdated !== null}
          />
          {isLoading && (
            <span className="text-[10px] text-accent animate-pulse">Loading...</span>
          )}
          {error && !klines && (
            <span className="text-[10px] text-yellow-500/70">Using demo data</span>
          )}
        </div>
        <TimeframeSelector />
      </div>

      {/* Chart always renders */}
      <div className="widget-card overflow-hidden relative">
        <div ref={chartContainerRef} />
        {isMock && !isLoading && (
          <div className="absolute top-3 left-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-medium px-2 py-1 rounded">
            Demo data — Binance API unavailable
          </div>
        )}
      </div>
    </div>
  );
}
