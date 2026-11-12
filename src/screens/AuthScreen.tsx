import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types/database';

const COLORS = {
  background: '#0B1020',
  surface: '#151E33',
  card: '#1B2740',
  primary: '#8B5CF6',
  secondary: '#22C3A6',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#293650',
};

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required Fields Missing', 'Please enter your email and password.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }

    // Teacher accounts are provisioned by an administrator. Public sign-up is student-only.
    if (isSignUp && role === 'teacher') {
      Alert.alert(
        'Teacher Account Required',
        'Teacher accounts are created by an administrator. Please sign in with your existing teacher account.'
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim() || email.trim().split('@')[0],
              role: 'student',
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: email.trim(),
              username: username.trim() || email.trim().split('@')[0],
              role: 'student',
              routine_visible_to_teacher: false,
              consistency_rate: 100,
            },
          ]);

          if (profileError && !profileError.message.includes('duplicate')) {
            console.warn('Profile sync note:', profileError.message);
          }

          Alert.alert('Account Created', 'Registration successful! Signing you in...');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp((current) => !current);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>
          <Text style={styles.eyebrow}>YOUR SPACE TO GROW</Text>
          <Text style={styles.title}>AURA<Text style={styles.titleAccent}>WAY</Text></Text>
          <Text style={styles.subtitle}>Study smarter. Live better. Find your rhythm.</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.roleTab, role === 'student' && styles.roleTabActive]}
            onPress={() => setRole('student')}
          >
            <Text style={styles.roleEmoji}>🎓</Text>
            <Text style={[styles.roleLabel, role === 'student' && styles.roleTextActive]}>Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.roleTab, role === 'teacher' && styles.roleTabActiveTeacher]}
            onPress={() => setRole('teacher')}
          >
            <Text style={styles.roleEmoji}>📘</Text>
            <Text style={[styles.roleLabel, role === 'teacher' && styles.roleTextActive]}>Teacher</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <View>
              <Text style={styles.cardEyebrow}>{isSignUp ? 'GET STARTED' : 'WELCOME BACK'}</Text>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'Create your account' : 'Sign in to AURAWAY'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isSignUp ? 'A fresh start begins here.' : `Continue as a ${role}.`}
              </Text>
            </View>
            <View style={styles.headingOrb}>
              <Text style={styles.headingOrbText}>{role === 'student' ? '✧' : '⌑'}</Text>
            </View>
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME / USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType={isSignUp ? 'newPassword' : 'password'}
            />
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={COLORS.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>
          )}

          {role === 'teacher' && isSignUp && (
            <View style={styles.notice}>
              <Text style={styles.noticeIcon}>ⓘ</Text>
              <Text style={styles.noticeText}>
                Teacher accounts are created by an administrator. Switch to Sign In to access an existing account.
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.88}
            style={[
              styles.submitButton,
              role === 'teacher' ? styles.submitTeacher : styles.submitStudent,
              loading && styles.submitDisabled,
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
                <Text style={styles.submitArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleAuthMode} onPress={switchMode}>
            <Text style={styles.togglePrompt}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Text style={styles.toggleAction}>{isSignUp ? 'Sign In' : 'Create one'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>AURAWAY  •  YOUR JOURNEY, YOUR PACE</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -125,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.13)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -150,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(34, 195, 166, 0.08)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 32,
    color: '#C4B5FD',
  },
  eyebrow: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 5,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 3,
  },
  titleAccent: {
    color: '#A78BFA',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 17,
    padding: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 13,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: COLORS.primary,
  },
  roleTabActiveTeacher: {
    backgroundColor: '#315A83',
  },
  roleEmoji: {
    fontSize: 17,
  },
  roleLabel: {
    color: COLORS.muted,
    fontWeight: '700',
    fontSize: 14,
  },
  roleTextActive: {
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 25,
    padding: 22,
    gap: 17,
    borderWidth: 1,
    borderColor: '#34425E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardEyebrow: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  headingOrb: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingOrbText: {
    color: '#C4B5FD',
    fontSize: 25,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#C5CEE0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: 'rgba(49, 90, 131, 0.18)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  noticeIcon: {
    color: '#93C5FD',
    fontSize: 16,
    fontWeight: '800',
  },
  noticeText: {
    flex: 1,
    color: '#BFDBFE',
    fontSize: 11,
    lineHeight: 17,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 2,
    gap: 10,
  },
  submitStudent: {
    backgroundColor: COLORS.primary,
  },
  submitTeacher: {
    backgroundColor: '#315A83',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 15,
  },
  submitArrow: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  toggleAuthMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 1,
  },
  togglePrompt: {
    color: COLORS.muted,
    fontSize: 12,
  },
  toggleAction: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 24,
  },
});
