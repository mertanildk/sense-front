import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import type { ProfileStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, value, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Text style={styles.menuArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* Avatar & Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.followerCount ?? 0}</Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.followingCount ?? 0}</Text>
            <Text style={styles.statLabel}>Takip</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.coinValue]}>
              🪙 {user?.coinBalance ?? 0}
            </Text>
            <Text style={styles.statLabel}>Jeton</Text>
          </View>
        </View>
      </View>

      {/* Yayın Başlat CTA */}
      <TouchableOpacity
        style={styles.streamCta}
        onPress={() => navigation.navigate('StreamBroadcast')}
        activeOpacity={0.9}
      >
        <View>
          <Text style={styles.streamCtaTitle}>🔴 Yayın Başlat</Text>
          <Text style={styles.streamCtaSub}>Takipçilerinle canlı bağlan</Text>
        </View>
        <Text style={styles.streamCtaArrow}>→</Text>
      </TouchableOpacity>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="✏️" label="Profili Düzenle" onPress={() => navigation.navigate('EditProfile')} />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="🪙"
            label="Jeton Satın Al"
            value={`${user?.coinBalance ?? 0} jeton`}
            onPress={() => navigation.navigate('CoinShop')}
          />
          <View style={styles.menuDivider} />
          <MenuItem icon="📜" label="Ödeme Geçmişi" onPress={() => navigation.navigate('PaymentHistory')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="🔔" label="Bildirimler" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuItem icon="🔒" label="Gizlilik" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuItem icon="❓" label="Yardım & Destek" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuItem icon="📋" label="Kullanım Koşulları" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem icon="🚪" label="Çıkış Yap" onPress={handleLogout} danger />
        </View>
      </View>

      <Text style={styles.version}>LiveApp v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md },
  headerTitle: { fontSize: typography.xl, fontWeight: '800', color: palette.white },
  profileCard: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, gap: spacing.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', shadowColor: palette.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  avatarText: { fontSize: typography.xxxl, color: palette.white, fontWeight: '800' },
  username: { fontSize: typography.xl, fontWeight: '800', color: palette.white, marginTop: spacing.sm },
  email: { fontSize: typography.sm, color: palette.grey2 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, backgroundColor: palette.dark2, borderRadius: radius.xl, padding: spacing.md },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: typography.md, fontWeight: '800', color: palette.white },
  coinValue: { color: palette.accent },
  statLabel: { fontSize: typography.xs, color: palette.grey2 },
  statDivider: { width: 1, height: 36, backgroundColor: palette.dark4 },
  streamCta: { marginHorizontal: spacing.xl, marginBottom: spacing.lg, backgroundColor: palette.primary, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: palette.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  streamCtaTitle: { fontSize: typography.md, fontWeight: '800', color: palette.white },
  streamCtaSub: { fontSize: typography.sm, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  streamCtaArrow: { fontSize: typography.xl, color: palette.white, fontWeight: '300' },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sm, fontWeight: '700', color: palette.grey2, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: palette.dark2, borderRadius: radius.xl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, gap: spacing.md },
  menuIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: typography.base, color: palette.white, fontWeight: '500' },
  menuLabelDanger: { color: palette.error },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  menuValue: { fontSize: typography.sm, color: palette.grey2 },
  menuArrow: { fontSize: typography.lg, color: palette.grey1 },
  menuDivider: { height: 1, backgroundColor: palette.dark4, marginLeft: 60 },
  version: { textAlign: 'center', color: palette.grey1, fontSize: typography.xs, marginTop: spacing.md },
});
