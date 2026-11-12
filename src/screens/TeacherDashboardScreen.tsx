import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { UserProfile, TaskItem, RoutineItem } from '../types/database';

interface Props {
  userProfile: UserProfile;
  onSignOut: () => void;
}

export const TeacherDashboardScreen: React.FC<Props> = ({ userProfile, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'assign' | 'routines'>('feed');

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [studentRoutines, setStudentRoutines] = useState<RoutineItem[] | null>(null);

  // Quick Task Assign state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Mathematics');
  const [taskDueDate, setTaskDueDate] = useState('Tomorrow, 5:00 PM');
  const [taskInstructions, setTaskInstructions] = useState('');

  // Extend Deadline Modal
  const [taskToExtend, setTaskToExtend] = useState<TaskItem | null>(null);
  const [extendedDateInput, setExtendedDateInput] = useState('Extended by 2 Days');

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      // Fetch all students
      const { data: studentData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (studentData && studentData.length > 0) {
        setStudents(studentData);
        setSelectedStudentId(studentData[0].id);
      }

      // Fetch all assigned tasks with reason submissions
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*, reason_submissions(*)');

      if (taskData) setTasks(taskData);
    } catch (e) {
      console.log('Error fetching teacher data:', e);
    }
  };

  const inspectStudentRoutine = async (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);

    // SECURE PRIVACY GATE: If student privacy toggle is OFF, block query!
    if (!student || !student.routine_visible_to_teacher) {
      setStudentRoutines(null); // Privacy locked
      return;
    }

    try {
      const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('student_id', studentId);

      setStudentRoutines(routines || []);
    } catch (e) {
      console.log('Routine inspection error:', e);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle) {
      Alert.alert('Title Required', 'Please enter a title for the assigned task.');
      return;
    }

    try {
      const { data, error } = await supabase.from('tasks').insert([
        {
          title: taskTitle,
          subject: taskSubject,
          due_date: taskDueDate,
          instructions: taskInstructions,
          status: 'PENDING',
        },
      ]).select();

      if (error) throw error;

      if (data) {
        setTasks((prev) => [data[0], ...prev]);
        setTaskTitle('');
        setTaskInstructions('');
        setActiveTab('feed');
        Alert.alert('Task Dispatched! 🚀', 'Homework assigned and synced to all student dashboards.');
      }
    } catch (e: any) {
      Alert.alert('Dispatch Error', e.message);
    }
  };

  const handleVerifyAndExcuse = async (taskId: string) => {
    try {
      await supabase
        .from('tasks')
        .update({ status: 'EXCUSED' })
        .eq('id', taskId);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'EXCUSED' } : t))
      );

      Alert.alert('Task Excused ✓', 'Student non-completion note verified and excused.');
    } catch (e) {
      console.log('Excuse error:', e);
    }
  };

  const handleGrantExtension = async () => {
    if (!taskToExtend) return;

    try {
      await supabase
        .from('tasks')
        .update({ status: 'EXTENDED', extended_due_date: extendedDateInput })
        .eq('id', taskToExtend.id);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskToExtend.id
            ? { ...t, status: 'EXTENDED', extended_due_date: extendedDateInput }
            : t
        )
      );

      setTaskToExtend(null);
      Alert.alert('Extension Granted ⏱️', `Deadline updated to "${extendedDateInput}".`);
    } catch (e) {
      console.log('Extension error:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>AURAWAY</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TEACHER</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'feed' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Live Student Feed & Reasons</Text>

            {tasks.map((task) => (
              <View key={task.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.studentNameHeader}>Alex Rivers (🎓 Student)</Text>
                  <Text style={[styles.statusBadge, task.status === 'REASON_SUBMITTED' && styles.statusBadgeWarning]}>
                    {task.status}
                  </Text>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskSub}>Subject: {task.subject} • Due: {task.extended_due_date || task.due_date}</Text>

                {task.status === 'REASON_SUBMITTED' && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonTitle}>📌 Non-Completion Note Submitted</Text>
                    <Text style={styles.reasonText}>"Alex had a fever last night and was advised to rest."</Text>
                  </View>
                )}

                {task.status === 'REASON_SUBMITTED' && (
                  <View style={styles.rowBtns}>
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.btnSuccess]}
                      onPress={() => handleVerifyAndExcuse(task.id)}
                    >
                      <Text style={styles.smallBtnText}>Verify & Excuse</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, styles.btnTeacher]}
                      onPress={() => setTaskToExtend(task)}
                    >
                      <Text style={styles.smallBtnText}>Extend Deadline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'assign' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Assign Work to Students</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Task Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Calculus Practice Sheet"
                  placeholderTextColor="#94A3B8"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mathematics"
                  placeholderTextColor="#94A3B8"
                  value={taskSubject}
                  onChangeText={setTaskSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Due Date & Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tomorrow, 5:00 PM"
                  placeholderTextColor="#94A3B8"
                  value={taskDueDate}
                  onChangeText={setTaskDueDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instructions</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Enter short requirements for students..."
                  placeholderTextColor="#94A3B8"
                  value={taskInstructions}
                  onChangeText={setTaskInstructions}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.btnTeacherLarge} onPress={handleCreateTask}>
                <Text style={styles.btnTeacherText}>Dispatch Task to Students</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'routines' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Student Routine Inspector</Text>

            {/* Student Switcher Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {students.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.studentChip, selectedStudentId === s.id && styles.studentChipActive]}
                  onPress={() => inspectStudentRoutine(s.id)}
                >
                  <Text style={styles.studentChipText}>{s.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Routine Inspection Block */}
            {studentRoutines === null ? (
              <View style={styles.privacyLockCard}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockTitle}>Routine Encrypted & Private</Text>
                <Text style={styles.lockSub}>
                  This student has disabled teacher visibility for their routine. The database engine strictly enforces data privacy masking.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {studentRoutines.map((r) => (
                  <View key={r.id} style={styles.card}>
                    <Text style={styles.taskSub}>{r.category} • {r.time_slot}</Text>
                    <Text style={styles.taskTitle}>{r.title}</Text>
                    <Text style={{ color: r.status === 'COMPLETED' ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                      Status: {r.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('feed')}>
          <Text style={[styles.navIcon, activeTab === 'feed' && styles.navActiveText]}>🔍</Text>
          <Text style={[styles.navLabel, activeTab === 'feed' && styles.navActiveText]}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('assign')}>
          <Text style={[styles.navIcon, activeTab === 'assign' && styles.navActiveText]}>➕</Text>
          <Text style={[styles.navLabel, activeTab === 'assign' && styles.navActiveText]}>Assign</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('routines')}>
          <Text style={[styles.navIcon, activeTab === 'routines' && styles.navActiveText]}>👁️</Text>
          <Text style={[styles.navLabel, activeTab === 'routines' && styles.navActiveText]}>Routines</Text>
        </TouchableOpacity>
      </View>

      {/* Extend Deadline Modal */}
      <Modal visible={taskToExtend !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Grant Deadline Extension</Text>
            <Text style={styles.modalSub}>{taskToExtend?.title}</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Extended by 2 Days"
              placeholderTextColor="#94A3B8"
              value={extendedDateInput}
              onChangeText={setExtendedDateInput}
            />

            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setTaskToExtend(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnTeacherLarge, { flex: 1 }]} onPress={handleGrantExtension}>
                <Text style={styles.btnTeacherText}>Grant Extension</Text>
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
  brandText: { fontSize: 20, fontWeight: '800', color: '#3182CE', letterSpacing: 1 },
  badge: { backgroundColor: 'rgba(49, 130, 206, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#3182CE', fontSize: 10, fontWeight: '700' },
  signOutBtn: { borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  signOutText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  tabContent: { gap: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentNameHeader: { fontSize: 14, fontWeight: '700', color: '#63B3ED' },
  statusBadge: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  statusBadgeWarning: { color: '#F59E0B' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  taskSub: { fontSize: 12, color: '#94A3B8' },
  reasonBox: { backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: 12, borderRadius: 12, marginTop: 4 },
  reasonTitle: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  reasonText: { fontSize: 13, color: '#F8FAFC', marginTop: 2 },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  smallBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  btnSuccess: { backgroundColor: '#10B981' },
  btnTeacher: { backgroundColor: '#3182CE' },
  smallBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#CBD5E1' },
  input: { backgroundColor: '#0F172A', borderRadius: 14, padding: 12, color: '#FFF', borderWidth: 1, borderColor: '#334155' },
  btnTeacherLarge: { backgroundColor: '#3182CE', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnTeacherText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  studentChip: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  studentChipActive: { backgroundColor: '#3182CE', borderColor: '#3182CE' },
  studentChipText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  privacyLockCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 32, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  lockIcon: { fontSize: 36 },
  lockTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  lockSub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1E293B', borderTopWidth: 1, borderColor: '#334155', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 18, color: '#94A3B8' },
  navLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  navActiveText: { color: '#3182CE' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  modalSub: { fontSize: 13, color: '#63B3ED', fontWeight: '600' },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#334155' },
  cancelBtnText: { color: '#FFF', fontWeight: '700' },
});
