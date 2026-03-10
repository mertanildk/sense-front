import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import { DEFAULT_COIN_PACKAGES } from '@constants/index';
import type { CoinPackage, ApiResponse } from '@appTypes/index';

export default function CoinShopScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { data: packages } = useQuery({
    queryKey: ['coin-packages'],
    queryFn: async () => {
      const r = await api.get<ApiResponse<CoinPackage[]>>('/coins/packages');
      return r.data.data;
    },
    placeholderData: DEFAULT_COIN_PACKAGES as CoinPackage[],
  });

  const handlePurchase = async (pkg: CoinPackage) => {
    setPurchasing(pkg.id);
    try {
      // İyzico entegrasyonu burada yapılacak
      // Şimdilik mock flow
      Alert.alert(
        'Satın Al',
        `${pkg.coinAmount} jeton için ₺${pkg.priceTry} ödenecek.\n\n(İyzico ödeme ekranı burada açılacak)`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Onayla',
            onPress: async () => {
              // const result = await api.post('/payments/initiate', { packageId: pkg.id });
              // İyzico checkout URL'e yönlendir
              updateUser({ coinBalance: (user?.coinBalance ?? 0) + pkg.coinAmount });
              Alert.alert('✅ Başarılı', `${pkg.coinAmount} jeton hesabına eklendi!`);
            },
          },
        ],
      );
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Jeton Satın Al</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
        <Text style={styles.balanceValue}>🪙 {user?.coinBalance ?? 0}</Text>
        <Text style={styles.balanceSub}>jeton</Text>
      </View>

      <Text style={styles.sectionTitle}>Paket Seç</Text>

      <ScrollView contentContainerStyle={styles.packages} showsVerticalScrollIndicator={false}>
        {(packages ?? []).map(pkg => (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.packageCard, pkg.isPopular && styles.packageCardPopular]}
            onPress={() => handlePurchase(pkg)}
            activeOpacity={0.85}
            disabled={purchasing === pkg.id}
          >
            {pkg.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>⭐ POPÜLER</Text>
              </View>
            )}
            <View style={styles.packageLeft}>
              <Text style={styles.packageIcon}>🪙</Text>
              <View>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packageCoins}>{pkg.coinAmount.toLocaleString('tr-TR')} jeton</Text>
              </View>
            </View>
            <View style={styles.packageRight}>
              {purchasing === pkg.id ? (
                <ActivityIndicator color={pkg.isPopular ? palette.dark1 : palette.white} size="small" />
              ) : (
                <Text style={[styles.packagePrice, pkg.isPopular && styles.packagePricePopular]}>
                  ₺{pkg.priceTry}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.disclaimer}>
          Ödemeler İyzico altyapısı üzerinden güvenli şekilde işlenir.{'\n'}
          Satın alınan jetonlar iade edilemez.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { color: palette.white, fontSize: typography.xl },
  title: { fontSize: typography.md, fontWeight: '700', color: palette.white },
  balanceCard: { margin: spacing.xl, backgroundColor: palette.primary, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', shadowColor: palette.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: typography.sm },
  balanceValue: { fontSize: typography.xxxl, fontWeight: '800', color: palette.white, marginTop: spacing.xs },
  balanceSub: { color: 'rgba(255,255,255,0.8)', fontSize: typography.sm },
  sectionTitle: { paddingHorizontal: spacing.xl, fontSize: typography.sm, fontWeight: '700', color: palette.grey2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  packages: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: 40 },
  packageCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.dark2, borderRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: palette.dark4, position: 'relative', overflow: 'hidden' },
  packageCardPopular: { borderColor: palette.accent, backgroundColor: palette.accent },
  popularBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: spacing.sm, paddingVertical: 3, borderBottomLeftRadius: radius.sm },
  popularText: { fontSize: 9, fontWeight: '800', color: palette.dark1, letterSpacing: 0.5 },
  packageLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  packageIcon: { fontSize: 32 },
  packageName: { fontSize: typography.base, fontWeight: '700', color: palette.white },
  packageCoins: { fontSize: typography.sm, color: palette.grey3, marginTop: 2 },
  packageRight: {},
  packagePrice: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  packagePricePopular: { color: palette.dark1 },
  disclaimer: { color: palette.grey1, fontSize: typography.xs, textAlign: 'center', lineHeight: 18, marginTop: spacing.md },
});
