type ListenerCallback = (data: any) => void;
// type RequestResolver = {
//   resolve: (value: any) => void,
//   reject: (reason?: any) => void,
// };

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<ListenerCallback>>();
  // private pendingRequests = new Map<string, RequestResolver>();
  private connecting = false;

  constructor(private url: string) {}

  getReadyState(): number | null {
    return this.socket?.readyState ?? null;
  }

  isOpen(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getConnecting(): boolean {
    return this.connecting;
  }

  connect(onConnected?: (socket: WebSocket) => void): void {
    if (this.connecting) {
      console.log("Already connecting to WebSocket");
      return;
    }

    this.connecting = true;
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.connecting = false;
      onConnected?.(this.socket!);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);
      this.handleMessage(data);
      // this.handleResponse(data);
    };

    this.socket.onclose = (event) => {
      console.log(
        `WebSocket disconnected: code=${event.code}, reason=${event.reason}`
      );
      // this.connecting = false;
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.connecting = false;
      this.socket?.close();
      this.socket = null;
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.connecting = false;
      this.socket.close(1000, "User disconnected");
      this.socket = null;
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

  // sendRequest<T>(event: string, payload: any): Promise<T> {
  //   if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
  //     return Promise.reject(new Error("WebSocket is not connected"));
  //   }
  //
  //   const requestId = crypto.randomUUID();
  //   const message = { event, payload, requestId };
  //
  //   return new Promise<T>((resolve, reject) => {
  //     this.pendingRequests.set(requestId, { resolve, reject });
  //
  //     try {
  //       this.socket!.send(JSON.stringify(message));
  //       setTimeout(() => {
  //         if (this.pendingRequests.has(requestId)) {
  //           reject(new Error("Request timed out"));
  //           this.pendingRequests.delete(requestId);
  //         }
  //       }, 10000); // Timeout in 10 seconds
  //     } catch (error) {
  //       this.pendingRequests.delete(requestId);
  //       reject(error);
  //     }
  //   });
  // }

  addListener(eventType: string, callback: ListenerCallback): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
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

  // private handleResponse(data: any): void {
  //   const { requestId, payload } = data;
  //
  //   if (this.pendingRequests.has(requestId)) {
  //     const { resolve } = this.pendingRequests.get(requestId)!;
  //     resolve(payload);
  //     this.pendingRequests.delete(requestId);
  //   }
  // }
}
