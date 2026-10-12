import { WS_MAX_RECONNECT_ATTEMPTS, WS_RECONNECT_DELAY } from "@/shared/utils/constants";
import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions<T> {
  url: string;
  onMessage: (data: T) => void;
  enabled?: boolean;
}

interface UseWebSocketReturn {
  status: "connecting" | "open" | "closed" | "error";
  reconnectCount: number;
}

export function useWebSocket<T>({
  url,
  onMessage,
  enabled = true,
}: UseWebSocketOptions<T>): UseWebSocketReturn {
  const reconnectCountRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState<UseWebSocketReturn["status"]>("closed");

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return;

    // Set by the cleanup below. Events from a socket this effect has closed are
    // ignored, so a stream left behind by a URL change can neither reconnect nor
    // feed stale data into onMessage.
    let disposed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      setStatus("connecting");
      const socket = new WebSocket(url);
      ws = socket;

      socket.onopen = () => {
        if (disposed) return;
        setStatus("open");
        reconnectCountRef.current = 0;
      };

      socket.onmessage = (event: MessageEvent) => {
        if (disposed) return;
        try {
          const data = JSON.parse(event.data as string) as T;
          onMessageRef.current(data);
        } catch {
          // skip malformed messages
        }
      };

      socket.onerror = () => {
        if (disposed) return;
        setStatus("error");
      };

      socket.onclose = () => {
        if (disposed) return;
        setStatus("closed");
        ws = null;

        if (reconnectCountRef.current < WS_MAX_RECONNECT_ATTEMPTS) {
          reconnectCountRef.current += 1;
          reconnectTimer = setTimeout(connect, WS_RECONNECT_DELAY);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      ws?.close();
      ws = null;
      reconnectCountRef.current = 0;
    };
  }, [url, enabled]);

  return { status, reconnectCount: reconnectCountRef.current };
}
