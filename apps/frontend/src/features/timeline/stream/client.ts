import type { TimelineStream } from "@solosocius/api-types";
import {
  parseServerFrame,
  type AppliedTimelineFrame,
} from "./apply-stream-event";

type Subscription = {
  stream: TimelineStream;
  onEvent: (frame: AppliedTimelineFrame) => void;
  onReconnect: () => void;
};

export function timelineStreamUrl(
  apiUrl: string,
  locationHref = "http://localhost/",
) {
  if (apiUrl.startsWith("/")) {
    const page = new URL(locationHref);
    const protocol = page.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${page.host}${apiUrl.replace(/\/$/, "")}/streaming`;
  }

  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/streaming`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export class TimelineStreamClient {
  private socket: WebSocket | null = null;
  private counts = new Map<TimelineStream, number>();
  private listeners = new Set<Subscription>();
  private hasOpened = false;
  private manualClose = false;
  private attempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  subscribe(
    stream: TimelineStream,
    onEvent: (frame: AppliedTimelineFrame) => void,
    onReconnect: () => void,
  ) {
    const subscription = { stream, onEvent, onReconnect };
    this.listeners.add(subscription);
    const count = this.counts.get(stream) ?? 0;
    this.counts.set(stream, count + 1);
    this.manualClose = false;
    this.connect();
    if (count === 0 && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "subscribe", stream }));
    }

    return () => {
      this.listeners.delete(subscription);
      const next = (this.counts.get(stream) ?? 1) - 1;
      if (next <= 0) {
        this.counts.delete(stream);
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: "unsubscribe", stream }));
        }
      } else {
        this.counts.set(stream, next);
      }
      if (this.counts.size === 0) {
        this.manualClose = true;
        this.hasOpened = false;
        this.socket?.close();
        this.socket = null;
      }
    };
  }

  private connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING ||
        this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
    const locationHref =
      typeof window === "undefined" ? "http://localhost/" : window.location.href;
    const socket = new WebSocket(timelineStreamUrl(apiUrl, locationHref));
    this.socket = socket;

    socket.addEventListener("open", () => {
      const reconnecting = this.hasOpened;
      this.hasOpened = true;
      this.attempt = 0;
      for (const stream of this.counts.keys()) {
        socket.send(JSON.stringify({ type: "subscribe", stream }));
      }
      if (reconnecting) {
        for (const listener of this.listeners) listener.onReconnect();
      }
    });

    socket.addEventListener("message", (event) => {
      const frame = parseServerFrame(String(event.data));
      if (!frame || "error" in frame) return;
      for (const listener of this.listeners) {
        if (frame.stream.includes(listener.stream)) listener.onEvent(frame);
      }
    });

    socket.addEventListener("close", () => {
      if (this.socket === socket) this.socket = null;
      if (this.manualClose || this.counts.size === 0) return;
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect() {
    if (this.timer) return;
    const delay = Math.min(1000 * 2 ** this.attempt, 15000);
    this.attempt += 1;
    this.timer = setTimeout(() => {
      this.timer = null;
      if (!this.manualClose && this.counts.size > 0) this.connect();
    }, delay);
  }
}

let shared: TimelineStreamClient | null = null;

export function getTimelineStream() {
  shared ??= new TimelineStreamClient();
  return shared;
}
