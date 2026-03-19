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

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!username.trim()) errors.username = 'Kullanıcı adı gerekli';
    if (!password)         errors.password = 'Şifre gerekli';
    else if (password.length < 8) errors.password = 'En az 8 karakter';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    try {
      await login({ username: username.trim(), password });
    } catch { /* error state'e yazıldı */ }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>📡</Text>
          </View>
          <Text style={styles.appName}>Sense</Text>
          <Text style={styles.tagline}>Canlı yayın platformu</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Giriş Yap</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <View style={[styles.inputWrapper, fieldErrors.username ? styles.inputError : null]}>
              <TextInput
                style={styles.input}
                placeholder="kullanici_adi"
                placeholderTextColor={palette.grey1}
                value={username}
                onChangeText={v => { setUsername(v); setFieldErrors(p => ({ ...p, username: undefined })); }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.username ? <Text style={styles.fieldError}>{fieldErrors.username}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={[styles.inputWrapper, fieldErrors.password ? styles.inputError : null]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={palette.grey1}
                value={password}
                onChangeText={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                <Text>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={palette.white} />
              : <Text style={styles.loginBtnText}>Giriş Yap</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.85}>
            <Text style={styles.registerBtnText}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.dark1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xxxl },
  logoContainer: { width: 80, height: 80, borderRadius: radius.xl, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, shadowColor: palette.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: typography.xxl, fontWeight: '800', color: palette.white, letterSpacing: -0.5 },
  tagline: { fontSize: typography.sm, color: palette.grey2, marginTop: spacing.xs },
  form: { gap: spacing.base },
  formTitle: { fontSize: typography.xl, fontWeight: '700', color: palette.white, marginBottom: spacing.sm },
  errorBanner: { backgroundColor: 'rgba(255,77,77,0.15)', borderWidth: 1, borderColor: palette.error, borderRadius: radius.md, padding: spacing.md },
  errorBannerText: { color: palette.error, fontSize: typography.sm },
  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: '600', color: palette.grey3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.dark3, borderRadius: radius.md, borderWidth: 1, borderColor: palette.dark4, paddingHorizontal: spacing.base, height: 52 },
  inputError: { borderColor: palette.error },
  input: { flex: 1, color: palette.white, fontSize: typography.base },
  eyeBtn: { padding: spacing.xs },
  fieldError: { fontSize: typography.xs, color: palette.error },
  loginBtn: { height: 54, backgroundColor: palette.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, shadowColor: palette.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: palette.dark4 },
  dividerText: { color: palette.grey1, fontSize: typography.sm },
  registerBtn: { height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.dark4 },
  registerBtnText: { color: palette.white, fontSize: typography.md, fontWeight: '600' },
});
