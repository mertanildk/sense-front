import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import type { ProfileStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

function MenuItem({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string; onPress: () => void; danger?: boolean;
}) {
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
  const isModerator = user?.role === 'MODERATOR';

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* Avatar & Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}

        {/* Role badge */}
        <View style={[styles.roleBadge, isModerator && styles.roleBadgeMod]}>
          <Text style={styles.roleText}>{isModerator ? '🎙️ Moderatör' : '👤 Kullanıcı'}</Text>
        </View>

        {/* Kredi */}
        <View style={styles.creditCard}>
          <Text style={styles.creditLabel}>Kredi Bakiyesi</Text>
          <Text style={styles.creditValue}>💎 {user?.creditBalance ?? 0}</Text>
          <TouchableOpacity style={styles.creditBuyBtn} onPress={() => navigation.navigate('CoinShop')}>
            <Text style={styles.creditBuyText}>Kredi Al</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="✏️" label="Profili Düzenle" onPress={() => navigation.navigate('EditProfile')} />
          <View style={styles.menuDivider} />
          <MenuItem icon="💎" label="Kredi Geçmişi" onPress={() => navigation.navigate('PaymentHistory')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="🔔" label="Bildirimler" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuItem icon="❓" label="Yardım & Destek" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem icon="🚪" label="Çıkış Yap" onPress={handleLogout} danger />
        </View>
      </View>

      <Text style={styles.version}>Sense v1.0.0</Text>
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
  roleBadge: { backgroundColor: palette.dark3, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: palette.dark4 },
  roleBadgeMod: { borderColor: palette.accent, backgroundColor: 'rgba(255,184,48,0.1)' },
  roleText: { fontSize: typography.sm, color: palette.white, fontWeight: '600' },
  creditCard: { width: '100%', backgroundColor: palette.dark2, borderRadius: radius.xl, padding: spacing.base, alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  creditLabel: { color: palette.grey2, fontSize: typography.sm },
  creditValue: { fontSize: typography.xxl, fontWeight: '800', color: palette.white },
  creditBuyBtn: { backgroundColor: palette.accent, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.full },
  creditBuyText: { color: palette.dark1, fontWeight: '800', fontSize: typography.sm },
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
