import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_BASE_URL, STORAGE_KEYS } from '@constants/index';
import type { Comment, Gift } from '@appTypes/index';

type SocketEvent =
  | 'new_comment'
  | 'new_gift'
  | 'viewer_count_update'
  | 'stream_ended'
  | 'connect'
  | 'disconnect';

type EventCallback<T = unknown> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentStreamId: string | null = null;

  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    this.socket = io(WS_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', reason => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', err => {
      console.error('[Socket] Connection error:', err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.currentStreamId = null;
  }

  // ─── Stream Room ────────────────────────────────────────────────────────────
  joinStream(streamId: string): void {
    this.currentStreamId = streamId;
    this.socket?.emit('join_stream', { streamId });
  }

  leaveStream(streamId: string): void {
    this.socket?.emit('leave_stream', { streamId });
    this.currentStreamId = null;
  }

  // ─── Event Listeners ────────────────────────────────────────────────────────
  onNewComment(callback: EventCallback<Comment>): () => void {
    this.socket?.on('new_comment', callback);
    return () => this.socket?.off('new_comment', callback);
  }

  onNewGift(callback: EventCallback<Gift>): () => void {
    this.socket?.on('new_gift', callback);
    return () => this.socket?.off('new_gift', callback);
  }

  onViewerCountUpdate(callback: EventCallback<{ count: number }>): () => void {
    this.socket?.on('viewer_count_update', callback);
    return () => this.socket?.off('viewer_count_update', callback);
  }

  onStreamEnded(callback: EventCallback<void>): () => void {
    this.socket?.on('stream_ended', callback);
    return () => this.socket?.off('stream_ended', callback);
  }

  // ─── Emit ────────────────────────────────────────────────────────────────────
  sendComment(streamId: string, content: string): void {
    this.socket?.emit('send_comment', { streamId, content });
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
