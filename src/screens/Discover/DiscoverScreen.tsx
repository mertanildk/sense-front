import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { streamService } from '@services/streamService';
import { palette, typography, spacing, radius, screen } from '@theme/index';
import { STREAM_CATEGORIES } from '@constants/index';
import type { Stream, DiscoverStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverHome'>;

const CARD_WIDTH = (screen.width - spacing.xl * 2 - spacing.md) / 2;

// ─── Stream Card ──────────────────────────────────────────────────────────────
function StreamCard({ stream, onPress }: { stream: Stream; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.thumbnailEmoji}>📡</Text>
        </View>

        {/* LIVE badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>

        {/* Viewer count */}
        <View style={styles.viewerBadge}>
          <Text style={styles.viewerText}>👁 {stream.viewerCount.toLocaleString('tr-TR')}</Text>
        </View>

        {/* Gradient overlay */}
        <View style={styles.cardGradient} />
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.hostRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarEmoji}>
              {stream.host.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.hostName} numberOfLines={1}>{stream.host.username}</Text>
        </View>
        <Text style={styles.streamTitle} numberOfLines={2}>{stream.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Discover Screen ──────────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['streams', selectedCategory],
    queryFn: () => streamService.getActiveStreams(1, selectedCategory),
    refetchInterval: 30_000, // Her 30 saniyede bir yenile
  });

  const streams = data?.data ?? [];
  const filteredStreams = searchQuery
    ? streams.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.host.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : streams;

  const handleStreamPress = useCallback(
    (stream: Stream) => {
      navigation.navigate('StreamView', {
        streamId: stream.id,
        agoraChannel: stream.agoraChannel ?? stream.id,
      });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Keşfet</Text>
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

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {STREAM_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
      ) : filteredStreams.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Sonuç bulunamadı' : 'Şu an aktif yayın yok'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStreams}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.primary}
            />
          }
          renderItem={({ item }) => (
            <StreamCard stream={item} onPress={() => handleStreamPress(item)} />
          )}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md, gap: spacing.md },
  headerTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.dark3, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, gap: spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: palette.white, fontSize: typography.sm },
  clearIcon: { color: palette.grey2, fontSize: 14 },
  categories: { maxHeight: 48 },
  categoriesContent: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingVertical: spacing.xs },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: palette.dark3, borderWidth: 1, borderColor: palette.dark4 },
  categoryChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  categoryText: { fontSize: typography.sm, color: palette.grey2, fontWeight: '600' },
  categoryTextActive: { color: palette.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorIcon: { fontSize: 40 },
  errorText: { color: palette.grey2, fontSize: typography.base },
  retryBtn: { backgroundColor: palette.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.full },
  retryText: { color: palette.white, fontWeight: '700' },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: palette.grey2, fontSize: typography.base },
  grid: { padding: spacing.xl, paddingTop: spacing.md },
  row: { gap: spacing.md, marginBottom: spacing.md },
  // Card
  card: { width: CARD_WIDTH, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: palette.dark2 },
  thumbnail: { height: CARD_WIDTH * 1.2, position: 'relative' },
  thumbnailPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  thumbnailEmoji: { fontSize: 40, opacity: 0.4 },
  liveBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.liveBadge, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, gap: 4 },
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
