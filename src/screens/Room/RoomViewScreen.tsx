import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { palette, typography, spacing, radius } from '@theme/index';
import type { RoomStackParamList } from '@appTypes/index';

type RouteType = RouteProp<RoomStackParamList, 'RoomView'>;

export default function RoomViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { roomId, inviteCode } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `LiveApp'te benim odama katıl! Kod: ${inviteCode ?? roomId}\n\nUygulama linki buraya`,
      });
    } catch { /* handled */ }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Özel Oda</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareText}>Davet Et</Text>
        </TouchableOpacity>
      </View>

      {/* Video Area */}
      <View style={styles.videoArea}>
        <Text style={styles.videoPlaceholder}>📹 Agora RTC</Text>
        <Text style={styles.videoSub}>Özel oda yayını burada görünecek</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Oda ID: {roomId}</Text>
        {inviteCode && (
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Davet Kodu</Text>
            <Text style={styles.codeValue}>{inviteCode}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.leaveBtn}
        onPress={() => Alert.alert('Odadan Ayrıl', 'Odadan ayrılmak istiyor musun?', [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayrıl', style: 'destructive', onPress: () => navigation.goBack() },
        ])}
      >
        <Text style={styles.leaveBtnText}>Odadan Ayrıl</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.dark3, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: palette.white },
  headerTitle: { fontSize: typography.md, fontWeight: '700', color: palette.white },
  shareText: { color: palette.primary, fontWeight: '700' },
  videoArea: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.dark3, margin: spacing.xl, borderRadius: radius.xl, gap: spacing.sm },
  videoPlaceholder: { fontSize: 48 },
  videoSub: { color: palette.grey2, fontSize: typography.sm },
  info: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md, alignItems: 'center' },
  infoText: { color: palette.grey2, fontSize: typography.sm },
  codeBox: { backgroundColor: palette.dark2, borderRadius: radius.lg, padding: spacing.base, alignItems: 'center', gap: spacing.xs },
  codeLabel: { color: palette.grey2, fontSize: typography.xs, fontWeight: '600' },
  codeValue: { color: palette.white, fontSize: typography.xl, fontWeight: '800', letterSpacing: 4 },
  leaveBtn: { marginHorizontal: spacing.xl, marginBottom: 40, height: 54, backgroundColor: palette.error, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  leaveBtnText: { color: palette.white, fontWeight: '700', fontSize: typography.md },
});
