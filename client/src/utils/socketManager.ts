type ListenerCallback = (data: any) => void;
type RequestResolver = {
  resolve: (value: any) => void,
  reject: (reason?: any) => void,
};

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<ListenerCallback>>();
  private pendingRequests = new Map<string, RequestResolver>();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 5 * 1000; // Maximum delay: 5 seconds
  private reconnectTimeout: number | null = null;

  constructor(
    private url: string,
    private setReadyState: (state: number | null) => void,
    private getReadyState: () => number | null,
  ) {}

  connect(onConnected?: (socket: WebSocket) => void): void {
    if (this.getReadyState() === WebSocket.OPEN) {
      console.log("Already connected to WebSocket");
      return;
    } else if (this.getReadyState() === WebSocket.CONNECTING) {
      console.log("Already connecting to WebSocket");
      return;
    }
    const newSocket = new WebSocket(this.url);
    this.socket = newSocket;
    this.setReadyState(WebSocket.CONNECTING);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.setReadyState(WebSocket.OPEN);
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout !== null) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      onConnected?.(this.socket!);
    };

    this.socket.onclose = (event) => {
      if (this.socket !== newSocket) {
      // Not sure if this works
        console.log("WebSocket superseded by new connection");
        return;
      }
      console.log(
        `WebSocket disconnected: code=${event.code}, reason=${event.reason}`
      );
      this.setReadyState(WebSocket.CLOSED);
      this.scheduleReconnect(onConnected);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.setReadyState(WebSocket.CLOSED);
      // Reconnect is sometimes redundant but adds robustness
      this.scheduleReconnect(onConnected);
    };

    this.socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log("Message received:", messageData);
      const { type } = messageData;
      if (type === "success" || type === "error") {
        this.handleResponse(messageData);
      } else {
        this.handleMessage(messageData);
      }
    };
  }

  private scheduleReconnect(onConnected?: (socket: WebSocket) => void): void {
    if (this.reconnectTimeout !== null) {
      // console.log("Reconnection already scheduled");
      return;
    }
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts), // Exponential backoff
      this.maxReconnectDelay // Cap at maximum delay
    );
    console.log(`Attempting to reconnect in ${delay}ms...`);
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts += 1;
      this.connect(onConnected);
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, "User disconnected");
      if (this.reconnectTimeout !== null) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    }
  }

  sendMessage(message: object): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected or not ready to send messages.");
      return;
    }
    try {
      const jsonString = JSON.stringify(message);
      this.socket.send(jsonString);
      console.log("Message sent:", message);
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
    }
  }

  sendRequest<T>(type: string, data: any): Promise<T> {
    if (this.getReadyState() !== WebSocket.OPEN) {
      return Promise.reject(new Error("WebSocket is not connected"));
    }
    const requestId = crypto.randomUUID();
    const message = { type, data, requestId };

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
      try {
        this.socket!.send(JSON.stringify(message));
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            reject(new Error("Request timed out"));
            this.pendingRequests.delete(requestId);
          }
        }, 10000); // Timeout in 10 seconds
      } catch (error) {
        this.pendingRequests.delete(requestId);
        reject(error);
      }
    });
  }

  addListener(
    eventType: string, callback: ListenerCallback, signal?: AbortSignal
  ): void {
    if (eventType === "success" || eventType === "error") {
      console.error(`Reserved event type: "${eventType}"`);
      return;
    }
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
    // Handle AbortSignal for listener removal
    if (signal) {
      signal.addEventListener("abort", () => {
        this.removeListener(eventType, callback);
      });
    }
  }

  removeListener(eventType: string, callback: ListenerCallback): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.delete(callback);
      if (this.listeners.get(eventType)!.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  private handleMessage(messageData: any): void {
    const { type, data } = messageData;
    if (this.listeners.has(type)) {
      this.listeners.get(type)!.forEach((callback) => callback(data));
    } else {
      console.warn("No listeners for event:", type);
    }
  }

  private handleResponse(messageData: any): void {
    const { requestId, type, data, error } = messageData;
    if (!this.pendingRequests.has(requestId)) return;

    const { resolve, reject } = this.pendingRequests.get(requestId)!;
    if (type === "success") {
      resolve(data);
    } else if (type === "error") {
      reject(new Error(error || "Unknown error"));
    } else {
      reject(new Error("Invalid response type"));
    }
    this.pendingRequests.delete(requestId);
}
}
