import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@services/userService';
import { palette, typography, spacing, radius } from '@theme/index';
import type { CreditTransaction } from '@appTypes/index';

const TYPE_LABEL: Record<string, string> = {
  PURCHASE: '💳 Satın Alma',
  GIFT: '🎁 Hediye',
  WITHDRAWAL: '💸 Çekim',
  REFUND: '↩️ İade',
};

const TYPE_COLOR: Record<string, string> = {
  PURCHASE: palette.success,
  GIFT: palette.accent,
  WITHDRAWAL: palette.error,
  REFUND: palette.info,
};

export default function PaymentHistoryScreen() {
  const navigation = useNavigation();
  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => userService.getTransactions({ page: 0, size: 50 }),
  });

  const transactions = data?.content ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kredi Geçmişi</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.primary} /></View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 48 }}>📭</Text>
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
            </View>
          }
          renderItem={({ item }: { item: CreditTransaction }) => (
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemType}>{TYPE_LABEL[item.type] ?? item.type}</Text>
                <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
                {item.referenceId ? <Text style={styles.itemRef}>Ref: {item.referenceId}</Text> : null}
              </View>
              <Text style={[styles.itemAmount, { color: TYPE_COLOR[item.type] ?? palette.white }]}>
                {item.type === 'PURCHASE' || item.type === 'REFUND' ? '+' : '-'}{item.amount} 💎
              </Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: 60 },
  emptyText: { color: palette.grey2 },
  list: { padding: spacing.xl, gap: spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.dark2, borderRadius: radius.lg, padding: spacing.base },
  itemLeft: { gap: 3 },
  itemType: { color: palette.white, fontWeight: '700', fontSize: typography.base },
  itemDate: { color: palette.grey2, fontSize: typography.xs },
  itemRef: { color: palette.grey1, fontSize: typography.xs },
  itemAmount: { fontSize: typography.md, fontWeight: '800' },
});
