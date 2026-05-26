class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this._intentionalClose = false;  // 👈 add this
  }

  connect(token) {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this._intentionalClose = false;

    // 1. Grab the URL and swap http:// for ws://
    const baseUrl = process.env.REACT_APP_BACKEND_URL.replace(/^http/, 'ws');
    
    // 2. Safely connect to Django (Port 8000)
    const wsUrl = `${baseUrl}/ws/updates/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handlers = this.listeners.get(message.type) ?? [];
      handlers.forEach(fn => fn(message.payload));
    };

    this.socket.onclose = () => {
      if (this._intentionalClose) return; 
      setTimeout(() => this.connect(token), 3000);
    };
  }

  on(eventType, handler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(handler);

    return () => {
      const updated = this.listeners.get(eventType).filter(fn => fn !== handler);
      this.listeners.set(eventType, updated);
    };
  }

  disconnect() {
    this._intentionalClose = true;  // 👈 set before closing
    this.socket?.close();
    this.socket = null;
  }
}

export const socketManager = new SocketManager();