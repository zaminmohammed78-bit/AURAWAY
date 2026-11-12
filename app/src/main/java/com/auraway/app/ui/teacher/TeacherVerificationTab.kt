package com.auraway.app.ui.teacher

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EventRepeat
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.auraway.app.model.AssignedTask
import com.auraway.app.model.StudentProfile
import com.auraway.app.model.TaskStatus
import com.auraway.app.ui.student.StatusBadge
import com.auraway.app.ui.theme.ErrorRed
import com.auraway.app.ui.theme.SuccessGreen
import com.auraway.app.ui.theme.TeacherPrimary
import com.auraway.app.ui.theme.WarningOrange

@Composable
fun TeacherVerificationTab(
    students: List<StudentProfile>,
    assignedTasks: List<AssignedTask>,
    onVerifyOrExcuse: (String) -> Unit,
    onExtendDeadline: (String, String) -> Unit
) {
    var taskToExtend by remember { mutableStateOf<AssignedTask?>(null) }
    var extendedDateInput by remember { mutableStateOf("Extended by 2 Days (Next Mon, 5 PM)") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Column {
            Text(
                text = "Live Task Feed & Reason Verification",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = TeacherPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Review submitted student/parent notes, excuse absences, or grant deadline extensions",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(assignedTasks, key = { it.id }) { task ->
                val assignedStudent = students.find { it.id == task.assignedToStudentId }
                TeacherTaskItemCard(
                    task = task,
                    assignedStudent = assignedStudent,
                    onVerifyOrExcuse = { onVerifyOrExcuse(task.id) },
                    onOpenExtendDialog = {
                        taskToExtend = task
                    }
                )
            }
        }
    }

    // Extend Deadline Modal Dialog
    taskToExtend?.let { task ->
        AlertDialog(
            onDismissRequest = { taskToExtend = null },
            title = { Text("Extend Task Deadline", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Original Due Date: ${task.dueDate}", style = MaterialTheme.typography.bodyMedium)
                    OutlinedTextField(
                        value = extendedDateInput,
                        onValueChange = { extendedDateInput = it },
                        label = { Text("New Due Date & Time") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (extendedDateInput.isNotBlank()) {
                            onExtendDeadline(task.id, extendedDateInput)
                            taskToExtend = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TeacherPrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Grant Extension")
                }
            },
            dismissButton = {
                TextButton(onClick = { taskToExtend = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun TeacherTaskItemCard(
    task: AssignedTask,
    assignedStudent: StudentProfile?,
    onVerifyOrExcuse: () -> Unit,
    onOpenExtendDialog: () -> Unit
) {
    val isReasonSubmitted = task.status == TaskStatus.REASON_SUBMITTED

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isReasonSubmitted) WarningOrange.copy(alpha = 0.05f) else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Row: Student name / target + Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = if (assignedStudent != null) "${assignedStudent.avatarEmoji} ${assignedStudent.name}" else "👥 All Class Students",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TeacherPrimary
                    )
                }

                StatusBadge(status = task.status)
            }

            // Task Details
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Subject: ${task.subject} • Due: ${task.extendedDueDate ?: task.dueDate}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Highlight Reason Submitted Box
            if (isReasonSubmitted && task.reasonSubmission != null) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = WarningOrange.copy(alpha = 0.12f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = WarningOrange,
                                modifier = Modifier.size(24.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text("!", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                            Text(
                                text = "Non-Completion Note (${task.reasonSubmission.submittedBy.name} Submission)",
                                style = MaterialTheme.typography.labelMedium,
                                color = WarningOrange,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Text(
                            text = "Reason Category: ${task.reasonSubmission.reasonTag.label}",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold
                        )

                        Text(
                            text = "\"${task.reasonSubmission.note}\"",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Action Buttons for Teacher
            if (isReasonSubmitted) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onVerifyOrExcuse,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Verified, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Verify & Excuse", fontSize = 13.sp)
                    }

                    OutlinedButton(
                        onClick = onOpenExtendDialog,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TeacherPrimary)
                    ) {
                        Icon(imageVector = Icons.Default.EventRepeat, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Extend Deadline", fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
