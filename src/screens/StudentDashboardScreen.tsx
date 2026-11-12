import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { UserProfile, RoutineItem, TaskItem } from '../types/database';

interface Props {
  userProfile: UserProfile;
  onSignOut: () => void;
}

export const StudentDashboardScreen: React.FC<Props> = ({ userProfile, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'dash' | 'routine' | 'tasks' | 'focus'>('dash');

  const [isRoutineVisible, setIsRoutineVisible] = useState(userProfile.routine_visible_to_teacher);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [selectedMood, setSelectedMood] = useState('😊 Focused');
  const [loading, setLoading] = useState(false);

  // Reason Modal state
  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [submitter, setSubmitter] = useState<'STUDENT' | 'PARENT'>('STUDENT');
  const [reasonTag, setReasonTag] = useState('Unwell / Sick');
  const [reasonNote, setReasonNote] = useState('');

  // Pomodoro state
  const [pomodoroSeconds, setPomodoroSeconds] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [userProfile.id]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
      Alert.alert('Pomodoro Focus Session Completed! 🎉', 'Take a well-deserved 5-minute break.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch Routines
      const { data: routineData } = await supabase
        .from('routines')
        .select('*')
        .eq('student_id', userProfile.id);

      if (routineData) setRoutines(routineData);

      // Fetch Tasks assigned to student or all
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*');

      if (taskData) setTasks(taskData);
    } catch (e) {
      console.log('Error fetching student data:', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacySwitch = async (value: boolean) => {
    setIsRoutineVisible(value);
    try {
      await supabase
        .from('profiles')
        .update({ routine_visible_to_teacher: value })
        .eq('id', userProfile.id);
    } catch (e) {
      console.log('Privacy update error:', e);
    }
  };

  const toggleRoutineStatus = async (item: RoutineItem, newStatus: 'COMPLETED' | 'MISSED') => {
    const updatedStatus = item.status === newStatus ? 'PENDING' : newStatus;
    setRoutines((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: updatedStatus } : r))
    );

    try {
      await supabase
        .from('routines')
        .update({ status: updatedStatus })
        .eq('id', item.id);
    } catch (e) {
      console.log('Routine update error:', e);
    }
  };

  const handleMarkTaskDone = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'DONE' } : t))
    );

    try {
      await supabase
        .from('tasks')
        .update({ status: 'DONE' })
        .eq('id', taskId);
    } catch (e) {
      console.log('Task update error:', e);
    }
  };

  const handleSubmitReason = async () => {
    if (!modalTask) return;

    try {
      await supabase.from('reason_submissions').insert([
        {
          task_id: modalTask.id,
          student_id: userProfile.id,
          submitted_by: submitter,
          reason_tag: reasonTag,
          note: reasonNote || reasonTag,
        },
      ]);

      await supabase
        .from('tasks')
        .update({ status: 'REASON_SUBMITTED' })
        .eq('id', modalTask.id);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === modalTask.id
            ? {
                ...t,
                status: 'REASON_SUBMITTED',
                reason_submission: {
                  id: 'r_' + Date.now(),
                  task_id: modalTask.id,
                  student_id: userProfile.id,
                  submitted_by: submitter,
                  reason_tag: reasonTag,
                  note: reasonNote || reasonTag,
                },
              }
            : t
        )
      );

      setModalTask(null);
      setReasonNote('');
      Alert.alert('Note Submitted 📩', 'Your teacher has been notified of your non-completion note.');
    } catch (e) {
      console.log('Reason submission error:', e);
    }
  };

  const mins = String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0');
  const secs = String(pomodoroSeconds % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>AURAWAY</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>STUDENT</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'dash' && (
          <View style={styles.tabContent}>
            {/* Banner */}
            <View style={styles.greetingCard}>
              <Text style={styles.greetingTitle}>Hello, {userProfile.username} 🎓</Text>
              <Text style={styles.greetingSub}>Wednesday, Feb 26</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakNumber}>{userProfile.consistency_rate || 92}%</Text>
                <Text style={styles.streakLabel}>Streak</Text>
              </View>
            </View>

            {/* Quick Cards */}
            <View style={styles.rowCards}>
              <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab('routine')}>
                <Text style={styles.statLabel}>DAILY ROUTINE</Text>
                <Text style={styles.statValue}>
                  {routines.filter((r) => r.status === 'COMPLETED').length} / {routines.length} Done
                </Text>
                <Text style={styles.statSub}>{isRoutineVisible ? '👁️ Shared with Teacher' : '🔒 Encrypted Private'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab('tasks')}>
                <Text style={styles.statLabel}>ASSIGNED WORK</Text>
                <Text style={styles.statValue}>
                  {tasks.filter((t) => t.status === 'PENDING').length} Pending
                </Text>
                <Text style={styles.statSub}>Tap to manage</Text>
              </TouchableOpacity>
            </View>

            {/* Hydration Goal */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💧 Hydration Tracker</Text>
              <Text style={styles.cardSub}>{waterGlasses} / 8 Glasses Hydrated Today</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setWaterGlasses((prev) => Math.min(8, prev + 1))}
              >
                <Text style={styles.actionBtnText}>+ Add Water Glass</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'routine' && (
          <View style={styles.tabContent}>
            {/* Privacy Toggle Card */}
            <View style={styles.privacyCard}>
              <View style={styles.privacyTextGroup}>
                <Text style={styles.privacyTitle}>Visible to Teacher</Text>
                <Text style={styles.privacySub}>
                  {isRoutineVisible
                    ? 'Teacher can view your active routine'
                    : 'Private mode: Routine is strictly encrypted from teacher'}
                </Text>
              </View>
              <Switch
                value={isRoutineVisible}
                onValueChange={togglePrivacySwitch}
                trackColor={{ false: '#334155', true: '#00A896' }}
              />
            </View>

            <Text style={styles.sectionHeader}>Daily Time Blocks ({routines.length})</Text>

            {routines.map((item) => (
              <View key={item.id} style={styles.routineCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryTag}>{item.category} • {item.time_slot}</Text>
                  <Text style={styles.routineTitle}>{item.title}</Text>
                </View>
                <View style={styles.tickCrossRow}>
                  <TouchableOpacity
                    style={[styles.btnCircle, item.status === 'COMPLETED' && styles.btnCircleSuccess]}
                    onPress={() => toggleRoutineStatus(item, 'COMPLETED')}
                  >
                    <Text style={styles.btnSymbol}>✓</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnCircle, item.status === 'MISSED' && styles.btnCircleDanger]}
                    onPress={() => toggleRoutineStatus(item, 'MISSED')}
                  >
                    <Text style={styles.btnSymbol}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Assigned Homework ({tasks.length})</Text>

            {tasks.map((task) => (
              <View key={task.id} style={styles.card}>
                <View style={styles.taskHeader}>
                  <Text style={styles.subjectTag}>{task.subject}</Text>
                  <Text style={styles.statusBadge}>{task.status}</Text>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDesc}>{task.instructions}</Text>
                <Text style={styles.dueDateText}>⏱️ Due: {task.extended_due_date || task.due_date}</Text>

                {task.status === 'PENDING' || task.status === 'REASON_SUBMITTED' ? (
                  <View style={styles.rowBtns}>
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.btnSuccess]}
                      onPress={() => handleMarkTaskDone(task.id)}
                    >
                      <Text style={styles.smallBtnText}>Mark Done</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, styles.btnOutlineDanger]}
                      onPress={() => setModalTask(task)}
                    >
                      <Text style={[styles.smallBtnText, { color: '#EF4444' }]}>Submit Reason</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'focus' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Pomodoro Focus Hub</Text>
            <View style={styles.timerCircle}>
              <Text style={styles.timerTime}>{mins}:{secs}</Text>
              <Text style={styles.timerLabel}>{isTimerRunning ? 'In Progress...' : 'Paused'}</Text>
            </View>

            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={[styles.actionBtn, { flex: 1 }]}
                onPress={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Text style={styles.actionBtnText}>{isTimerRunning ? 'Pause' : 'Start Focus (25m)'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#334155' }]}
                onPress={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(1500);
                }}
              >
                <Text style={styles.actionBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('dash')}>
          <Text style={[styles.navIcon, activeTab === 'dash' && styles.navActiveText]}>📊</Text>
          <Text style={[styles.navLabel, activeTab === 'dash' && styles.navActiveText]}>Dash</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('routine')}>
          <Text style={[styles.navIcon, activeTab === 'routine' && styles.navActiveText]}>📅</Text>
          <Text style={[styles.navLabel, activeTab === 'routine' && styles.navActiveText]}>Routine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('tasks')}>
          <Text style={[styles.navIcon, activeTab === 'tasks' && styles.navActiveText]}>📝</Text>
          <Text style={[styles.navLabel, activeTab === 'tasks' && styles.navActiveText]}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('focus')}>
          <Text style={[styles.navIcon, activeTab === 'focus' && styles.navActiveText]}>⏱️</Text>
          <Text style={[styles.navLabel, activeTab === 'focus' && styles.navActiveText]}>Focus</Text>
        </TouchableOpacity>
      </View>

      {/* Reason Submission Modal */}
      <Modal visible={modalTask !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Reason Note</Text>
            <Text style={styles.modalSub}>{modalTask?.title}</Text>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.chip, submitter === 'STUDENT' && styles.chipActive]}
                onPress={() => setSubmitter('STUDENT')}
              >
                <Text style={styles.chipText}>🧑‍🎓 Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, submitter === 'PARENT' && styles.chipActive]}
                onPress={() => setSubmitter('PARENT')}
              >
                <Text style={styles.chipText}>👨‍👩‍👦 Parent</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter brief explanation for teacher..."
              placeholderTextColor="#94A3B8"
              value={reasonNote}
              onChangeText={setReasonNote}
              multiline
            />

            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalTask(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={handleSubmitReason}>
                <Text style={styles.actionBtnText}>Submit Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 20, fontWeight: '800', color: '#00A896', letterSpacing: 1 },
  badge: { backgroundColor: 'rgba(0, 168, 150, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#00A896', fontSize: 10, fontWeight: '700' },
  signOutBtn: { borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  signOutText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  tabContent: { gap: 16 },
  greetingCard: {
    backgroundColor: '#00A896',
    borderRadius: 24,
    padding: 24,
    color: '#FFF',
    position: 'relative',
  },
  greetingTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  greetingSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  streakBadge: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNumber: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  streakLabel: { fontSize: 9, color: '#FFF', textTransform: 'uppercase' },
  rowCards: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#00A896', marginVertical: 4 },
  statSub: { fontSize: 11, color: '#94A3B8' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  cardSub: { fontSize: 13, color: '#94A3B8' },
  actionBtn: { backgroundColor: '#00A896', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  privacyCard: {
    backgroundColor: 'rgba(0, 168, 150, 0.1)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#00A896',
  },
  privacyTextGroup: { flex: 1, paddingRight: 12 },
  privacyTitle: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  privacySub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  routineCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryTag: { fontSize: 11, color: '#00A896', fontWeight: '700' },
  routineTitle: { fontSize: 15, fontWeight: '700', color: '#F8FAFC', marginTop: 2 },
  tickCrossRow: { flexDirection: 'row', gap: 8 },
  btnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCircleSuccess: { backgroundColor: '#10B981' },
  btnCircleDanger: { backgroundColor: '#EF4444' },
  btnSymbol: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectTag: { fontSize: 11, fontWeight: '700', color: '#00A896' },
  statusBadge: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  taskDesc: { fontSize: 13, color: '#94A3B8' },
  dueDateText: { fontSize: 12, color: '#94A3B8' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  smallBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  btnSuccess: { backgroundColor: '#10B981' },
  btnOutlineDanger: { borderWidth: 1, borderColor: '#EF4444' },
  smallBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#00A896',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  timerTime: { fontSize: 44, fontWeight: '800', color: '#00A896' },
  timerLabel: { fontSize: 13, color: '#94A3B8' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 18, color: '#94A3B8' },
  navLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  navActiveText: { color: '#00A896' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  modalSub: { fontSize: 13, color: '#00A896', fontWeight: '600' },
  modalRow: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  chipActive: { backgroundColor: '#00A896' },
  chipText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  modalInput: { backgroundColor: '#0F172A', borderRadius: 14, padding: 12, color: '#FFF', height: 80 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: '#334155' },
  cancelBtnText: { color: '#FFF', fontWeight: '700' },
});
