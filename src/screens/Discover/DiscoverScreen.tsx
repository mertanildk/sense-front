import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { roomService } from '@services/roomService';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius, screen } from '@theme/index';
import type { Room, DiscoverStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverHome'>;
const CARD_WIDTH = (screen.width - spacing.xl * 2 - spacing.md) / 2;

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room, onPress }: { room: Room; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumbnail}>
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.thumbnailEmoji}>📡</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Text style={styles.viewerText}>👁 {room.viewerCount}</Text>
        </View>
        <View style={styles.cardGradient} />
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.hostRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarEmoji}>{room.hostUsername.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.hostName} numberOfLines={1}>{room.hostUsername}</Text>
        </View>
        <Text style={styles.streamTitle} numberOfLines={2}>{room.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Discover Screen ──────────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const isModerator = user?.role === 'MODERATOR';
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getLiveRooms({ page: 0, size: 20 }),
    refetchInterval: 30_000,
  });

  const rooms = data?.content ?? [];
  const filteredRooms = searchQuery
    ? rooms.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hostUsername.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rooms;

  const handleRoomPress = useCallback(
    (room: Room) => navigation.navigate('RoomView', { roomId: room.id }),
    [navigation],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Keşfet</Text>
        {isModerator && (
          <TouchableOpacity
            style={styles.broadcastBtn}
            onPress={() => navigation.navigate('StreamBroadcast')}
            activeOpacity={0.85}
          >
            <View style={styles.broadcastDot} />
            <Text style={styles.broadcastBtnText}>Yayın Başlat</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Yayın veya yayıncı ara..."
            placeholderTextColor={palette.grey1}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Yayınlar yüklenemedi</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : filteredRooms.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Sonuç bulunamadı' : 'Şu an aktif yayın yok'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary} />}
          renderItem={({ item }) => <RoomCard room={item} onPress={() => handleRoomPress(item)} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm },
  headerTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  broadcastBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, shadowColor: palette.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  broadcastDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.white },
  broadcastBtnText: { color: palette.white, fontSize: typography.sm, fontWeight: '700' },
  searchContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.dark3, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, gap: spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: palette.white, fontSize: typography.sm },
  clearIcon: { color: palette.grey2, fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorIcon: { fontSize: 40 },
  errorText: { color: palette.grey2, fontSize: typography.base },
  retryBtn: { backgroundColor: palette.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.full },
  retryText: { color: palette.white, fontWeight: '700' },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: palette.grey2, fontSize: typography.base },
  grid: { padding: spacing.xl, paddingTop: spacing.md },
  row: { gap: spacing.md, marginBottom: spacing.md },
  card: { width: CARD_WIDTH, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: palette.dark2 },
  thumbnail: { height: CARD_WIDTH * 1.2, position: 'relative' },
  thumbnailPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  thumbnailEmoji: { fontSize: 40, opacity: 0.4 },
  liveBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3F3F', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.white },
  liveText: { color: palette.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  viewerBadge: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  viewerText: { color: palette.white, fontSize: 11, fontWeight: '600' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(10,10,15,0.6)' },
  cardInfo: { padding: spacing.sm, gap: 4 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  avatarSmall: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 11, color: palette.white, fontWeight: '700' },
  hostName: { fontSize: typography.xs, color: palette.grey3, fontWeight: '600', flex: 1 },
  streamTitle: { fontSize: typography.sm, color: palette.white, fontWeight: '600', lineHeight: 18 },
});
