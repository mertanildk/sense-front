import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '@services/api';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!username.trim() || username.trim().length < 3) { setError('En az 3 karakter'); return; }
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.put('/users/me', { username: username.trim() });
      updateUser(data.data);
      navigation.goBack();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Güncellenemedi');
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
        <Text style={styles.title}>Profili Düzenle</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Fotoğraf Değiştir</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholderTextColor={palette.grey1} autoCapitalize="none" />
        </View>
        <TouchableOpacity style={[styles.saveBtn, isLoading && styles.btnDisabled]} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 54, paddingBottom: spacing.md },
  backText: { color: palette.white, fontSize: typography.xl },
  title: { fontSize: typography.md, fontWeight: '700', color: palette.white },
  form: { padding: spacing.xl, gap: spacing.xl },
  avatarContainer: { alignItems: 'center', gap: spacing.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.xxxl, color: palette.white, fontWeight: '800' },
  changePhotoText: { color: palette.primary, fontWeight: '600', fontSize: typography.sm },
  error: { color: palette.error, fontSize: typography.sm },
  fieldGroup: { gap: spacing.xs },
  label: { color: palette.grey3, fontSize: typography.sm, fontWeight: '600' },
  input: { backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52, color: palette.white, fontSize: typography.base },
  saveBtn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
});
