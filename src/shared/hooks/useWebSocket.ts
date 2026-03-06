import { WS_MAX_RECONNECT_ATTEMPTS, WS_RECONNECT_DELAY } from "@/shared/utils/constants";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState<UseWebSocketReturn["status"]>("closed");

  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled) return;

    setStatus("connecting");
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setStatus("open");
      reconnectCountRef.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as T;
        onMessageRef.current(data);
      } catch {
        // skip malformed messages
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("closed");
      wsRef.current = null;

      if (enabled && reconnectCountRef.current < WS_MAX_RECONNECT_ATTEMPTS) {
        reconnectCountRef.current += 1;
        setTimeout(connect, WS_RECONNECT_DELAY);
      }
    };

    wsRef.current = ws;
  }, [url, enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { status, reconnectCount: reconnectCountRef.current };
}
