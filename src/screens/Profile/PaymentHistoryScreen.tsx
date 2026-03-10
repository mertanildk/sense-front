import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import { palette, typography, spacing, radius } from '@theme/index';
import type { PaymentHistory, ApiResponse, PaginatedResponse } from '@appTypes/index';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PaymentHistoryScreen() {
  const navigation = useNavigation();
  const { data, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const r = await api.get<ApiResponse<PaginatedResponse<PaymentHistory>>>('/payments/history');
      return r.data.data.data;
    },
  });

  const statusColor = (s: string) =>
    s === 'success' ? palette.success : s === 'failed' ? palette.error : palette.warning;
  const statusLabel = (s: string) =>
    s === 'success' ? '✅ Başarılı' : s === 'failed' ? '❌ Başarısız' : '⏳ Beklemede';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ödeme Geçmişi</Text>
        <View style={{ width: 36 }} />
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.primary} /></View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Henüz ödeme geçmişi yok</Text></View>}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <Text style={styles.packageName}>{item.packageName}</Text>
                <Text style={styles.itemDate}>{format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemCoins}>🪙 +{item.coinAmount}</Text>
                <Text style={[styles.itemPrice, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
                <Text style={styles.itemPriceTry}>₺{item.priceTry}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
  backText: { color: palette.white, fontSize: typography.xl },
  title: { fontSize: typography.md, fontWeight: '700', color: palette.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: palette.grey2 },
  list: { padding: spacing.xl, gap: spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.dark2, borderRadius: radius.lg, padding: spacing.base },
  itemLeft: { gap: 4 },
  packageName: { color: palette.white, fontWeight: '700', fontSize: typography.base },
  itemDate: { color: palette.grey2, fontSize: typography.xs },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemCoins: { color: palette.accent, fontWeight: '700', fontSize: typography.base },
  itemPrice: { fontSize: typography.xs, fontWeight: '600' },
  itemPriceTry: { color: palette.grey3, fontSize: typography.sm },
});
