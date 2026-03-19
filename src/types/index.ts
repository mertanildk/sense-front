// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'USER' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'SUSPENDED';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  creditBalance: number;
  status: UserStatus;
  createdAt: string;
}

// ─── Room ─────────────────────────────────────────────────────────────────────
export type RoomStatus = 'SCHEDULED' | 'LIVE' | 'ENDED';

export interface Room {
  id: number;
  hostId: number;
  hostUsername: string;
  title: string;
  status: RoomStatus;
  videoRoomId: string;
  viewerCount: number;
  startedAt?: string;
  endedAt?: string;
}

export interface JoinRoomResponse {
  roomId: number;
  videoRoomId: string;
  videoToken: string;
}

export interface CreateRoomRequest {
  title: string;
}

// ─── Gift ─────────────────────────────────────────────────────────────────────
export interface SendGiftRequest {
  creditAmount: number;
  giftType: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: UserRole;
}

// ─── Payment / Credit ─────────────────────────────────────────────────────────
export type TransactionType = 'PURCHASE' | 'GIFT' | 'WITHDRAWAL' | 'REFUND';

export interface CreditTransaction {
  id: number;
  fromUser?: User;
  toUser?: User;
  amount: number;
  type: TransactionType;
  referenceId?: string;
  createdAt: string;
}

export interface CreatePaymentIntentRequest {
  amountCents: number;
  currency: string;
  creditAmount: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageableParams {
  page: number;
  size: number;
  sort?: string[];
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  Room: undefined;
  Profile: undefined;
};

export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  RoomView: { roomId: number };
  StreamBroadcast: undefined;
};

export type RoomStackParamList = {
  RoomList: undefined;
  RoomCreate: undefined;
  RoomView: { roomId: number };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  CoinShop: undefined;
  PaymentHistory: undefined;
  Settings: undefined;
};
