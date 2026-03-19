import api from './api';
import type {
  Room, CreateRoomRequest, JoinRoomResponse,
  SendGiftRequest, PageResponse, PageableParams,
} from '@appTypes/index';

export const roomService = {

  // Canlı odaları listele (Keşfet ekranı)
  async getLiveRooms(pageable: PageableParams = { page: 0, size: 20 }): Promise<PageResponse<Room>> {
    const response = await api.get<PageResponse<Room>>('/api/rooms', { params: pageable });
    return response.data;
  },

  // Tek oda detayı
  async getRoom(roomId: number): Promise<Room> {
    const response = await api.get<Room>(`/api/rooms/${roomId}`);
    return response.data;
  },

  // Oda oluştur (MODERATOR)
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const response = await api.post<Room>('/api/rooms', data);
    return response.data;
  },

  // Odaya katıl → video token al
  async joinRoom(roomId: number): Promise<JoinRoomResponse> {
    const response = await api.post<JoinRoomResponse>(`/api/rooms/${roomId}/join`);
    return response.data;
  },

  // Odadan ayrıl
  async leaveRoom(roomId: number): Promise<void> {
    await api.post(`/api/rooms/${roomId}/leave`);
  },

  // Odayı bitir (host/MODERATOR)
  async endRoom(roomId: number): Promise<void> {
    await api.post(`/api/rooms/${roomId}/end`);
  },

  // Hediye gönder
  async sendGift(roomId: number, data: SendGiftRequest): Promise<void> {
    await api.post(`/api/rooms/${roomId}/gifts`, data);
  },
};
