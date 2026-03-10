// RoomListScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import { palette, typography, spacing, radius } from '@theme/index';
import type { PrivateRoom, ApiResponse, PaginatedResponse, RoomStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<RoomStackParamList, 'RoomList'>;

export default function RoomListScreen() {
  const navigation = useNavigation<NavProp>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const r = await api.get<ApiResponse<PaginatedResponse<PrivateRoom>>>('/rooms');
      return r.data.data.data;
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔒 Özel Odalar</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('RoomCreate')}>
          <Text style={styles.createBtnText}>+ Oda Oluştur</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.primary} /></View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔒</Text>
              <Text style={styles.emptyTitle}>Henüz özel oda yok</Text>
              <Text style={styles.emptySub}>Arkadaşlarınla özel bir oda oluştur</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('RoomCreate')}>
                <Text style={styles.emptyBtnText}>Oda Oluştur</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => navigation.navigate('RoomView', { roomId: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.roomLeft}>
                <View style={styles.roomIcon}>
                  <Text style={styles.roomIconText}>{item.isLocked ? '🔒' : '🔓'}</Text>
                </View>
                <View>
                  <Text style={styles.roomTitle}>{item.title}</Text>
                  <Text style={styles.roomHost}>@{item.host.username}</Text>
                </View>
              </View>
              <View style={styles.roomRight}>
                <Text style={styles.memberCount}>{item.memberCount}/{item.maxMembers}</Text>
                <Text style={styles.memberLabel}>üye</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md },
  title: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  createBtn: { backgroundColor: palette.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  createBtnText: { color: palette.white, fontWeight: '700', fontSize: typography.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.xl, gap: spacing.md },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: typography.lg, fontWeight: '700', color: palette.white },
  emptySub: { color: palette.grey2, fontSize: typography.base, textAlign: 'center' },
  emptyBtn: { backgroundColor: palette.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full, marginTop: spacing.sm },
  emptyBtnText: { color: palette.white, fontWeight: '700' },
  roomCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.dark2, borderRadius: radius.xl, padding: spacing.base },
  roomLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roomIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  roomIconText: { fontSize: 22 },
  roomTitle: { color: palette.white, fontWeight: '700', fontSize: typography.base },
  roomHost: { color: palette.grey2, fontSize: typography.xs, marginTop: 2 },
  roomRight: { alignItems: 'center' },
  memberCount: { color: palette.primary, fontWeight: '800', fontSize: typography.md },
  memberLabel: { color: palette.grey2, fontSize: typography.xs },
});
