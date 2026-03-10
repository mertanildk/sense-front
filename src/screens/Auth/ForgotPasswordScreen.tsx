import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@services/authService';
import { palette, typography, spacing, radius } from '@theme/index';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) { setError('E-posta adresi girin'); return; }
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      setError('İşlem başarısız. E-posta adresinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Şifremi Unuttum</Text>
      <Text style={styles.subtitle}>
        {sent
          ? 'E-postanı kontrol et. Şifre sıfırlama bağlantısı gönderdik.'
          : 'Kayıtlı e-posta adresini gir, sıfırlama bağlantısı gönderelim.'}
      </Text>

      {!sent && (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor={palette.grey1}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={[styles.btn, isLoading && styles.btnDisabled]} onPress={handleSend} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.btnText}>Bağlantı Gönder</Text>}
          </TouchableOpacity>
        </>
      )}

      {sent && (
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Giriş Ekranına Dön</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1, paddingHorizontal: spacing.xl, paddingTop: 60 },
  backBtn: { marginBottom: spacing.xl },
  backText: { color: palette.grey2, fontSize: typography.base },
  title: { fontSize: typography.xxl, fontWeight: '800', color: palette.white },
  subtitle: { fontSize: typography.base, color: palette.grey2, marginTop: spacing.sm, marginBottom: spacing.xl, lineHeight: 22 },
  error: { color: palette.error, fontSize: typography.sm, marginBottom: spacing.sm },
  inputWrapper: { backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52, justifyContent: 'center', marginBottom: spacing.base },
  input: { color: palette.white, fontSize: typography.base },
  btn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
});
