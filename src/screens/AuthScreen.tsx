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

const TEACHER_SPECIAL_CODE = '0987654321';

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('student');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teacherAccessCode, setTeacherAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields Missing', 'Please enter your email and password.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }

    // Teacher Special Security Password Gate
    if (role === 'teacher') {
      if (teacherAccessCode.trim() !== TEACHER_SPECIAL_CODE) {
        Alert.alert(
          'Security Check Failed 🔒',
          'Invalid Teacher Access Code. Access to Teacher Portal requires the secret access key (0987654321).'
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Register new user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              username: username.trim() || email.split('@')[0],
              role: role,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create profile record in Supabase database table 'profiles'
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: email.trim(),
              username: username.trim() || email.split('@')[0],
              role: role,
              routine_visible_to_teacher: role === 'student' ? false : true,
              consistency_rate: 100,
            },
          ]);

          if (profileError && !profileError.message.includes('duplicate')) {
            console.warn('Profile sync note:', profileError.message);
          }

          Alert.alert('Account Created 🎉', 'Registration successful! Signing you in...');
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={styles.logoIcon}>✨</Text>
          <Text style={styles.title}>AURAWAY</Text>
          <Text style={styles.subtitle}>Global Student Lifestyle & Study Platform</Text>
        </View>

        {/* Role Selector Card */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'student' && styles.roleTabActiveStudent]}
            onPress={() => setRole('student')}
          >
            <Text style={styles.roleEmoji}>🧑‍🎓</Text>
            <Text style={[styles.roleLabel, role === 'student' && styles.roleTextActive]}>Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'teacher' && styles.roleTabActiveTeacher]}
            onPress={() => setRole('teacher')}
          >
            <Text style={styles.roleEmoji}>👨‍🏫</Text>
            <Text style={[styles.roleLabel, role === 'teacher' && styles.roleTextActive]}>Teacher</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isSignUp ? `Create ${role === 'student' ? 'Student' : 'Teacher'} Account` : `${role === 'student' ? 'Student' : 'Teacher'} Portal Sign In`}
          </Text>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name / Username</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex Rivers"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. alex@student.edu"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}

          {/* Teacher Security Password Gate */}
          {role === 'teacher' && (
            <View style={[styles.inputGroup, styles.teacherCodeBox]}>
              <Text style={styles.teacherCodeLabel}>🔑 Teacher Security Access Key (Required: 0987654321)</Text>
              <TextInput
                style={[styles.input, styles.teacherInput]}
                placeholder="Enter secret access code (0987654321)"
                placeholderTextColor="#A0AEC0"
                value={teacherAccessCode}
                onChangeText={setTeacherAccessCode}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, role === 'teacher' ? styles.btnTeacher : styles.btnStudent]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Register Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleAuthMode}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.toggleAuthText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  roleTabActiveStudent: {
    backgroundColor: '#00A896',
  },
  roleTabActiveTeacher: {
    backgroundColor: '#2A4365',
  },
  roleEmoji: {
    fontSize: 18,
  },
  roleLabel: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  roleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 15,
  },
  teacherCodeBox: {
    backgroundColor: 'rgba(42, 67, 101, 0.3)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3182CE',
  },
  teacherCodeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#63B3ED',
    marginBottom: 4,
  },
  teacherInput: {
    borderColor: '#3182CE',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnStudent: {
    backgroundColor: '#00A896',
  },
  btnTeacher: {
    backgroundColor: '#3182CE',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  toggleAuthMode: {
    alignItems: 'center',
    marginTop: 8,
  },
  toggleAuthText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});
