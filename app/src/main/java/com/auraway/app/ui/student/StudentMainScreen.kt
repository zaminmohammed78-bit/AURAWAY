package com.auraway.app.ui.student

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.auraway.app.model.*
import com.auraway.app.ui.theme.StudentPrimary
import com.auraway.app.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentMainScreen(
    viewModel: MainViewModel,
    onSwitchRole: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    val students by viewModel.students.collectAsState()
    val activeStudentId by viewModel.activeStudentId.collectAsState()
    val currentStudent = students.find { it.id == activeStudentId } ?: students[0]

    val routineItems by viewModel.routineItems.collectAsState()
    val assignedTasks by viewModel.assignedTasks.collectAsState()
    val wellnessData by viewModel.wellnessData.collectAsState()
    val pomodoroState by viewModel.pomodoroState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "AURAWAY",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = StudentPrimary
                        )
                        Surface(
                            shape = MaterialTheme.shapes.small,
                            color = StudentPrimary.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "STUDENT",
                                style = MaterialTheme.typography.labelSmall,
                                color = StudentPrimary,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                },
                actions = {
                    TextButton(onClick = onSwitchRole) {
                        Icon(
                            imageVector = Icons.Default.Logout,
                            contentDescription = "Switch Role",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Switch Role",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                elevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Dashboard") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = StudentPrimary, indicatorColor = StudentPrimary.copy(alpha = 0.15f))
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.EventNote, contentDescription = "Routine") },
                    label = { Text("Routine") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = StudentPrimary, indicatorColor = StudentPrimary.copy(alpha = 0.15f))
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Assignment, contentDescription = "Tasks") },
                    label = { Text("Tasks") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = StudentPrimary, indicatorColor = StudentPrimary.copy(alpha = 0.15f))
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Timer, contentDescription = "Pomodoro & Wellness") },
                    label = { Text("Focus") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = StudentPrimary, indicatorColor = StudentPrimary.copy(alpha = 0.15f))
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (selectedTab) {
                0 -> StudentDashboardTab(
                    student = currentStudent,
                    routineItems = routineItems,
                    assignedTasks = assignedTasks,
                    wellnessData = wellnessData,
                    pomodoroState = pomodoroState,
                    onNavigateToTab = { tab -> selectedTab = tab }
                )
                1 -> StudentRoutineTab(
                    isRoutineVisibleToTeacher = currentStudent.isRoutineVisibleToTeacher,
                    routineItems = routineItems,
                    onToggleVisibility = { visible -> viewModel.toggleRoutineVisibility(visible) },
                    onUpdateStatus = { itemId, status -> viewModel.markRoutineItemStatus(itemId, status) },
                    onAddRoutineItem = { title, timeSlot, cat -> viewModel.addRoutineItem(title, timeSlot, cat) },
                    onDeleteRoutineItem = { itemId -> viewModel.deleteRoutineItem(itemId) }
                )
                2 -> StudentTasksTab(
                    assignedTasks = assignedTasks,
                    onMarkAsDone = { taskId -> viewModel.markTaskAsDone(taskId) },
                    onSubmitReason = { taskId, submission -> viewModel.submitTaskReason(taskId, submission) }
                )
                3 -> Column(modifier = Modifier.fillMaxSize()) {
                    StudentPomodoroTab(
                        pomodoroState = pomodoroState,
                        onStartTimer = { viewModel.startPomodoroTimer() },
                        onPauseTimer = { viewModel.pausePomodoroTimer() },
                        onResetTimer = { viewModel.resetPomodoroTimer() },
                        onSwitchMode = { mode -> viewModel.switchPomodoroMode(mode) }
                    )
                }
            }
        }
    }
}
