// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  coinBalance: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

// ─── Stream ───────────────────────────────────────────────────────────────────
export type StreamStatus = 'live' | 'ended' | 'scheduled';

export interface Stream {
  id: string;
  hostUserId: string;
  host: User;
  title: string;
  thumbnailUrl?: string;
  status: StreamStatus;
  viewerCount: number;
  category?: string;
  startedAt: string;
  agoraChannel?: string;
}

// ─── Comment ──────────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  streamId: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  content: string;
  createdAt: string;
}

// ─── Gift / Coin ──────────────────────────────────────────────────────────────
export interface Gift {
  id: string;
  streamId: string;
  sender: Pick<User, 'id' | 'username' | 'avatar'>;
  coinAmount: number;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coinAmount: number;
  priceTry: number;
  isPopular?: boolean;
}

export interface PaymentHistory {
  id: string;
  packageName: string;
  coinAmount: number;
  priceTry: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
}

// ─── Room ─────────────────────────────────────────────────────────────────────
export interface PrivateRoom {
  id: string;
  host: User;
  title: string;
  inviteCode: string;
  memberCount: number;
  maxMembers: number;
  isLocked: boolean;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  Room: undefined;
  Profile: undefined;
};

export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  StreamView: { streamId: string; agoraChannel: string };
  UserProfile: { userId: string };
};

export type RoomStackParamList = {
  RoomList: undefined;
  RoomCreate: undefined;
  RoomView: { roomId: string; inviteCode?: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  CoinShop: undefined;
  PaymentHistory: undefined;
  StreamBroadcast: undefined;
  Settings: undefined;
};
