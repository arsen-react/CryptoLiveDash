# CryptoLiveDash

Real-time cryptocurrency trading dashboard with live Binance market data, TradingView candlestick charts, an order book, portfolio tracking, price alerts and drag-and-drop widgets.

![CryptoLiveDash: live BTC/USDT chart, order book, top markets and watchlist](./docs/preview.png)

---

## Problem

Crypto traders need a fast, reliable dashboard that consolidates real-time market data, charting, and portfolio tracking into a single customizable interface — without the bloat and complexity of full exchange platforms.

## Solution

CryptoLiveDash is a React dashboard that streams live market data from Binance over WebSocket, renders TradingView candlestick charts and lets users arrange their workspace with drag-and-drop widgets. It uses the feature-based architecture common in production fintech admin applications.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   React App                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Router   │  │  Redux   │  │  RTK Query    │  │
│  │ (lazy)    │  │  Store   │  │  (REST cache) │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│        │              │               │          │
│  ┌─────┴──────────────┴───────────────┴──────┐  │
│  │              Feature Modules               │  │
│  │  Dashboard │ Market │ Chart │ Portfolio    │  │
│  │  Watchlist │ Alerts │ Order Book           │  │
│  └─────────────────────┬─────────────────────┘  │
│                        │                         │
│  ┌─────────────────────┴─────────────────────┐  │
│  │            Shared Layer                    │  │
│  │  useWebSocket │ Formatters │ Types │ UI   │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │      Binance API            │
        │  REST (historical data)     │
        │  WebSocket (live streams)   │
        └─────────────────────────────┘
```

## Key Technical Highlights

- **Live WebSocket streams** for all-market tickers (`!miniTicker@arr`) and per-symbol candles, with capped reconnects and a clean teardown when the symbol or timeframe changes
- **Redux Toolkit + RTK Query** for application state and cached REST data
- **TradingView Lightweight Charts**, with live candles applied through `update()` instead of re-setting the series
- **Drag-and-drop dashboard** with @dnd-kit
- **Route-level code splitting** with `React.lazy`
- **Validated persistence**: portfolio, watchlist, alerts and layout are saved to localStorage and checked with Zod on load, so corrupted or tampered data falls back safely
- **Browser notifications** when a price alert triggers
- **83 automated tests** with Vitest and React Testing Library (see [Testing](#testing))
- **TypeScript** in strict mode, feature-based folder structure

## Tech Stack

| Category  | Technology                     |
| --------- | ------------------------------ |
| Framework | React 19 + TypeScript          |
| Build     | Vite                           |
| State     | Redux Toolkit + RTK Query      |
| Charts    | TradingView Lightweight Charts |
| Styling   | TailwindCSS                    |
| DnD       | @dnd-kit                       |
| Forms     | React Hook Form + Zod          |
| Routing   | React Router v7                |
| Testing   | Vitest + React Testing Library |
| CI        | GitHub Actions                 |

## Quick Start

```bash
git clone https://github.com/arsen-react/CryptoLiveDash.git
cd CryptoLiveDash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — no API keys needed.

## Features

### Dashboard

- Drag-and-drop widget grid with persistent layout
- Customizable widget arrangement
- Reset to default layout

### Trading Chart

- Candlestick charts (TradingView)
- Multiple timeframes (1m, 5m, 15m, 1H, 4H, 1D, 1W)
- Volume overlay
- Real-time candle updates via WebSocket

### Market Overview

- 20 major USDT pairs, sorted by 24h volume
- Live price updates
- 24h change and volume

### Portfolio Tracker

- Add/remove positions
- Real-time P&L calculation
- Total portfolio value and cost basis

### Watchlist

- Track favorite coins
- Live prices with 24h change

### Price Alerts

- Set above/below price targets
- Browser notifications on trigger

## Testing

```bash
npm run test           # run all 83 tests
npm run test:coverage  # with a coverage report
```

The suite covers the state, data and hook layers. Feature screens (chart, order book, portfolio pages) are not covered yet.

| Area                 | What is tested                                                   | Line coverage |
| -------------------- | ---------------------------------------------------------------- | ------------- |
| Redux slices (all 6) | add, update, remove, toggles, persistence, tampered storage      | 100%          |
| RTK Query endpoints  | USDT filtering, kline parsing, order-book mapping, request URLs  | 100%          |
| Hooks                | WebSocket lifecycle and reconnects, debounce, localStorage       | 100%          |
| Utilities            | formatters, ticker mapping, class merging, Zod-validated storage | 92–100%       |
| Shared components    | Modal, ErrorBoundary, PriceChange, LastUpdated                   | 100%          |

## Technical Challenges & Solutions

### Challenge 1: Binance retired the all-market ticker stream

The dashboard subscribed to `!ticker@arr`, which still accepts connections but no longer sends data. The status dot stayed green while the watchlist showed $0, portfolio values stopped updating and price alerts could never fire.

**Solution**: Switched to `!miniTicker@arr` and derived the 24h change from the open and close prices in `miniTickerToTicker`, which is unit-tested against a real Binance payload.

### Challenge 2: Old streams reconnecting after a symbol switch

Closing a socket during cleanup triggered its own reconnect logic, so switching from BTC to ETH re-opened the BTC stream in the background and its candles reached the ETH chart.

**Solution**: The hook now marks a socket as disposed on cleanup, cancels the pending reconnect and ignores late events. Two regression tests reproduce the original bug.

### Challenge 3: Chart performance with 500+ candles

**Solution**: TradingView Lightweight Charts renders on canvas, and live candles are applied with `update()` instead of `setData()`, so a new tick never redraws the whole series.

### Challenge 4: Persisting state safely

**Solution**: Every slice loads its saved state through a Zod schema. Invalid or tampered data falls back to defaults, and a full storage quota logs a warning instead of crashing the app.

## Scripts

```bash
npm run dev            # Start dev server
npm run build          # Type-check and production build
npm run preview        # Preview production build
npm run lint           # ESLint check
npm run format         # Prettier format
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Tests with coverage report
```

## Project Structure

```
src/
├── app/              # Store, router, App entry
├── features/         # Feature modules (dashboard, market, chart, etc.)
│   ├── dashboard/    # Drag-and-drop widget grid
│   ├── market/       # Market data, ticker, order book
│   ├── chart/        # TradingView chart integration
│   ├── portfolio/    # Portfolio tracking
│   ├── watchlist/    # Coin watchlist
│   └── alerts/       # Price alerts
├── shared/           # Reusable hooks, components, utils, types
├── styles/           # Global styles
└── test/             # Vitest setup
```

## License

MIT
