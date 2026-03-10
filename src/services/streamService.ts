import api from './api';
import type { Stream, Comment, Gift, ApiResponse, PaginatedResponse } from '@appTypes/index';

interface AgoraTokenResponse {
  token: string;
  channel: string;
  uid: number;
}

interface StartStreamRequest {
  title: string;
  category?: string;
}

// ─── Stream API ───────────────────────────────────────────────────────────────
export const streamService = {
  // Aktif yayınları getir (keşfet ekranı)
  async getActiveStreams(page = 1, category?: string): Promise<PaginatedResponse<Stream>> {
    const params: Record<string, unknown> = { page, limit: 12 };
    if (category && category !== 'all') params.category = category;
    const response = await api.get<ApiResponse<PaginatedResponse<Stream>>>('/streams', { params });
    return response.data.data;
  },

  // Tek yayın detayı
  async getStream(streamId: string): Promise<Stream> {
    const response = await api.get<ApiResponse<Stream>>(`/streams/${streamId}`);
    return response.data.data;
  },

  // Yayın başlat (yayıncı için Agora token al)
  async startStream(data: StartStreamRequest): Promise<{ stream: Stream; agoraToken: AgoraTokenResponse }> {
    const response = await api.post<ApiResponse<{ stream: Stream; agoraToken: AgoraTokenResponse }>>('/streams/start', data);
    return response.data.data;
  },

  // Yayını bitir
  async endStream(streamId: string): Promise<void> {
    await api.post(`/streams/${streamId}/end`);
  },

  // İzleyici için Agora token al
  async getViewerToken(streamId: string): Promise<AgoraTokenResponse> {
    const response = await api.post<ApiResponse<AgoraTokenResponse>>(`/streams/${streamId}/join`);
    return response.data.data;
  },

  // Yayından ayrıl (süre/ücret kaydı için)
  async leaveStream(streamId: string, watchedSeconds: number): Promise<void> {
    await api.post(`/streams/${streamId}/leave`, { watchedSeconds });
  },

  // Jeton gönder
  async sendGift(streamId: string, coinAmount: number): Promise<Gift> {
    const response = await api.post<ApiResponse<Gift>>(`/streams/${streamId}/gift`, { coinAmount });
    return response.data.data;
  },
};

// ─── Comment API ──────────────────────────────────────────────────────────────
export const commentService = {
  async getComments(streamId: string, page = 1): Promise<PaginatedResponse<Comment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
      `/streams/${streamId}/comments`,
      { params: { page, limit: 50 } },
    );
    return response.data.data;
  },

  async sendComment(streamId: string, content: string): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(`/streams/${streamId}/comments`, { content });
    return response.data.data;
  },
};
