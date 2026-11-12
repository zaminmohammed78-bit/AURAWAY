import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { supabase } from './src/lib/supabase';
import { UserProfile } from './src/types/database';
import { AuthScreen } from './src/screens/AuthScreen';
import { StudentDashboardScreen } from './src/screens/StudentDashboardScreen';
import { TeacherDashboardScreen } from './src/screens/TeacherDashboardScreen';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Error loading profile:', error.message);
      }

      if (data) {
        setUserProfile(data);
      } else {
        // Fallback default profile from auth metadata
        const user = (await supabase.auth.getUser()).data.user;
        setUserProfile({
          id: userId,
          email: user?.email || '',
          username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'User',
          role: user?.user_metadata?.role || 'student',
          routine_visible_to_teacher: false,
          consistency_rate: 92,
        });
      }
    } catch (e) {
      console.log('Profile load exception:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserProfile(null);
    setSession(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A896" />
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
        <TeacherDashboardScreen userProfile={userProfile} onSignOut={handleSignOut} />
      ) : (
        <StudentDashboardScreen userProfile={userProfile} onSignOut={handleSignOut} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
