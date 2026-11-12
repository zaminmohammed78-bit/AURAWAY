import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './src/lib/supabase';
import type { UserProfile } from './src/types/database';
import { AuthScreen } from './src/screens/AuthScreen';
import { StudentDashboardScreen } from './src/screens/StudentDashboardScreen';
import { TeacherDashboardScreen } from './src/screens/TeacherDashboardScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadProfile = useCallback(async (userId: string) => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setProfileError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, email, username, role, routine_visible_to_teacher, consistency_rate'
        )
        .eq('id', userId)
        .maybeSingle();

      if (currentRequest !== requestId.current) return;

      if (error) {
        throw error;
      }

      if (!data) {
        setUserProfile(null);
        setProfileError(
          'Your account is signed in, but its profile could not be found. Please contact support.'
        );
        return;
      }

      if (data.role !== 'student' && data.role !== 'teacher') {
        setUserProfile(null);
        setProfileError(
          'Your account has an invalid role. Please contact support.'
        );
        return;
      }

      setUserProfile(data as UserProfile);
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      setUserProfile(null);
      setProfileError(
        error instanceof Error
          ? error.message
          : 'Unable to load your profile. Please try again.'
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let receivedAuthEvent = false;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);

      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else {
        requestId.current += 1;
        setUserProfile(null);
        setProfileError(null);
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      applySession(nextSession);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || receivedAuthEvent) return;

      if (error) {
        setProfileError('Unable to restore your session. Please sign in again.');
        setLoading(false);
        return;
      }

      applySession(data.session);
    }).catch(() => {
      if (!mounted || receivedAuthEvent) return;

      setProfileError('Unable to restore your session. Please try again.');
      setLoading(false);
    });

    return () => {
      mounted = false;
      requestId.current += 1;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const handleSignOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      setProfileError('Unable to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Loading AURAWAY...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (session && profileError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Profile unavailable</Text>
        <Text style={styles.errorMessage}>{profileError}</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => void loadProfile(session.user.id)}
        >
          <Text style={styles.actionText}>Try again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => void handleSignOut()}
        >
          <Text style={styles.actionText}>Sign out</Text>
        </TouchableOpacity>

        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {!session || !userProfile ? (
        <AuthScreen />
      ) : userProfile.role === 'teacher' ? (
        <TeacherDashboardScreen
          userProfile={userProfile}
          onSignOut={handleSignOut}
        />
      ) : (
        <StudentDashboardScreen
          userProfile={userProfile}
          onSignOut={handleSignOut}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B1020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 14,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B1020',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#F8FAFC',
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#25304A',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
