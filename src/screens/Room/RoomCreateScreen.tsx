// RoomCreateScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '@services/api';
import { palette, typography, spacing, radius } from '@theme/index';
import type { RoomStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<RoomStackParamList, 'RoomCreate'>;

export default function RoomCreateScreen() {
  const navigation = useNavigation<NavProp>();
  const [title, setTitle] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [maxMembers, setMaxMembers] = useState('10');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert('Hata', 'Oda başlığı gerekli'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/rooms', {
        title: title.trim(),
        isLocked,
        maxMembers: parseInt(maxMembers, 10) || 10,
      });
      navigation.replace('RoomView', { roomId: data.data.id });
    } catch {
      Alert.alert('Hata', 'Oda oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Oda Oluştur</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Oda Adı</Text>
          <TextInput style={styles.input} placeholder="Odana bir isim ver..." placeholderTextColor={palette.grey1} value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Maksimum Üye</Text>
          <TextInput style={styles.input} placeholder="10" placeholderTextColor={palette.grey1} value={maxMembers} onChangeText={setMaxMembers} keyboardType="number-pad" />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Gizli Oda</Text>
            <Text style={styles.switchSub}>Sadece davet linki ile katılabilir</Text>
          </View>
          <Switch value={isLocked} onValueChange={setIsLocked} trackColor={{ true: palette.primary }} />
        </View>

        <TouchableOpacity style={[styles.createBtn, isLoading && styles.btnDisabled]} onPress={handleCreate} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.createBtnText}>Oda Oluştur</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
  backText: { color: palette.white, fontSize: typography.xl },
  title: { fontSize: typography.md, fontWeight: '700', color: palette.white },
  form: { padding: spacing.xl, gap: spacing.lg },
  fieldGroup: { gap: spacing.xs },
  label: { color: palette.grey3, fontSize: typography.sm, fontWeight: '600' },
  input: { backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52, color: palette.white, fontSize: typography.base },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.dark2, borderRadius: radius.xl, padding: spacing.base },
  switchLabel: { color: palette.white, fontWeight: '600', fontSize: typography.base },
  switchSub: { color: palette.grey2, fontSize: typography.xs, marginTop: 2 },
  createBtn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  createBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
});
