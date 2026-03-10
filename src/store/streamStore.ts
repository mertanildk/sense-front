import { create } from 'zustand';
import type { Stream, Comment, Gift } from '@appTypes/index';

interface StreamState {
  // Aktif izlenen yayın
  activeStream: Stream | null;
  viewerCount: number;
  comments: Comment[];
  recentGifts: Gift[];

  // İzleme süresi (3 dk kuralı)
  watchedSeconds: number;
  isFreeTimeExpired: boolean;
  isPayingViewer: boolean;

  // Yayın durumu
  isStreamLoading: boolean;
  streamError: string | null;

  // Actions
  setActiveStream: (stream: Stream | null) => void;
  addComment: (comment: Comment) => void;
  addGift: (gift: Gift) => void;
  setViewerCount: (count: number) => void;
  tickWatchTime: () => void;
  setPayingViewer: (isPaying: boolean) => void;
  resetStreamState: () => void;
}

const INITIAL_STATE = {
  activeStream: null,
  viewerCount: 0,
  comments: [],
  recentGifts: [],
  watchedSeconds: 0,
  isFreeTimeExpired: false,
  isPayingViewer: false,
  isStreamLoading: false,
  streamError: null,
};

export const useStreamStore = create<StreamState>((set, get) => ({
  ...INITIAL_STATE,

  setActiveStream: (stream) => set({ activeStream: stream }),

  addComment: (comment) =>
    set(state => ({
      // Son 100 yorumu tut (performans)
      comments: [...state.comments.slice(-99), comment],
    })),

  addGift: (gift) => {
    set(state => ({ recentGifts: [...state.recentGifts, gift] }));
    // 4 saniye sonra hediyeyi listeden kaldır (animasyon bitti)
    setTimeout(() => {
      set(state => ({
        recentGifts: state.recentGifts.filter(g => g.id !== gift.id),
      }));
    }, 4000);
  },

  setViewerCount: (count) => set({ viewerCount: count }),

  tickWatchTime: () => {
    const { watchedSeconds } = get();
    const newSeconds = watchedSeconds + 1;
    const isFreeTimeExpired = newSeconds >= 180; // 3 dakika = 180 saniye
    set({ watchedSeconds: newSeconds, isFreeTimeExpired });
  },

  setPayingViewer: (isPaying) => set({ isPayingViewer: isPaying }),

  resetStreamState: () => set(INITIAL_STATE),
}));
