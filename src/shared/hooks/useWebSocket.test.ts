import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WS_MAX_RECONNECT_ATTEMPTS, WS_RECONNECT_DELAY } from "@/shared/utils/constants";
import { useWebSocket } from "./useWebSocket";

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.closed = true;
    this.onclose?.();
  }

  // Helpers that simulate what the server does.
  open() {
    this.onopen?.();
  }

  receive(data: string) {
    this.onmessage?.({ data });
  }

  fail() {
    this.onerror?.();
  }

  drop() {
    this.onclose?.();
  }
}

const latest = () => MockWebSocket.instances[MockWebSocket.instances.length - 1];

describe("useWebSocket", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("connects and reports the socket status", () => {
    const { result } = renderHook(() => useWebSocket({ url: "wss://test/a", onMessage: vi.fn() }));
    expect(result.current.status).toBe("connecting");

    act(() => latest()?.open());
    expect(result.current.status).toBe("open");

    act(() => latest()?.fail());
    expect(result.current.status).toBe("error");
  });

  it("passes parsed JSON messages to onMessage and skips malformed ones", () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket({ url: "wss://test/a", onMessage }));

    act(() => {
      latest()?.receive('{"price":"42"}');
      latest()?.receive("not json");
    });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({ price: "42" });
  });

  it("does not connect while disabled", () => {
    renderHook(() => useWebSocket({ url: "wss://test/a", onMessage: vi.fn(), enabled: false }));
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("reconnects after a dropped connection, up to the attempt limit", () => {
    renderHook(() => useWebSocket({ url: "wss://test/a", onMessage: vi.fn() }));

    for (let attempt = 0; attempt < WS_MAX_RECONNECT_ATTEMPTS + 2; attempt++) {
      act(() => {
        latest()?.drop();
        vi.advanceTimersByTime(WS_RECONNECT_DELAY);
      });
    }

    expect(MockWebSocket.instances).toHaveLength(1 + WS_MAX_RECONNECT_ATTEMPTS);
  });

  it("closes the socket on unmount and does not reconnect afterwards", () => {
    const { unmount } = renderHook(() => useWebSocket({ url: "wss://test/a", onMessage: vi.fn() }));

    unmount();
    act(() => vi.advanceTimersByTime(WS_RECONNECT_DELAY * 2));

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0]?.closed).toBe(true);
  });

  it("drops the old stream when the URL changes, so stale data never reaches onMessage", () => {
    const onMessage = vi.fn();
    const { rerender } = renderHook(
      ({ url }: { url: string }) => useWebSocket({ url, onMessage }),
      {
        initialProps: { url: "wss://test/btcusdt@kline_1h" },
      },
    );
    const btcSocket = latest();

    rerender({ url: "wss://test/ethusdt@kline_1h" });
    act(() => vi.advanceTimersByTime(WS_RECONNECT_DELAY * 2));

    expect(MockWebSocket.instances.map((ws) => ws.url)).toEqual([
      "wss://test/btcusdt@kline_1h",
      "wss://test/ethusdt@kline_1h",
    ]);

    act(() => btcSocket?.receive('{"s":"BTCUSDT"}'));
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("uses the latest onMessage without reconnecting", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ onMessage }: { onMessage: (data: unknown) => void }) =>
        useWebSocket({ url: "wss://test/a", onMessage }),
      { initialProps: { onMessage: first } },
    );

    rerender({ onMessage: second });
    act(() => latest()?.receive('{"n":1}'));

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ n: 1 });
  });

  it("reports how many reconnects it has tried, and resets once connected", () => {
    const { result } = renderHook(() => useWebSocket({ url: "wss://test/a", onMessage: vi.fn() }));

    act(() => latest()?.drop());
    act(() => latest()?.drop());
    expect(result.current.reconnectCount).toBe(2);

    act(() => vi.advanceTimersByTime(WS_RECONNECT_DELAY));
    act(() => latest()?.open());
    expect(result.current.reconnectCount).toBe(0);
  });
});
