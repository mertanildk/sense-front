import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Modal,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { streamService } from '@services/streamService';
import { socketService } from '@services/socketService';
import { useStreamStore } from '@store/streamStore';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import { STREAM } from '@constants/index';
import type { Comment, Gift, DiscoverStackParamList } from '@appTypes/index';

type RouteType = RouteProp<DiscoverStackParamList, 'StreamView'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Comment Item ─────────────────────────────────────────────────────────────
const CommentItem = React.memo(({ comment }: { comment: Comment }) => (
  <View style={styles.commentItem}>
    <View style={styles.commentAvatar}>
      <Text style={styles.commentAvatarText}>{comment.user.username.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.commentBubble}>
      <Text style={styles.commentUser}>{comment.user.username}</Text>
      <Text style={styles.commentText}>{comment.content}</Text>
    </View>
  </View>
));

// ─── Gift Animation ───────────────────────────────────────────────────────────
const GiftNotification = ({ gift }: { gift: Gift }) => (
  <View style={styles.giftNotif}>
    <Text style={styles.giftIcon}>🎁</Text>
    <Text style={styles.giftText}>
      <Text style={styles.giftSender}>{gift.sender.username}</Text>
      {' '}tarafından{' '}
      <Text style={styles.giftCoins}>{gift.coinAmount} 🪙</Text>
    </Text>
  </View>
);

// ─── Coin Paywall Modal ───────────────────────────────────────────────────────
const PaywallModal = ({ visible, onClose, onBuyCoins }: {
  visible: boolean;
  onClose: () => void;
  onBuyCoins: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.paywallOverlay}>
      <View style={styles.paywallSheet}>
        <Text style={styles.paywallEmoji}>⏰</Text>
        <Text style={styles.paywallTitle}>Ücretsiz süren doldu!</Text>
        <Text style={styles.paywallSubtitle}>
          Yayını izlemeye devam etmek için jeton satın al.{'\n'}
          Her dakika <Text style={styles.paywallAccent}>{STREAM.COINS_PER_MINUTE} jeton</Text> harcanır.
        </Text>
        <TouchableOpacity style={styles.paywallBuyBtn} onPress={onBuyCoins}>
          <Text style={styles.paywallBuyText}>🪙 Jeton Satın Al</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paywallCloseBtn} onPress={onClose}>
          <Text style={styles.paywallCloseText}>Yayından Ayrıl</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Main StreamView Screen ───────────────────────────────────────────────────
export default function StreamViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { streamId } = route.params;
  const { user } = useAuthStore();

  const {
    viewerCount, comments, recentGifts,
    watchedSeconds, isFreeTimeExpired, isPayingViewer,
    setActiveStream, addComment, addGift, setViewerCount,
    tickWatchTime, setPayingViewer, resetStreamState,
  } = useStreamStore();

  const [commentText, setCommentText] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const commentListRef = useRef<FlatList>(null);
  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch stream ──────────────────────────────────────────────────────────
  const { data: stream, isLoading } = useQuery({
    queryKey: ['stream', streamId],
    queryFn: () => streamService.getStream(streamId),
    onSuccess: (data) => setActiveStream(data),
  } as any);

  // ─── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    socketService.connect();
    socketService.joinStream(streamId);

    const unsubComment = socketService.onNewComment(addComment);
    const unsubGift = socketService.onNewGift(addGift);
    const unsubViewers = socketService.onViewerCountUpdate(({ count }) => setViewerCount(count));
    const unsubEnded = socketService.onStreamEnded(() => {
      navigation.goBack();
    });

    return () => {
      unsubComment();
      unsubGift();
      unsubViewers();
      unsubEnded();
      socketService.leaveStream(streamId);
    };
  }, [streamId]);

  // ─── Watch Timer (3 dk kuralı) ─────────────────────────────────────────────
  useEffect(() => {
    watchTimerRef.current = setInterval(() => {
      tickWatchTime();
    }, 1000);
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, []);

  // ─── Paywall trigger ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isFreeTimeExpired && !isPayingViewer) {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
      setShowPaywall(true);
    }
  }, [isFreeTimeExpired, isPayingViewer]);

  // ─── Coin deduction timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (isPayingViewer) {
      coinTimerRef.current = setInterval(async () => {
        // Backend'e dakika başı ücret düş
        try {
          await streamService.leaveStream(streamId, 60);
        } catch {
          // coin bittiyse backend 402 döner
          setPayingViewer(false);
          setShowPaywall(true);
        }
      }, 60_000);
    }
    return () => {
      if (coinTimerRef.current) clearInterval(coinTimerRef.current);
    };
  }, [isPayingViewer, streamId]);

  // ─── Cleanup on exit ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      streamService.leaveStream(streamId, watchedSeconds).catch(() => {});
      resetStreamState();
    };
  }, []);

  // ─── Auto scroll comments ──────────────────────────────────────────────────
  useEffect(() => {
    if (comments.length > 0) {
      setTimeout(() => commentListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [comments.length]);

  const handleSendComment = useCallback(async () => {
    const content = commentText.trim();
    if (!content || isSendingComment) return;
    setIsSendingComment(true);
    setCommentText('');
    socketService.sendComment(streamId, content);
    setIsSendingComment(false);
  }, [commentText, isSendingComment, streamId]);

  // Timer display
  const remainingFreeSeconds = Math.max(0, STREAM.FREE_WATCH_SECONDS - watchedSeconds);
  const showTimerWarning = remainingFreeSeconds <= STREAM.FREE_WATCH_WARNING_SECONDS && remainingFreeSeconds > 0 && !isPayingViewer;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Video area (Agora RTC will render here) */}
      <View style={styles.videoArea}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoIcon}>📡</Text>
          <Text style={styles.videoPlaceholderText}>Agora RTC Buraya Entegre Edilecek</Text>
        </View>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.hostInfo}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>
                {stream?.host.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.hostName}>{stream?.host.username}</Text>
              <Text style={styles.streamTitleText} numberOfLines={1}>{stream?.title}</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            {/* Viewer count */}
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerText}>👁 {viewerCount}</Text>
            </View>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LIVE badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>

        {/* Free timer warning */}
        {showTimerWarning && (
          <View style={styles.timerWarning}>
            <Text style={styles.timerWarningText}>
              ⏱ {remainingFreeSeconds}s kaldı
            </Text>
          </View>
        )}

        {/* Gift notifications */}
        <View style={styles.giftsContainer}>
          {recentGifts.map(gift => (
            <GiftNotification key={gift.id} gift={gift} />
          ))}
        </View>
      </View>

      {/* Comments section */}
      <View style={styles.commentsSection}>
        <FlatList
          ref={commentListRef}
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={
            <Text style={styles.noComments}>Henüz yorum yok. İlk yorumu sen yap!</Text>
          }
        />

        {/* Comment Input */}
        <View style={styles.inputRow}>
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorum yaz..."
              placeholderTextColor={palette.grey1}
              value={commentText}
              onChangeText={setCommentText}
              maxLength={STREAM.COMMENT_MAX_LENGTH}
              multiline={false}
            />
          </View>

          {/* Gift button */}
          <TouchableOpacity style={styles.giftBtn}>
            <Text style={styles.giftBtnIcon}>🎁</Text>
          </TouchableOpacity>

          {/* Send */}
          <TouchableOpacity
            style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Text style={styles.sendBtnIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          navigation.goBack();
        }}
        onBuyCoins={() => {
          setShowPaywall(false);
          // CoinShop'a yönlendir
        }}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  loadingContainer: { flex: 1, backgroundColor: palette.dark1, alignItems: 'center', justifyContent: 'center' },
  // Video
  videoArea: { height: SCREEN_HEIGHT * 0.55, position: 'relative', backgroundColor: '#000' },
  videoPlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.dark3 },
  videoIcon: { fontSize: 48, marginBottom: spacing.sm },
  videoPlaceholderText: { color: palette.grey2, fontSize: typography.sm },
  // Top bar
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, paddingTop: 44, backgroundColor: 'rgba(0,0,0,0.4)' },
  hostInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: palette.white },
  hostAvatarText: { color: palette.white, fontWeight: '800', fontSize: typography.sm },
  hostName: { color: palette.white, fontWeight: '700', fontSize: typography.sm },
  streamTitleText: { color: palette.whiteA80, fontSize: typography.xs, maxWidth: 180 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  viewerBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  viewerText: { color: palette.white, fontSize: typography.xs, fontWeight: '600' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: palette.white, fontSize: 14 },
  // Live badge
  liveBadge: { position: 'absolute', top: 100, left: spacing.base, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.liveBadge, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, gap: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.white },
  liveText: { color: palette.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  // Timer warning
  timerWarning: { position: 'absolute', bottom: spacing.xl, left: '50%', transform: [{ translateX: -70 }], backgroundColor: 'rgba(255,63,108,0.9)', paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: radius.full },
  timerWarningText: { color: palette.white, fontWeight: '700', fontSize: typography.sm },
  // Gifts
  giftsContainer: { position: 'absolute', left: spacing.base, bottom: spacing.base, gap: spacing.xs },
  giftNotif: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.lg, padding: spacing.sm, gap: spacing.sm, maxWidth: 260 },
  giftIcon: { fontSize: 20 },
  giftText: { color: palette.white, fontSize: typography.xs, flex: 1 },
  giftSender: { fontWeight: '700', color: palette.accent },
  giftCoins: { fontWeight: '700', color: palette.accent },
  // Comments
  commentsSection: { flex: 1, backgroundColor: palette.dark1 },
  commentsList: { padding: spacing.base, gap: spacing.sm },
  noComments: { color: palette.grey1, fontSize: typography.sm, textAlign: 'center', marginTop: spacing.xl },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.dark4, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentAvatarText: { color: palette.white, fontSize: typography.xs, fontWeight: '700' },
  commentBubble: { backgroundColor: palette.dark3, borderRadius: radius.md, padding: spacing.sm, flex: 1 },
  commentUser: { color: palette.primary, fontSize: typography.xs, fontWeight: '700', marginBottom: 2 },
  commentText: { color: palette.white, fontSize: typography.sm },
  // Input row
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: palette.dark4 },
  commentInputWrapper: { flex: 1, backgroundColor: palette.dark3, borderRadius: radius.full, paddingHorizontal: spacing.base, height: 40, justifyContent: 'center' },
  commentInput: { color: palette.white, fontSize: typography.sm },
  giftBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  giftBtnIcon: { fontSize: 18 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnIcon: { color: palette.white, fontSize: 16 },
  // Paywall
  paywallOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  paywallSheet: { backgroundColor: palette.dark2, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: 40, alignItems: 'center', gap: spacing.md },
  paywallEmoji: { fontSize: 48 },
  paywallTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  paywallSubtitle: { fontSize: typography.base, color: palette.grey2, textAlign: 'center', lineHeight: 22 },
  paywallAccent: { color: palette.accent, fontWeight: '700' },
  paywallBuyBtn: { width: '100%', height: 54, backgroundColor: palette.accent, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', shadowColor: palette.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  paywallBuyText: { color: palette.dark1, fontSize: typography.md, fontWeight: '800' },
  paywallCloseBtn: { width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' },
  paywallCloseText: { color: palette.grey2, fontSize: typography.base },
});
