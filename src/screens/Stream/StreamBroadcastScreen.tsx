import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AudioSession,
  LiveKitRoom,
  useTracks,
  VideoTrack,
  isTrackReference,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { roomService } from '@services/roomService';
import { useStreamStore } from '@store/streamStore';
import { palette, typography, spacing, radius } from '@theme/index';

type Phase = 'setup' | 'live' | 'ended';
const LIVEKIT_URL = 'wss://wss.capulus.co/';

// ─── Yayıncı Video View — LiveKitRoom içinde çalışır ─────────────────────────
function BroadcastView({ onEnd, duration, viewerCount }: {
  onEnd: () => void;
  duration: number;
  viewerCount: number;
}) {
  // Kendi kamera track'ini al
  const tracks = useTracks([Track.Source.Camera]);
  const myTrack = tracks[0];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View style={styles.liveCameraArea}>
      {myTrack && isTrackReference(myTrack) ? (
        <VideoTrack
          style={StyleSheet.absoluteFill}
          trackRef={myTrack}
          objectFit="cover"
        />
      ) : (
        <View style={styles.cameraPreview}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.cameraText}>Kamera başlatılıyor...</Text>
        </View>
      )}

      <View style={styles.liveTopBar}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI • {formatDuration(duration)}</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Text style={styles.viewerText}>👁 {viewerCount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.endBtn} onPress={onEnd}>
        <Text style={styles.endBtnText}>■ Yayını Bitir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Ana ekran ────────────────────────────────────────────────────────────────
export default function StreamBroadcastScreen() {
  const navigation = useNavigation();
  const { viewerCount, resetStreamState } = useStreamStore();

  const [phase, setPhase] = useState<Phase>('setup');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [lkToken, setLkToken] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Audio session başlat
    AudioSession.startAudioSession();
    return () => { AudioSession.stopAudioSession(); };
  }, []);

  useEffect(() => {
    if (phase !== 'live') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleStartStream = async () => {
    if (!title.trim()) { Alert.alert('Hata', 'Yayın başlığı giriniz'); return; }
    setIsLoading(true);
    try {
      const createdRoom = await roomService.createRoom({ title: title.trim() });
      setActiveRoomId(createdRoom.id);
      const joinData = await roomService.joinRoom(createdRoom.id);
      setLkToken(joinData.videoToken);
      setPhase('live');
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message ?? 'Yayın başlatılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStream = () => {
    Alert.alert('Yayını Bitir', 'Emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet, Bitir', style: 'destructive',
        onPress: async () => {
          if (activeRoomId) {
            try { await roomService.endRoom(activeRoomId); } catch {}
          }
          resetStreamState();
          setPhase('ended');
        },
      },
    ]);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ─── Setup ──────────────────────────────────────────────────────────────────
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
          <Text style={styles.cameraText}>Yayın başladığında kamera görünecek</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Yayın Başlığı</Text>
          <TextInput
            style={styles.input}
            placeholder="Yayının hakkında bir şeyler yaz..."
            placeholderTextColor={palette.grey1}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TouchableOpacity
            style={[styles.startBtn, isLoading && styles.btnDisabled]}
            onPress={handleStartStream}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={palette.white} />
              : <Text style={styles.startBtnText}>🔴 Yayını Başlat</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Live ────────────────────────────────────────────────────────────────────
  if (phase === 'live' && lkToken) {
    return (
      <View style={styles.container}>
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={lkToken}
          connect={true}
          options={{ adaptiveStream: { pixelDensity: 'screen' } }}
          audio={true}
          video={true}
        >
          <BroadcastView
            onEnd={handleEndStream}
            duration={duration}
            viewerCount={viewerCount}
          />
        </LiveKitRoom>
      </View>
    );
  }

  // ─── Ended ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, styles.center]}>
      <Text style={{ fontSize: 64 }}>🎉</Text>
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
  form: { padding: spacing.xl, gap: spacing.md },
  label: { color: palette.grey3, fontSize: typography.sm, fontWeight: '600' },
  input: { backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52, color: palette.white, fontSize: typography.base },
  startBtn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  startBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
  liveCameraArea: { flex: 1, position: 'relative', backgroundColor: '#000' },
  liveTopBar: { position: 'absolute', top: 44, left: spacing.base, right: spacing.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF3F3F', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.white },
  liveText: { color: palette.white, fontSize: typography.xs, fontWeight: '800' },
  viewerBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full },
  viewerText: { color: palette.white, fontSize: typography.xs, fontWeight: '600' },
  endBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: palette.error, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  endBtnText: { color: palette.white, fontWeight: '700', fontSize: typography.base },
  endedTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  endedSub: { color: palette.grey2, fontSize: typography.base },
});
