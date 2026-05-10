// ==========================================
// Traveloop - WebSocket Service
// Real-time communication for Group Chat & Safety
// ==========================================

import type {
  WebSocketEvent,
  GroupChatMessage,
  TypingIndicator,
  LocationUpdate,
  GroupSafetyAlert,
  Profile,
} from '@/types';

type EventHandler = (event: WebSocketEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private messageQueue: WebSocketEvent[] = [];
  private isConnected = false;
  private currentRoomId: string | null = null;
  private userId: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  // Simulated connection for demo
  private simulatedMode = true;

  connect(userId: string, roomId?: string): Promise<void> {
    this.userId = userId;
    if (roomId) {
      this.currentRoomId = roomId;
    }

    return new Promise((resolve, reject) => {
      if (this.simulatedMode) {
        // Simulated WebSocket for demo
        setTimeout(() => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Connected (simulated)');
          this.emit({ type: 'member_joined', payload: { room_id: roomId || '', user: {} as Profile } });
          resolve();
        }, 500);
        return;
      }

      try {
        const wsUrl = `wss://api.Traveloop.com/ws?user=${userId}${roomId ? `&room=${roomId}` : ''}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Connected');

          // Flush message queue
          while (this.messageQueue.length > 0) {
            const event = this.messageQueue.shift();
            if (event) {
              this.send(event);
            }
          }
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data: WebSocketEvent = JSON.parse(event.data);
            this.emit(data);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          console.log('[WebSocket] Disconnected');
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentRoomId = null;
    console.log('[WebSocket] Disconnected');
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId, this.currentRoomId || undefined);
      }
    }, delay);
  }

  joinRoom(roomId: string): void {
    this.currentRoomId = roomId;
    if (this.simulatedMode) {
      console.log(`[WebSocket] Joined room: ${roomId}`);
      return;
    }
    this.send({ type: 'member_joined', payload: { room_id: roomId, user: {} as Profile } });
  }

  leaveRoom(roomId: string): void {
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    if (this.simulatedMode) {
      console.log(`[WebSocket] Left room: ${roomId}`);
      return;
    }
    this.send({ type: 'member_left', payload: { room_id: roomId, user_id: this.userId || '' } });
  }

  // Send a chat message
  sendMessage(roomId: string, content: string, replyTo?: string): void {
    const message: GroupChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      sender_id: this.userId || '',
      content,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      reply_to: replyTo,
      mentions: this.extractMentions(content),
      reactions: [],
      is_pinned: false,
      is_deleted: false,
    };

    if (this.simulatedMode) {
      // Simulate sending and receiving
      setTimeout(() => {
        this.emit({ type: 'message', payload: message });
      }, 100);
      return;
    }

    this.send({ type: 'message', payload: message });
  }

  // Send typing indicator
  startTyping(roomId: string, userName: string): void {
    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    const indicator: TypingIndicator = {
      room_id: roomId,
      user_id: this.userId || '',
      user_name: userName,
      timestamp: new Date().toISOString(),
    };

    if (this.simulatedMode) {
      this.emit({ type: 'typing', payload: indicator });
    } else {
      this.send({ type: 'typing', payload: indicator });
    }

    // Auto-stop typing after 3 seconds
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(roomId);
    }, 3000);
  }

  stopTyping(roomId: string): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    const payload = { room_id: roomId, user_id: this.userId || '' };

    if (this.simulatedMode) {
      this.emit({ type: 'typing_stop', payload });
    } else {
      this.send({ type: 'typing_stop', payload });
    }
  }

  // Mark message as read
  markAsRead(roomId: string, messageId: string): void {
    const payload = { room_id: roomId, message_id: messageId, user_id: this.userId || '' };

    if (this.simulatedMode) {
      this.emit({ type: 'message_read', payload });
    } else {
      this.send({ type: 'message_read', payload });
    }
  }

  // Add reaction to message
  addReaction(messageId: string, emoji: string): void {
    const payload = { message_id: messageId, emoji, user_id: this.userId || '' };

    if (this.simulatedMode) {
      this.emit({ type: 'reaction', payload });
    } else {
      this.send({ type: 'reaction', payload });
    }
  }

  // Send location update
  updateLocation(tripId: string, lat: number, lng: number): void {
    const location: LocationUpdate = {
      id: `loc-${Date.now()}`,
      user_id: this.userId || '',
      trip_id: tripId,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
    };

    if (this.simulatedMode) {
      this.emit({ type: 'location_update', payload: location });
    } else {
      this.send({ type: 'location_update', payload: location });
    }
  }

  // Send safety alert
  sendSafetyAlert(alert: GroupSafetyAlert): void {
    if (this.simulatedMode) {
      this.emit({ type: 'safety_alert', payload: alert });
    } else {
      this.send({ type: 'safety_alert', payload: alert });
    }
  }

  // Event subscription
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  onAny(handler: EventHandler): () => void {
    return this.on('*', handler);
  }

  private emit(event: WebSocketEvent): void {
    // Emit to specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(event));
    }
  }

  private send(event: WebSocketEvent): void {
    if (!this.isConnected) {
      this.messageQueue.push(event);
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getCurrentRoom(): string | null {
    return this.currentRoomId;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
export default wsService;
