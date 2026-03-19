import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  AudioSession,
  LiveKitRoom,
  useTracks,
  VideoTrack,
  isTrackReference,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { roomService } from '@services/roomService';
import { socketService } from '@services/socketService';
import { useStreamStore } from '@store/streamStore';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import { STREAM, GIFT_TYPES } from '@constants/index';
import type { DiscoverStackParamList } from '@appTypes/index';

type RouteType = RouteProp<DiscoverStackParamList, 'RoomView'>;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const LIVEKIT_URL = 'wss://wss.capulus.co/';

// ─── Host Video — LiveKitRoom içinde çalışır ──────────────────────────────────
function HostVideo() {
  // Sadece abone olunan (host'un yayınladığı) kamera track'lerini al
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const hostTrack = tracks[0];

  if (!hostTrack || !isTrackReference(hostTrack)) {
    return (
      <View style={styles.videoPlaceholder}>
        <Text style={{ fontSize: 48 }}>📡</Text>
        <Text style={{ color: palette.grey2, fontSize: typography.sm, marginTop: spacing.sm }}>
          Yayıncı bekleniyor...
        </Text>
      </View>
    );
  }

  return (
    <VideoTrack
      style={StyleSheet.absoluteFill}
      trackRef={hostTrack}
      objectFit="cover"
    />
  );
}

// ─── Gift Modal ────────────────────────────────────────────────────────────────
function GiftModal({ visible, roomId, onClose }: {
  visible: boolean; roomId: number; onClose: () => void;
}) {
  const { user, refreshUser } = useAuthStore();
  const [sending, setSending] = useState<string | null>(null);

  const handleSendGift = async (giftType: string, credits: number) => {
    setSending(giftType);
    try {
      await roomService.sendGift(roomId, { creditAmount: credits, giftType });
      await refreshUser();
      onClose();
    } catch {}
    finally { setSending(null); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.giftOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.giftSheet}>
          <Text style={styles.giftSheetTitle}>Hediye Gönder</Text>
          <Text style={styles.giftSheetBalance}>
            Bakiye: <Text style={{ color: palette.accent }}>💎 {user?.creditBalance ?? 0}</Text>
          </Text>
          <View style={styles.giftGrid}>
            {GIFT_TYPES.map(gift => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftItem}
                onPress={() => handleSendGift(gift.id, gift.credits)}
                disabled={!!sending}
              >
                {sending === gift.id
                  ? <ActivityIndicator color={palette.primary} />
                  : <Text style={styles.giftEmoji}>{gift.emoji}</Text>}
                <Text style={styles.giftLabel}>{gift.label}</Text>
                <Text style={styles.giftCredits}>💎 {gift.credits}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Paywall Modal ─────────────────────────────────────────────────────────────
function PaywallModal({ visible, onClose, onBuyCredits }: {
  visible: boolean; onClose: () => void; onBuyCredits: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallSheet}>
          <Text style={{ fontSize: 48 }}>⏰</Text>
          <Text style={styles.paywallTitle}>Ücretsiz süren doldu!</Text>
          <Text style={styles.paywallSubtitle}>
            İzlemeye devam etmek için kredi satın al.{'\n'}
            Dakika başı <Text style={{ color: palette.accent, fontWeight: '700' }}>{STREAM.CREDITS_PER_MINUTE} kredi</Text> harcanır.
          </Text>
          <TouchableOpacity style={styles.paywallBuyBtn} onPress={onBuyCredits}>
            <Text style={styles.paywallBuyText}>💎 Kredi Satın Al</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paywallCloseBtn} onPress={onClose}>
            <Text style={styles.paywallCloseText}>Yayından Ayrıl</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── İzleyici içeriği — LiveKitRoom içinde render edilir ─────────────────────
function ViewerContent({ room, roomId, onClose }: any) {
  const {
    viewerCount, comments, recentGifts,
    watchedSeconds, isFreeTimeExpired, isPayingViewer,
    addComment, addGift, setViewerCount, tickWatchTime, resetStreamState,
  } = useStreamStore();

  const [commentText, setCommentText] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const commentListRef = useRef<FlatList>(null);
  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    socketService.connect();
    socketService.joinStream(String(roomId));
    const unsubComment = socketService.onNewComment(addComment as any);
    const unsubGift    = socketService.onNewGift(addGift as any);
    const unsubViewers = socketService.onViewerCountUpdate(({ count }) => setViewerCount(count));
    const unsubEnded   = socketService.onStreamEnded(() => onClose());
    return () => {
      unsubComment(); unsubGift(); unsubViewers(); unsubEnded();
      socketService.leaveStream(String(roomId));
      roomService.leaveRoom(roomId).catch(() => {});
    };
  }, [roomId]);

  useEffect(() => {
    watchTimerRef.current = setInterval(() => tickWatchTime(), 1000);
    return () => { if (watchTimerRef.current) clearInterval(watchTimerRef.current); };
  }, []);

  useEffect(() => {
    if (isFreeTimeExpired && !isPayingViewer) {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
      setShowPaywall(true);
    }
  }, [isFreeTimeExpired, isPayingViewer]);

  useEffect(() => {
    return () => resetStreamState();
  }, []);

  const handleSendComment = useCallback(() => {
    const content = commentText.trim();
    if (!content) return;
    socketService.sendComment(String(roomId), content);
    setCommentText('');
  }, [commentText, roomId]);

  const remainingFree = Math.max(0, STREAM.FREE_WATCH_SECONDS - watchedSeconds);
  const showWarning = remainingFree <= STREAM.FREE_WATCH_WARNING_SECONDS && remainingFree > 0 && !isPayingViewer;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Video */}
      <View style={styles.videoArea}>
        <HostVideo />

        <View style={styles.topBar}>
          <View style={styles.hostInfo}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>{room?.hostUsername?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.hostName}>{room?.hostUsername}</Text>
              <Text style={styles.streamTitleText} numberOfLines={1}>{room?.title}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerText}>👁 {viewerCount}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>

        {showWarning && (
          <View style={styles.timerWarning}>
            <Text style={styles.timerWarningText}>⏱ {remainingFree}s kaldı</Text>
          </View>
        )}

        <View style={styles.giftsContainer}>
          {(recentGifts as any[]).map((gift: any) => (
            <View key={gift.id} style={styles.giftNotif}>
              <Text style={{ fontSize: 20 }}>🎁</Text>
              <Text style={styles.giftNotifText}>
                <Text style={{ color: palette.accent, fontWeight: '700' }}>{gift.sender?.username}</Text>
                {' '}💎 {gift.coinAmount}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Yorumlar */}
      <View style={styles.commentsSection}>
        <FlatList
          ref={commentListRef}
          data={comments as any[]}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentsList}
          onContentSizeChange={() => commentListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={styles.noComments}>İlk yorumu sen yap!</Text>}
          renderItem={({ item }: any) => (
            <View style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{item.user?.username?.charAt(0)?.toUpperCase()}</Text>
              </View>
              <View style={styles.commentBubble}>
                <Text style={styles.commentUser}>{item.user?.username}</Text>
                <Text style={styles.commentText}>{item.content}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorum yaz..."
              placeholderTextColor={palette.grey1}
              value={commentText}
              onChangeText={setCommentText}
              maxLength={STREAM.COMMENT_MAX_LENGTH}
            />
          </View>
          <TouchableOpacity style={styles.giftBtn} onPress={() => setShowGiftModal(true)}>
            <Text style={{ fontSize: 18 }}>🎁</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Text style={styles.sendBtnIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PaywallModal
        visible={showPaywall}
        onClose={() => { setShowPaywall(false); onClose(); }}
        onBuyCredits={() => { setShowPaywall(false); }}
      />
      <GiftModal visible={showGiftModal} roomId={roomId} onClose={() => setShowGiftModal(false)} />
    </KeyboardAvoidingView>
  );
}

// ─── Ana ekran ────────────────────────────────────────────────────────────────
export default function StreamViewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { roomId } = route.params;
  const { setActiveStream } = useStreamStore();

  useEffect(() => {
    AudioSession.startAudioSession();
    return () => { AudioSession.stopAudioSession(); };
  }, []);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomService.getRoom(roomId),
  });

  const { data: joinData } = useQuery({
    queryKey: ['join-room', roomId],
    queryFn: () => roomService.joinRoom(roomId),
    enabled: !!room,
  });

  useEffect(() => {
    if (room) setActiveStream(room as any);
  }, [room]);

  if (isLoading || !joinData?.videoToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.primary} size="large" />
        <Text style={{ color: palette.grey2, marginTop: spacing.md }}>Bağlanıyor...</Text>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={joinData.videoToken}
      connect={true}
      options={{ adaptiveStream: { pixelDensity: 'screen' } }}
      audio={false}
      video={false}
    >
      <ViewerContent
        room={room}
        roomId={roomId}
        onClose={() => navigation.goBack()}
      />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  loadingContainer: { flex: 1, backgroundColor: palette.dark1, alignItems: 'center', justifyContent: 'center' },
  videoArea: { height: SCREEN_HEIGHT * 0.55, position: 'relative', backgroundColor: '#000' },
  videoPlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.dark3 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, paddingTop: 44, backgroundColor: 'rgba(0,0,0,0.4)' },
  hostInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: palette.white },
  hostAvatarText: { color: palette.white, fontWeight: '800', fontSize: typography.sm },
  hostName: { color: palette.white, fontWeight: '700', fontSize: typography.sm },
  streamTitleText: { color: 'rgba(255,255,255,0.8)', fontSize: typography.xs, maxWidth: 180 },
  viewerBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  viewerText: { color: palette.white, fontSize: typography.xs, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: palette.white, fontSize: 14 },
  liveBadge: { position: 'absolute', top: 100, left: spacing.base, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3F3F', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, gap: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.white },
  liveText: { color: palette.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  timerWarning: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', backgroundColor: 'rgba(255,63,108,0.9)', paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: radius.full },
  timerWarningText: { color: palette.white, fontWeight: '700', fontSize: typography.sm },
  giftsContainer: { position: 'absolute', left: spacing.base, bottom: spacing.base, gap: spacing.xs },
  giftNotif: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.lg, padding: spacing.sm, gap: spacing.sm, maxWidth: 260 },
  giftNotifText: { color: palette.white, fontSize: typography.xs, flex: 1 },
  commentsSection: { flex: 1, backgroundColor: palette.dark1 },
  commentsList: { padding: spacing.base, gap: spacing.sm },
  noComments: { color: palette.grey1, fontSize: typography.sm, textAlign: 'center', marginTop: spacing.xl },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.dark4, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentAvatarText: { color: palette.white, fontSize: typography.xs, fontWeight: '700' },
  commentBubble: { backgroundColor: palette.dark3, borderRadius: radius.md, padding: spacing.sm, flex: 1 },
  commentUser: { color: palette.primary, fontSize: typography.xs, fontWeight: '700', marginBottom: 2 },
  commentText: { color: palette.white, fontSize: typography.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: palette.dark4 },
  commentInputWrapper: { flex: 1, backgroundColor: palette.dark3, borderRadius: radius.full, paddingHorizontal: spacing.base, height: 40, justifyContent: 'center' },
  commentInput: { color: palette.white, fontSize: typography.sm },
  giftBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnIcon: { color: palette.white, fontSize: 16 },
  paywallOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  paywallSheet: { backgroundColor: palette.dark2, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: 40, alignItems: 'center', gap: spacing.md },
  paywallTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  paywallSubtitle: { fontSize: typography.base, color: palette.grey2, textAlign: 'center', lineHeight: 22 },
  paywallBuyBtn: { width: '100%', height: 54, backgroundColor: palette.accent, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  paywallBuyText: { color: palette.dark1, fontSize: typography.md, fontWeight: '800' },
  paywallCloseBtn: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  paywallCloseText: { color: palette.grey2, fontSize: typography.base },
  giftOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  giftSheet: { backgroundColor: palette.dark2, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: 40 },
  giftSheetTitle: { fontSize: typography.lg, fontWeight: '800', color: palette.white, textAlign: 'center', marginBottom: spacing.xs },
  giftSheetBalance: { fontSize: typography.sm, color: palette.grey2, textAlign: 'center', marginBottom: spacing.lg },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
  giftItem: { width: 80, alignItems: 'center', backgroundColor: palette.dark3, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  giftEmoji: { fontSize: 32 },
  giftLabel: { color: palette.white, fontSize: typography.xs, fontWeight: '600' },
  giftCredits: { color: palette.accent, fontSize: typography.xs, fontWeight: '700' },
});
