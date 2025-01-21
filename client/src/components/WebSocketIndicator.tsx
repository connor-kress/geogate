import { useSessionStore } from "../stores/sessionStore";

export function WebSocketIndicator() {
  const readyState = useSessionStore((state) => state.readyState);

  function getIndicatorStyles() {
    switch (readyState) {
      case WebSocket.OPEN:
        return "bg-green-500";
      case WebSocket.CONNECTING:
        return "bg-yellow-500";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return "bg-red-500";
    }
  }

  function getStatusText() {
    switch (readyState) {
      case WebSocket.OPEN:
        return "Connected";
      case WebSocket.CONNECTING:
        return "Connecting";
      case WebSocket.CLOSING:
        return "Closing";
      case WebSocket.CLOSED:
      default:
        return "Disconnected";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full ${getIndicatorStyles()}`}
        aria-label={getStatusText()}
      ></div>
      <span className="text-zinc-400">{getStatusText()}</span>
    </div>
  );
};
