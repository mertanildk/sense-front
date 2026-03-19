import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@store/authStore';
import { paymentService, CREDIT_PACKAGES, CreditPackage } from '@services/paymentService';
import { palette, typography, spacing, radius } from '@theme/index';

export default function CoinShopScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuthStore();
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasing(pkg.id);
    try {
      // Stripe PaymentIntent oluştur
      const intent = await paymentService.createPaymentIntent({
        amountCents: pkg.amountCents,
        currency: pkg.currency,
        creditAmount: pkg.creditAmount,
      });

      // TODO: Stripe SDK ile ödeme akışını başlat
      // Şimdilik bilgi göster
      Alert.alert(
        '💳 Ödeme',
        `${pkg.creditAmount} kredi için ₺${(pkg.amountCents / 100).toFixed(2)} ödenecek.\n\nStripe entegrasyonu tamamlandığında burada ödeme ekranı açılacak.\n\nPaymentIntent: ${intent.paymentIntentId}`,
        [
          { text: 'Kapat', style: 'cancel' },
          {
            text: 'Simüle Et (Test)',
            onPress: async () => {
              // Test: webhook ile ödeme tamamlandı simülasyonu
              await refreshUser();
              Alert.alert('✅ Başarılı', `${pkg.creditAmount} kredi hesabına eklendi!`);
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message ?? 'Ödeme başlatılamadı.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kredi Satın Al</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Bakiye */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
        <Text style={styles.balanceValue}>💎 {user?.creditBalance ?? 0}</Text>
        <Text style={styles.balanceSub}>kredi</Text>
      </View>

      <Text style={styles.sectionTitle}>Paket Seç</Text>

      <ScrollView contentContainerStyle={styles.packages} showsVerticalScrollIndicator={false}>
        {CREDIT_PACKAGES.map(pkg => (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.packageCard, pkg.isPopular && styles.packageCardPopular]}
            onPress={() => handlePurchase(pkg)}
            disabled={purchasing === pkg.id}
            activeOpacity={0.85}
          >
            {pkg.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>⭐ POPÜLER</Text>
              </View>
            )}
            <View style={styles.packageLeft}>
              <Text style={{ fontSize: 32 }}>💎</Text>
              <View>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packageCredits}>{pkg.creditAmount.toLocaleString('tr-TR')} kredi</Text>
              </View>
            </View>
            <View>
              {purchasing === pkg.id
                ? <ActivityIndicator color={pkg.isPopular ? palette.dark1 : palette.white} size="small" />
                : <Text style={[styles.packagePrice, pkg.isPopular && { color: palette.dark1 }]}>
                    ₺{(pkg.amountCents / 100).toFixed(2)}
                  </Text>
              }
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.disclaimer}>
          Ödemeler Stripe altyapısı ile güvenli şekilde işlenir.{'\n'}
          Satın alınan krediler iade edilemez.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
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
  packageName: { fontSize: typography.base, fontWeight: '700', color: palette.white },
  packageCredits: { fontSize: typography.sm, color: palette.grey3, marginTop: 2 },
  packagePrice: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  disclaimer: { color: palette.grey1, fontSize: typography.xs, textAlign: 'center', lineHeight: 18, marginTop: spacing.md },
});
