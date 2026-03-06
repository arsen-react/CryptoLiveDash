# CryptoLiveDash

Real-time cryptocurrency trading dashboard with live market data, interactive charts, portfolio tracking, and customizable drag-and-drop widgets.

![CryptoLiveDash Preview](./public/favicon.svg)

> **Live Demo**: [https://crypto-live-dash.vercel.app](https://crypto-live-dash.vercel.app)

---

## Problem

Crypto traders need a fast, reliable dashboard that consolidates real-time market data, charting, and portfolio tracking into a single customizable interface — without the bloat and complexity of full exchange platforms.

## Solution

CryptoLiveDash is a high-performance React dashboard that streams real-time data from Binance via WebSocket, renders professional-grade TradingView charts, and lets users customize their workspace with drag-and-drop widgets. It's built with the same architecture patterns used in production fintech applications.

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

- **Real-time WebSocket streaming** with automatic reconnection and exponential backoff
- **Redux Toolkit + RTK Query** for centralized state management and API caching
- **TradingView Lightweight Charts** for professional candlestick rendering
- **Drag-and-drop dashboard** with @dnd-kit for customizable widget layout
- **Code splitting** with React.lazy for optimal bundle size
- **Performance optimized** with React.memo, memoized selectors, and virtual scrolling
- **localStorage persistence** for portfolio, watchlist, alerts, and layout
- **Feature-based architecture** for scalability and maintainability
- **TypeScript** with strict mode for full type safety

## Tech Stack

| Category  | Technology                     |
| --------- | ------------------------------ |
| Framework | React 19 + TypeScript          |
| Build     | Vite                           |
| State     | Redux Toolkit + RTK Query      |
| Charts    | TradingView Lightweight Charts |
| Styling   | TailwindCSS                    |
| DnD       | @dnd-kit                       |
| Routing   | React Router v7                |
| Testing   | Vitest + React Testing Library |
| CI/CD     | GitHub Actions                 |
| Deploy    | Vercel                         |

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/CryptoLiveDash.git
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

- Professional candlestick charts (TradingView)
- Multiple timeframes (1m, 5m, 15m, 1H, 4H, 1D, 1W)
- Volume overlay
- Real-time candle updates via WebSocket

### Market Overview

- Top 20 crypto pairs by volume
- Live price updates
- 24h change, high, low, volume

### Portfolio Tracker

- Add/remove positions
- Real-time P&L calculation
- Total portfolio value and cost basis

### Watchlist

- Track favorite coins
- Live price cards with 24h stats

### Price Alerts

- Set above/below price targets
- Browser notifications on trigger

## Technical Challenges & Solutions

### Challenge 1: High-frequency WebSocket updates causing re-renders

**Solution**: Used Redux Toolkit with memoized selectors and React.memo on price-heavy components. Only components subscribed to specific symbols re-render.

### Challenge 2: Chart performance with 500+ candles

**Solution**: TradingView Lightweight Charts handles canvas rendering natively. Data transformation is memoized. Real-time updates use the `update()` method instead of `setData()`.

### Challenge 3: Persisting complex dashboard state

**Solution**: Custom localStorage middleware in Redux slices with debounced writes to prevent excessive serialization.

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
npm run format     # Prettier format
npm run test       # Run tests
npm run test:watch # Watch mode
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
└── styles/           # Global styles
```

## License

MIT
