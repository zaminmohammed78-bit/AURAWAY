package com.auraway.app.ui.teacher

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddTask
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.auraway.app.ui.theme.TeacherPrimary
import com.auraway.app.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherMainScreen(
    viewModel: MainViewModel,
    onSwitchRole: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    val students by viewModel.students.collectAsState()
    val assignedTasks by viewModel.assignedTasks.collectAsState()
    val routineItems by viewModel.routineItems.collectAsState()

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
                            color = TeacherPrimary
                        )
                        Surface(
                            shape = MaterialTheme.shapes.small,
                            color = TeacherPrimary.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "TEACHER",
                                style = MaterialTheme.typography.labelSmall,
                                color = TeacherPrimary,
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
                    icon = { Icon(Icons.Default.VerifiedUser, contentDescription = "Verification") },
                    label = { Text("Feed & Reasons") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = TeacherPrimary, indicatorColor = TeacherPrimary.copy(alpha = 0.15f))
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.AddTask, contentDescription = "Assign Task") },
                    label = { Text("Assign Work") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = TeacherPrimary, indicatorColor = TeacherPrimary.copy(alpha = 0.15f))
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.EventNote, contentDescription = "Routines") },
                    label = { Text("Student Routines") },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = TeacherPrimary, indicatorColor = TeacherPrimary.copy(alpha = 0.15f))
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
                0 -> TeacherVerificationTab(
                    students = students,
                    assignedTasks = assignedTasks,
                    onVerifyOrExcuse = { taskId -> viewModel.verifyOrExcuseTask(taskId) },
                    onExtendDeadline = { taskId, newDueDate -> viewModel.extendTaskDeadline(taskId, newDueDate) }
                )
                1 -> TeacherAssignTaskTab(
                    students = students,
                    onAssignTask = { title, subject, dueDate, instructions, targetId ->
                        viewModel.assignNewTask(title, subject, dueDate, instructions, targetId)
                        selectedTab = 0 // Switch to verification feed to see assigned task
                    }
                )
                2 -> TeacherStudentRoutineTab(
                    students = students,
                    routineItems = routineItems
                )
            }
        }
    }
}
