import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { streamService } from '@services/streamService';
import { socketService } from '@services/socketService';
import { useStreamStore } from '@store/streamStore';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import { STREAM_CATEGORIES } from '@constants/index';

type StreamPhase = 'setup' | 'live' | 'ended';

export default function StreamBroadcastScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { viewerCount, setActiveStream, resetStreamState } = useStreamStore();

  const [phase, setPhase] = useState<StreamPhase>('setup');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Yayın süresi sayacı
  useEffect(() => {
    if (phase !== 'live') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartStream = async () => {
    if (!title.trim()) { Alert.alert('Hata', 'Yayın başlığı giriniz'); return; }
    setIsLoading(true);
    try {
      const { stream } = await streamService.startStream({ title: title.trim(), category });
      setActiveStreamId(stream.id);
      setActiveStream(stream);
      socketService.connect();
      socketService.joinStream(stream.id);
      setPhase('live');
    } catch {
      Alert.alert('Hata', 'Yayın başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStream = () => {
    Alert.alert('Yayını Bitir', 'Yayını bitirmek istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet, Bitir', style: 'destructive',
        onPress: async () => {
          if (!activeStreamId) return;
          try {
            await streamService.endStream(activeStreamId);
            socketService.leaveStream(activeStreamId);
          } finally {
            resetStreamState();
            setPhase('ended');
          }
        },
      },
    ]);
  };

  // ─── Setup Phase ───────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yayın Başlat</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.cameraPreview}>
          <Text style={styles.cameraIcon}>📹</Text>
          <Text style={styles.cameraText}>Kamera önizlemesi{'\n'}(Agora SDK entegre edilecek)</Text>
        </View>

        <View style={styles.setupForm}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Yayın Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Yayının hakkında bir şeyler yaz..."
              placeholderTextColor={palette.grey1}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categories}>
              {STREAM_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, category === cat.id && styles.catChipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startBtn, isLoading && styles.btnDisabled]}
            onPress={handleStartStream}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={palette.white} />
              : <Text style={styles.startBtnText}>🔴 Yayını Başlat</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Live Phase ────────────────────────────────────────────────────────────
  if (phase === 'live') {
    return (
      <View style={styles.container}>
        <View style={styles.liveCameraArea}>
          <View style={styles.cameraPreview}>
            <Text style={styles.cameraIcon}>📹</Text>
          </View>

          {/* Overlay */}
          <View style={styles.liveTopBar}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>CANLI • {formatDuration(duration)}</Text>
            </View>
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerText}>👁 {viewerCount}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.endBtn} onPress={handleEndStream}>
            <Text style={styles.endBtnText}>■ Yayını Bitir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Ended Phase ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.endedEmoji}>🎉</Text>
      <Text style={styles.endedTitle}>Yayın Bitti!</Text>
      <Text style={styles.endedSub}>Süre: {formatDuration(duration)}</Text>
      <TouchableOpacity style={styles.startBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.startBtnText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: palette.white, fontSize: 16 },
  headerTitle: { fontSize: typography.md, fontWeight: '700', color: palette.white },
  cameraPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.dark3, margin: spacing.xl, borderRadius: radius.xl, gap: spacing.md },
  cameraIcon: { fontSize: 56 },
  cameraText: { color: palette.grey2, fontSize: typography.sm, textAlign: 'center' },
  setupForm: { padding: spacing.xl, gap: spacing.lg },
  fieldGroup: { gap: spacing.sm },
  label: { color: palette.grey3, fontSize: typography.sm, fontWeight: '600' },
  input: { backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52, color: palette.white, fontSize: typography.base },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: palette.dark3, borderWidth: 1, borderColor: palette.dark4 },
  catChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  catText: { color: palette.grey2, fontSize: typography.sm, fontWeight: '600' },
  catTextActive: { color: palette.white },
  startBtn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', shadowColor: palette.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnDisabled: { opacity: 0.6 },
  startBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
  // Live
  liveCameraArea: { flex: 1, position: 'relative' },
  liveTopBar: { position: 'absolute', top: 44, left: spacing.base, right: spacing.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.liveBadge, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.white },
  liveText: { color: palette.white, fontSize: typography.xs, fontWeight: '800' },
  viewerBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full },
  viewerText: { color: palette.white, fontSize: typography.xs, fontWeight: '600' },
  endBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: palette.error, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  endBtnText: { color: palette.white, fontWeight: '700', fontSize: typography.base },
  // Ended
  endedEmoji: { fontSize: 64 },
  endedTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  endedSub: { color: palette.grey2, fontSize: typography.base },
});
