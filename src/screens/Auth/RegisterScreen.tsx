import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/authStore';
import { palette, typography, spacing, radius } from '@theme/index';
import type { AuthStackParamList } from '@appTypes/index';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof typeof form, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.username.trim()) errors.username = 'Kullanıcı adı gerekli';
    else if (form.username.length < 3) errors.username = 'En az 3 karakter';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errors.username = 'Sadece harf, rakam ve _';
    if (!form.email.trim()) errors.email = 'E-posta gerekli';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Geçerli e-posta girin';
    if (!form.password) errors.password = 'Şifre gerekli';
    else if (form.password.length < 8) errors.password = 'En az 8 karakter';
    if (form.password !== form.confirm) errors.confirm = 'Şifreler eşleşmiyor';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    try {
      await register({ username: form.username, email: form.email.toLowerCase(), password: form.password });
    } catch { /* handled in store */ }
  };

  const fields: Array<{ key: keyof typeof form; label: string; placeholder: string; secure?: boolean; keyboard?: 'default' | 'email-address' }> = [
    { key: 'username', label: 'Kullanıcı Adı', placeholder: 'kullanici_adi' },
    { key: 'email', label: 'E-posta', placeholder: 'ornek@email.com', keyboard: 'email-address' },
    { key: 'password', label: 'Şifre', placeholder: '••••••••', secure: true },
    { key: 'confirm', label: 'Şifre Tekrar', placeholder: '••••••••', secure: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Saniyeler içinde yayına başla</Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          {fields.map(field => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={[styles.inputWrapper, fieldErrors[field.key] ? styles.inputError : null]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={palette.grey1}
                  value={form[field.key]}
                  onChangeText={v => setField(field.key, v)}
                  secureTextEntry={field.secure && !showPass}
                  keyboardType={field.keyboard ?? 'default'}
                  autoCapitalize={field.keyboard === 'email-address' ? 'none' : field.key === 'username' ? 'none' : 'sentences'}
                  autoCorrect={false}
                />
                {field.key === 'password' && (
                  <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                    <Text>{showPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {fieldErrors[field.key] && <Text style={styles.fieldError}>{fieldErrors[field.key]}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.registerBtn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.registerBtnText}>Kayıt Ol</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Zaten hesabın var mı? <Text style={styles.loginLinkBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.xxl },
  backBtn: { marginBottom: spacing.xl },
  backText: { color: palette.grey2, fontSize: typography.base },
  title: { fontSize: typography.xxl, fontWeight: '800', color: palette.white, letterSpacing: -0.5 },
  subtitle: { fontSize: typography.base, color: palette.grey2, marginTop: spacing.xs, marginBottom: spacing.xl },
  errorBanner: { backgroundColor: 'rgba(255,77,77,0.15)', borderWidth: 1, borderColor: palette.error, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  errorText: { color: palette.error, fontSize: typography.sm },
  form: { gap: spacing.base },
  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: '600', color: palette.grey3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52 },
  inputError: { borderColor: palette.error },
  input: { color: palette.white, fontSize: typography.base },
  eyeBtn: { padding: spacing.xs },
  fieldError: { fontSize: typography.xs, color: palette.error },
  registerBtn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, shadowColor: palette.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnDisabled: { opacity: 0.6 },
  registerBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: spacing.sm },
  loginLinkText: { color: palette.grey2, fontSize: typography.sm },
  loginLinkBold: { color: palette.primary, fontWeight: '700' },
});
